import type { ParsedGraph } from "../types.ts";

export type ValidationErrorKey =
  | { key: "validation.verticesEmpty" }
  | { key: "validation.invalidVertex"; value: string }
  | { key: "validation.duplicateVertices" }
  | { key: "validation.invalidEdgeFormat"; line: number; value: string }
  | { key: "validation.invalidEdgeValue"; line: number; value: string }
  | { key: "validation.selfLoop"; line: number; u: number; v: number }
  | { key: "validation.vertexNotFound"; vertex: number; line: number };

export type ValidationResult =
  | { valid: true; graph: ParsedGraph }
  | { valid: false; error: ValidationErrorKey };

function parseVertices(raw: string): number[] | { error: ValidationErrorKey } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { error: { key: "validation.verticesEmpty" } };
  }
  const parts = trimmed.split(/[,\s]+/).filter(Boolean);
  const nums: number[] = [];
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (isNaN(n)) {
      return { error: { key: "validation.invalidVertex", value: p } };
    }
    nums.push(n);
  }
  const unique = new Set(nums);
  if (unique.size !== nums.length) {
    return { error: { key: "validation.duplicateVertices" } };
  }
  return nums;
}

function parseEdges(
  raw: string,
  vertices: Set<number>
): [number, number][] | { error: ValidationErrorKey } {
  const lines = raw.trim().split("\n").filter((l) => l.trim());
  const edges: [number, number][] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const parts = line.split(/[\s,]+/).filter(Boolean);
    if (parts.length !== 2) {
      return {
        error: {
          key: "validation.invalidEdgeFormat",
          line: i + 1,
          value: line,
        },
      };
    }
    const u = parseInt(parts[0], 10);
    const v = parseInt(parts[1], 10);
    if (isNaN(u) || isNaN(v)) {
      return {
        error: { key: "validation.invalidEdgeValue", line: i + 1, value: line },
      };
    }
    if (u === v) {
      return {
        error: { key: "validation.selfLoop", line: i + 1, u, v },
      };
    }
    if (!vertices.has(u)) {
      return {
        error: { key: "validation.vertexNotFound", vertex: u, line: i + 1 },
      };
    }
    if (!vertices.has(v)) {
      return {
        error: { key: "validation.vertexNotFound", vertex: v, line: i + 1 },
      };
    }
    edges.push([u, v]);
  }
  return edges;
}

export function validateAndParse(
  verticesRaw: string,
  edgesRaw: string
): ValidationResult {
  const vertResult = parseVertices(verticesRaw);
  if (typeof vertResult === "object" && "error" in vertResult) {
    return { valid: false, error: vertResult.error };
  }
  const vertices = vertResult as number[];
  const vertSet = new Set(vertices);

  const edgeResult = parseEdges(edgesRaw, vertSet);
  if (typeof edgeResult === "object" && "error" in edgeResult) {
    return { valid: false, error: edgeResult.error };
  }
  const edges = edgeResult as [number, number][];

  return {
    valid: true,
    graph: { vertices, edges },
  };
}
