import { useTranslation } from "react-i18next";
import type { OptimizeSmallWorldResponse } from "../types.ts";

type ResultPanelProps = {
  result: OptimizeSmallWorldResponse | null;
};

export function ResultPanel({ result }: ResultPanelProps) {
  const { t } = useTranslation();

  if (!result) return null;

  const scoreDiff =
    result.optimized_graph_score === -1 ||
    result.bidirectional_graph_score === -1
      ? "N/A"
      : result.optimized_graph_score - result.bidirectional_graph_score;

  return (
    <div className="result-panel">
      <h3>{t("resultPanel.title")}</h3>
      <div className="score-cards">
        <div className="card">
          <span className="label">{t("resultPanel.optimizedScore")}</span>
          <span className="value">{result.optimized_graph_score}</span>
          {result.optimized_graph_score === -1 && (
            <p className="unreachable-node-notice">
              {t("resultPanel.unreachableNode")}
            </p>
          )}
        </div>
        <div className="card">
          <span className="label">{t("resultPanel.bidirectionalScore")}</span>
          <span className="value">{result.bidirectional_graph_score}</span>
          {result.bidirectional_graph_score === -1 && (
            <p className="unreachable-node-notice">
              {t("resultPanel.unreachableNode")}
            </p>
          )}
        </div>
        <div className="card highlight">
          <span className="label">{t("resultPanel.scoreDiff")}</span>
          <span className="value">{scoreDiff}</span>
        </div>
        <div className="card">
          <span className="label">{t("resultPanel.directedEdgeCount")}</span>
          <span className="value">{result.edges.length}</span>
        </div>
      </div>
    </div>
  );
}
