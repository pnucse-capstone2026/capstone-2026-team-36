import { describe, it, expect } from "vitest";
import { generateRandomPlanarGraph } from "./planarGraph";

describe("generateRandomPlanarGraph", () => {
  it("generates valid graph for n=3", () => {
    const g = generateRandomPlanarGraph(3);
    expect(g.vertices).toEqual([1, 2, 3]);
    expect(g.edges.length).toBeGreaterThanOrEqual(3);
    expect(g.positions).toBeDefined();
    expect(Object.keys(g.positions!).length).toBe(3);
  });

  it("generates valid graph for n=10", () => {
    const g = generateRandomPlanarGraph(10);
    expect(g.vertices.length).toBe(10);
    expect(g.edges.length).toBeGreaterThanOrEqual(10);
    expect(g.edges.length).toBeLessThanOrEqual(3 * 10 - 6);
    expect(Object.keys(g.positions!).length).toBe(10);
  });

  it("generates valid graph for n=20", () => {
    const g = generateRandomPlanarGraph(20);
    expect(g.vertices.length).toBe(20);
    expect(g.edges.length).toBeGreaterThanOrEqual(20);
    // All vertices are 1-indexed
    for (const v of g.vertices) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(20);
    }
    // All edge endpoints exist in vertices
    for (const [u, v] of g.edges) {
      expect(g.vertices).toContain(u);
      expect(g.vertices).toContain(v);
    }
    // All positions exist for all vertices
    for (const v of g.vertices) {
      expect(g.positions![v]).toBeDefined();
      expect(typeof g.positions![v].x).toBe("number");
      expect(typeof g.positions![v].y).toBe("number");
    }
  });

  it("throws for n < 3", () => {
    expect(() => generateRandomPlanarGraph(2)).toThrow();
  });

  it("generates connected graph (all vertices reachable)", () => {
    const g = generateRandomPlanarGraph(15);
    // BFS from vertex 1
    const adj = new Map<number, number[]>();
    for (const [u, v] of g.edges) {
      if (!adj.has(u)) adj.set(u, []);
      if (!adj.has(v)) adj.set(v, []);
      adj.get(u)!.push(v);
      adj.get(v)!.push(u);
    }
    const visited = new Set<number>();
    const stack = [1];
    visited.add(1);
    while (stack.length > 0) {
      const v = stack.pop()!;
      for (const u of adj.get(v) ?? []) {
        if (!visited.has(u)) {
          visited.add(u);
          stack.push(u);
        }
      }
    }
    expect(visited.size).toBe(15);
  });

  it("has min degree >= 2", () => {
    const g = generateRandomPlanarGraph(15);
    const deg = new Map<number, number>();
    for (const [u, v] of g.edges) {
      deg.set(u, (deg.get(u) ?? 0) + 1);
      deg.set(v, (deg.get(v) ?? 0) + 1);
    }
    for (const v of g.vertices) {
      expect(deg.get(v) ?? 0).toBeGreaterThanOrEqual(2);
    }
  });
});
