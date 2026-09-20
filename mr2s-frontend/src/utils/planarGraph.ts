import type { ParsedGraph } from "../types.ts";
import { optimizeLayout, type LayoutGraph } from "./planarLayout.ts";

/**
 * Generates a random planar graph using Delaunay triangulation.
 * Points are placed randomly in a 2D plane, then triangulated
 * to guarantee planarity and connectivity.
 * Optionally removes edges to control density, then applies
 * force-directed layout optimization.
 */
export function generateRandomPlanarGraph(nodeCount: number): ParsedGraph {
  if (nodeCount < 3) {
    throw new Error("At least 3 nodes are required");
  }

  const points = generatePoints(nodeCount);
  const edgeSet = new Set<string>();
  const triangles = delaunayTriangulate(points);

  for (const [a, b, c] of triangles) {
    addEdge(edgeSet, a, b);
    addEdge(edgeSet, b, c);
    addEdge(edgeSet, a, c);
  }

  // Build 0-indexed edge list and adjacency
  const edges0: [number, number][] = [];
  for (const key of edgeSet) {
    const [u, v] = key.split(",").map(Number);
    edges0.push([u, v]);
  }

  // Remove edges to 65-75% density while keeping connectivity and min degree 2
  const maxEdges = 3 * nodeCount - 6;
  const targetEdges = Math.max(
    nodeCount,
    Math.floor(maxEdges * (0.65 + Math.random() * 0.1)),
  );
  const reduced = removeEdges(edges0, nodeCount, targetEdges);

  // Apply force-directed layout using Delaunay positions as initial
  const layoutInput: LayoutGraph = {
    n: nodeCount,
    edges: reduced,
    positions: points,
  };
  const laid = optimizeLayout(layoutInput);

  // Convert to 1-indexed ParsedGraph with positions
  const SCALE = 6;
  const vertices = Array.from({ length: nodeCount }, (_, i) => i + 1);
  const edges: [number, number][] = reduced.map(([u, v]) => [u + 1, v + 1]);
  const positions: Record<number, { x: number; y: number }> = {};
  for (let i = 0; i < nodeCount; i++) {
    positions[i + 1] = { x: laid.positions[i][0] * SCALE, y: laid.positions[i][1] * SCALE };
  }

  return { vertices, edges, positions };
}

function removeEdges(
  edges: [number, number][],
  n: number,
  target: number,
): [number, number][] {
  if (edges.length <= target) return edges;

  const adj = Array.from({ length: n }, () => new Set<number>());
  for (const [u, v] of edges) {
    adj[u].add(v);
    adj[v].add(u);
  }

  const shuffled = [...edges];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const result = new Set(edges.map(([u, v]) => `${u},${v}`));

  for (const [u, v] of shuffled) {
    if (result.size <= target) break;
    if (adj[u].size <= 2 || adj[v].size <= 2) continue;
    // Check connectivity: would removing this edge disconnect?
    adj[u].delete(v);
    adj[v].delete(u);
    if (isConnected(adj, n)) {
      result.delete(`${u},${v}`);
    } else {
      adj[u].add(v);
      adj[v].add(u);
    }
  }

  return [...result].map((k) => {
    const [u, v] = k.split(",").map(Number);
    return [u, v];
  });
}

function isConnected(adj: Set<number>[], n: number): boolean {
  const visited = new Set<number>();
  const stack = [0];
  visited.add(0);
  while (stack.length > 0) {
    const v = stack.pop()!;
    for (const u of adj[v]) {
      if (!visited.has(u)) {
        visited.add(u);
        stack.push(u);
      }
    }
  }
  return visited.size === n;
}

function addEdge(set: Set<string>, a: number, b: number) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  set.add(`${lo},${hi}`);
}

function generatePoints(n: number): [number, number][] {
  const points: [number, number][] = [];
  const gridSize = Math.ceil(Math.sqrt(n)) * 10;
  const minDist = gridSize / (Math.sqrt(n) * 1.5);

  for (let i = 0; i < n; i++) {
    let attempts = 0;
    while (attempts < 200) {
      const x = Math.random() * gridSize;
      const y = Math.random() * gridSize;
      let valid = true;
      for (const [px, py] of points) {
        if (Math.hypot(x - px, y - py) < minDist) {
          valid = false;
          break;
        }
      }
      if (valid) {
        points.push([x, y]);
        break;
      }
      attempts++;
    }
    if (points.length <= i) {
      points.push([Math.random() * gridSize, Math.random() * gridSize]);
    }
  }
  return points;
}

// ----- Bowyer-Watson Delaunay Triangulation -----

type Triangle = [number, number, number];

function delaunayTriangulate(points: [number, number][]): Triangle[] {
  const n = points.length;
  const superSize = 10000;
  const allPoints: [number, number][] = [
    ...points,
    [-superSize, -superSize],
    [2 * superSize, -superSize],
    [0, 2 * superSize],
  ];
  const s0 = n, s1 = n + 1, s2 = n + 2;

  let triangles: Triangle[] = [[s0, s1, s2]];

  for (let i = 0; i < n; i++) {
    const [px, py] = allPoints[i];
    const bad: Triangle[] = [];
    const good: Triangle[] = [];

    for (const tri of triangles) {
      if (inCircumcircle(allPoints, tri, px, py)) {
        bad.push(tri);
      } else {
        good.push(tri);
      }
    }

    const boundary: [number, number][] = [];
    for (const tri of bad) {
      const edges: [number, number][] = [
        [tri[0], tri[1]],
        [tri[1], tri[2]],
        [tri[2], tri[0]],
      ];
      for (const [ea, eb] of edges) {
        let shared = false;
        for (const other of bad) {
          if (other === tri) continue;
          if (triHasEdge(other, ea, eb)) {
            shared = true;
            break;
          }
        }
        if (!shared) boundary.push([ea, eb]);
      }
    }

    triangles = good;
    for (const [ea, eb] of boundary) {
      triangles.push([i, ea, eb]);
    }
  }

  return triangles.filter(
    ([a, b, c]) => a < n && b < n && c < n
  );
}

function triHasEdge(tri: Triangle, a: number, b: number): boolean {
  const has = (v: number) => tri[0] === v || tri[1] === v || tri[2] === v;
  return has(a) && has(b);
}

function inCircumcircle(
  pts: [number, number][],
  tri: Triangle,
  px: number,
  py: number
): boolean {
  const [ax, ay] = pts[tri[0]];
  const [bx, by] = pts[tri[1]];
  const [cx, cy] = pts[tri[2]];

  const dax = ax - px, day = ay - py;
  const dbx = bx - px, dby = by - py;
  const dcx = cx - px, dcy = cy - py;

  const det =
    (dax * dax + day * day) * (dbx * dcy - dcx * dby) -
    (dbx * dbx + dby * dby) * (dax * dcy - dcx * day) +
    (dcx * dcx + dcy * dcy) * (dax * dby - dbx * day);

  return det > 0;
}
