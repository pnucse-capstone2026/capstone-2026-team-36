// Request DTO
export type OptimizeSmallWorldRequest = {
  vertices: number[];
  edges: [number, number][];
};

// Response DTO - "_from" 필드명 그대로 유지
export type OptimizedDirectedEdge = {
  _from: number;
  to: number;
};

export type OptimizeSmallWorldResponse = {
  edges: OptimizedDirectedEdge[];
  optimized_graph_score: number;
  bidirectional_graph_score: number;
};

// 파싱된 그래프
export type NodePositions = Record<number, { x: number; y: number }>;

export type ParsedGraph = {
  vertices: number[];
  edges: [number, number][];
  positions?: NodePositions;
};

/** Solver names of the backend catalog: POST /api/v2/solvers/{solver}. */
export type ApiTarget = "qubo" | "raw-sa" | "robin";

/** Sentinel value returned by the API when a node is unreachable. */
export const UNREACHABLE_SCORE = -1;

export type BenchmarkStats = {
  max: number;
  min: number;
  average: number;
  averageTimeMs: number;
  failureCount: number;
  weightBalanceSum: number;
};

export type BenchmarkResult = {
  [key in ApiTarget]: BenchmarkStats;
};
