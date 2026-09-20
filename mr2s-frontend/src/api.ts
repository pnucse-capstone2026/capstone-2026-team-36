import type {
  OptimizeSmallWorldRequest,
  OptimizeSmallWorldResponse,
  ApiTarget,
  BenchmarkResult,
  BenchmarkStats,
} from "./types.ts";
import { UNREACHABLE_SCORE } from "./types.ts";

const API_URLS: Record<ApiTarget, string> = {
  "qubo": "/api/v2/solvers/qubo",
  "raw-sa": "/api/v2/solvers/raw-sa",
  "robin": "/api/v2/solvers/robin",
};

export class ApiTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiTimeoutError";
  }
}

export async function optimizeSmallWorld(
  request: OptimizeSmallWorldRequest,
  apiTarget: ApiTarget
): Promise<OptimizeSmallWorldResponse> {
  const url = API_URLS[apiTarget];

  const body = {
    vertices: request.vertices,
    edges: request.edges.map(([u, v]) => ({ vertices: [u, v], weight: 1 })),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 408) {
    throw new ApiTimeoutError("Request Timeout (408)");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API 요청 실패 (${response.status}): ${text || response.statusText}`
    );
  }

  const data = (await response.json()) as OptimizeSmallWorldResponse;
  return data;
}

const BENCHMARK_ITERATIONS = 10;
const ALL_TARGETS: ApiTarget[] = ["qubo", "raw-sa", "robin"];

function calcWeightBalance(edges: OptimizeSmallWorldResponse["edges"]): number {
  const inW: Record<number, number> = {};
  const outW: Record<number, number> = {};
  for (const e of edges) {
    outW[e._from] = (outW[e._from] ?? 0) + 1;
    inW[e.to] = (inW[e.to] ?? 0) + 1;
  }
  const allNodes = new Set([...Object.keys(inW), ...Object.keys(outW)].map(Number));
  let sum = 0;
  for (const v of allNodes) {
    const diff = (inW[v] ?? 0) - (outW[v] ?? 0);
    sum += diff * diff;
  }
  return sum;
}

function buildStats(
  scores: number[],
  durations: number[],
  failureCount: number,
  balances: number[],
): BenchmarkStats {
  return {
    max: scores.length > 0 ? Math.max(...scores) : UNREACHABLE_SCORE,
    min: scores.length > 0 ? Math.min(...scores) : UNREACHABLE_SCORE,
    average:
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : UNREACHABLE_SCORE,
    averageTimeMs:
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0,
    failureCount,
    weightBalanceSum:
      balances.length > 0
        ? balances.reduce((a, b) => a + b, 0) / balances.length
        : UNREACHABLE_SCORE,
  };
}

export async function runBenchmark(
  graph: OptimizeSmallWorldRequest,
  onProgress?: (target: ApiTarget, iteration: number) => void,
): Promise<BenchmarkResult> {
  const result = {} as BenchmarkResult;

  for (const target of ALL_TARGETS) {
    const scores: number[] = [];
    const durations: number[] = [];
    const balances: number[] = [];
    let failureCount = 0;

    for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
      onProgress?.(target, i + 1);
      const start = performance.now();
      try {
        const res = await optimizeSmallWorld(graph, target);
        const elapsed = performance.now() - start;
        scores.push(res.optimized_graph_score);
        durations.push(elapsed);
        balances.push(calcWeightBalance(res.edges));
      } catch {
        const elapsed = performance.now() - start;
        durations.push(elapsed);
        failureCount++;
      }
    }

    result[target] = buildStats(scores, durations, failureCount, balances);
  }

  return result;
}
