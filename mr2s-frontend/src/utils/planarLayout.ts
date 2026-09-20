export type LayoutGraph = {
  n: number;
  edges: [number, number][];
  positions: [number, number][];
};

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

function hasCrossingForVertex(
  v: number,
  adj: number[][],
  edges: [number, number][],
  pos: [number, number][],
): boolean {
  for (const u of adj[v]) {
    for (const [e0, e1] of edges) {
      if (e0 === v || e1 === v || e0 === u || e1 === u) continue;
      if (segCross(
        pos[v][0], pos[v][1], pos[u][0], pos[u][1],
        pos[e0][0], pos[e0][1], pos[e1][0], pos[e1][1],
      )) return true;
    }
  }
  return false;
}

export function optimizeLayout(
  input: LayoutGraph,
  iterations = 200,
): LayoutGraph {
  const { n, edges } = input;
  if (n < 2) return { ...input };

  const pos: [number, number][] = input.positions.map(([x, y]) => [x, y]);

  // Scale to working area
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pos) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const side = Math.max(maxX - minX, maxY - minY, 1);
  for (let i = 0; i < n; i++) {
    pos[i] = [(pos[i][0] - minX) / side * 100, (pos[i][1] - minY) / side * 100];
  }

  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const k = Math.sqrt((100 * 100) / Math.max(n, 2));
  const k2 = k * k;

  for (let it = 0; it < iterations; it++) {
    const t = 1 - it / iterations;
    const step = k * 0.35 * t;
    if (step < 1e-8) break;

    const disp: [number, number][] = Array.from({ length: n }, () => [0, 0]);

    // Force 1: pair repulsion k²/d
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i][0] - pos[j][0];
        const dy = pos[i][1] - pos[j][1];
        const d = Math.max(Math.hypot(dx, dy), 1e-6);
        const f = k2 / (d * d);
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        disp[i][0] += fx; disp[i][1] += fy;
        disp[j][0] -= fx; disp[j][1] -= fy;
      }
    }

    // Force 2: edge spring (Hooke toward k)
    for (const [u, v] of edges) {
      const dx = pos[u][0] - pos[v][0];
      const dy = pos[u][1] - pos[v][1];
      const d = Math.max(Math.hypot(dx, dy), 1e-6);
      const stretch = Math.max(d / k, 1);
      const f = (d - k) * stretch;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      disp[u][0] -= fx; disp[u][1] -= fy;
      disp[v][0] += fx; disp[v][1] += fy;
    }

    // Force 3: center pull
    const cx = 50, cy = 50;
    for (let i = 0; i < n; i++) {
      const dx = cx - pos[i][0];
      const dy = cy - pos[i][1];
      const d = Math.max(Math.hypot(dx, dy), 1e-6);
      disp[i][0] += (dx / d) * k * 0.05;
      disp[i][1] += (dy / d) * k * 0.05;
    }

    // Apply with crossing revert
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    let maxDisp = 0;
    for (const v of order) {
      let dx = disp[v][0], dy = disp[v][1];
      const d = Math.hypot(dx, dy);
      if (d < 1e-10) continue;
      if (d > step) { dx *= step / d; dy *= step / d; }

      let nx = pos[v][0] + dx;
      let ny = pos[v][1] + dy;
      nx = Math.max(2, Math.min(98, nx));
      ny = Math.max(2, Math.min(98, ny));

      const old: [number, number] = [pos[v][0], pos[v][1]];
      pos[v] = [nx, ny];

      if (hasCrossingForVertex(v, adj, edges, pos)) {
        pos[v] = old;
      } else {
        const moved = Math.hypot(nx - old[0], ny - old[1]);
        if (moved > maxDisp) maxDisp = moved;
      }
    }

    if (maxDisp < k * 1e-3) break;
  }

  return { n, edges, positions: pos };
}
