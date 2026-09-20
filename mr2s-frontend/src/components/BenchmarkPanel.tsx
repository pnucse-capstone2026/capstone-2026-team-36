import { useTranslation } from "react-i18next";
import type { BenchmarkResult, ParsedGraph } from "../types.ts";
import { UNREACHABLE_SCORE } from "../types.ts";

type BenchmarkPanelProps = {
  result: BenchmarkResult | null;
  loading: boolean;
  graph: ParsedGraph | null;
};

const APPROACH_LABELS: Record<string, string> = {
  "qubo": "QUBO",
  "raw-sa": "Raw SA",
  "robin": "Robin",
};

export function BenchmarkPanel({ result, loading, graph }: BenchmarkPanelProps) {
  const { t } = useTranslation();

  if (!loading && !result) return null;

  return (
    <div className="benchmark-panel">
      <h3>{t("benchmarkPanel.title")}</h3>
      {graph && (
        <p className="benchmark-graph-info">
          {t("benchmarkPanel.graphInfo", {
            nodes: graph.vertices.length,
            edges: graph.edges.length,
          })}
        </p>
      )}
      {loading ? (
        <p className="benchmark-loading">{t("benchmarkPanel.running")}</p>
      ) : (
        result && (
          <table className="benchmark-table">
            <thead>
              <tr>
                <th>{t("benchmarkPanel.approach")}</th>
                <th>{t("benchmarkPanel.max")}</th>
                <th>{t("benchmarkPanel.min")}</th>
                <th>{t("benchmarkPanel.average")}</th>
                <th>{t("benchmarkPanel.weightBalance")}</th>
                <th>{t("benchmarkPanel.averageTime")}</th>
                <th>{t("benchmarkPanel.failures")}</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(result) as (keyof BenchmarkResult)[]).map(
                (target) => {
                  const stats = result[target];
                  return (
                    <tr key={target}>
                      <td>{APPROACH_LABELS[target] ?? target}</td>
                      <td>{stats.max === UNREACHABLE_SCORE ? "N/A" : stats.max}</td>
                      <td>{stats.min === UNREACHABLE_SCORE ? "N/A" : stats.min}</td>
                      <td>
                        {stats.average === UNREACHABLE_SCORE
                          ? "N/A"
                          : stats.average.toFixed(2)}
                      </td>
                      <td>
                        {stats.weightBalanceSum === UNREACHABLE_SCORE
                          ? "N/A"
                          : stats.weightBalanceSum.toFixed(2)}
                      </td>
                      <td>{stats.averageTimeMs.toFixed(2)}</td>
                      <td>{stats.failureCount}</td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
