import { describe, it, expect } from "vitest";
import { optimizeLayout, type LayoutGraph } from "./planarLayout";

function makeTriangle(): LayoutGraph {
  return {
    n: 3,
    edges: [[0, 1], [1, 2], [2, 0]],
    positions: [[0, 0], [10, 0], [5, 8]],
  };
}

function makeSquareWithDiag(): LayoutGraph {
  return {
    n: 4,
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
    positions: [[0, 0], [10, 0], [10, 10], [0, 10]],
  };
}

function segCross(
  ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, dx: number, dy: number,
): boolean {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return (d1 > 0) !== (d2 > 0) && (d3 > 0) !== (d4 > 0);
}

function hasCrossings(g: LayoutGraph): boolean {
  const pos = g.positions;
  for (let i = 0; i < g.edges.length; i++) {
    for (let j = i + 1; j < g.edges.length; j++) {
      const [a, b] = g.edges[i];
      const [c, d] = g.edges[j];
      if (a === c || a === d || b === c || b === d) continue;
      if (segCross(
        pos[a][0], pos[a][1], pos[b][0], pos[b][1],
        pos[c][0], pos[c][1], pos[d][0], pos[d][1],
      )) return true;
    }
  }
  return false;
}

function minPairDist(g: LayoutGraph): number {
  let min = Infinity;
  for (let i = 0; i < g.n; i++) {
    for (let j = i + 1; j < g.n; j++) {
      const dx = g.positions[i][0] - g.positions[j][0];
      const dy = g.positions[i][1] - g.positions[j][1];
      min = Math.min(min, Math.hypot(dx, dy));
    }
  }
  return min;
}

describe("optimizeLayout", () => {
  it("returns correct number of nodes", () => {
    const g = makeTriangle();
    const result = optimizeLayout(g);
    expect(result.positions.length).toBe(3);
  });

  it("preserves edge list", () => {
    const g = makeTriangle();
    const result = optimizeLayout(g);
    expect(result.edges).toEqual(g.edges);
    expect(result.n).toBe(g.n);
  });

  it("produces no edge crossings for triangle", () => {
    const g = makeTriangle();
    const result = optimizeLayout(g);
    expect(hasCrossings(result)).toBe(false);
  });

  it("produces no edge crossings for square+diagonal", () => {
    const g = makeSquareWithDiag();
    const result = optimizeLayout(g);
    expect(hasCrossings(result)).toBe(false);
  });

  it("keeps vertices separated", () => {
    const g = makeSquareWithDiag();
    const result = optimizeLayout(g);
    expect(minPairDist(result)).toBeGreaterThan(0.5);
  });

  it("handles larger graph without crossings", () => {
    // K4 with crossing-free initial positions (vertex 3 inside triangle)
    const g: LayoutGraph = {
      n: 4,
      edges: [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],
      positions: [[0,0],[10,0],[5,10],[5,3]],
    };
    const result = optimizeLayout(g);
    expect(hasCrossings(result)).toBe(false);
  });

  it("preserves crossing-free property for wheel graph W5", () => {
    // Center (0) + ring (1,2,3,4), crossing-free by construction
    const g: LayoutGraph = {
      n: 5,
      edges: [[0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4],[4,1]],
      positions: [[5,5],[5,10],[10,5],[5,0],[0,5]],
    };
    const result = optimizeLayout(g);
    expect(hasCrossings(result)).toBe(false);
    expect(minPairDist(result)).toBeGreaterThan(0.1);
  });
});
