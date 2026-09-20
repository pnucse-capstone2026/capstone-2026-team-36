import type { ChangeEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ApiTarget } from "../types.ts";

type GraphInputProps = {
  verticesRaw: string;
  edgesRaw: string;
  onVerticesChange: (v: string) => void;
  onEdgesChange: (e: string) => void;
  onDrawGraph: () => void;
  onOptimize: () => void;
  onReset: () => void;
  onBenchmark: (nodeCount: number) => void;
  canDraw: boolean;
  canOptimize: boolean;
  benchmarkLoading: boolean;
  benchmarkProgress: string | null;
  error: string | null;
  apiTarget: ApiTarget;
  onApiTargetChange: (target: ApiTarget) => void;
};

export function GraphInput({
  verticesRaw,
  edgesRaw,
  onVerticesChange,
  onEdgesChange,
  onDrawGraph,
  onOptimize,
  onReset,
  onBenchmark,
  canDraw,
  canOptimize,
  benchmarkLoading,
  benchmarkProgress,
  error,
  apiTarget,
  onApiTargetChange,
}: GraphInputProps) {
  const { t } = useTranslation();
  const [benchmarkNodeCount, setBenchmarkNodeCount] = useState("15");

  const parsedNodeCount = parseInt(benchmarkNodeCount, 10);
  const validNodeCount = !isNaN(parsedNodeCount) && parsedNodeCount >= 3;

  return (
    <div className="graph-input">
      <h3>{t("graphInput.title")}</h3>

      <div className="field">
        <label>{t("graphInput.apiSelection")}</label>
        <div className="api-toggle">
          <label title={t("graphInput.solverHint.qubo")}>
            <input
              type="radio"
              name="api-target"
              value="qubo"
              checked={apiTarget === "qubo"}
              onChange={(e) => onApiTargetChange(e.target.value as ApiTarget)}
            />
            QUBO
          </label>
          <label title={t("graphInput.solverHint.rawSa")}>
            <input
              type="radio"
              name="api-target"
              value="raw-sa"
              checked={apiTarget === "raw-sa"}
              onChange={(e) => onApiTargetChange(e.target.value as ApiTarget)}
            />
            Raw SA
          </label>
          <label title={t("graphInput.solverHint.robin")}>
            <input
              type="radio"
              name="api-target"
              value="robin"
              checked={apiTarget === "robin"}
              onChange={(e) => onApiTargetChange(e.target.value as ApiTarget)}
            />
            Robin
          </label>
        </div>
      </div>

      <div className="field">
        <label htmlFor="vertices">{t("graphInput.vertices")}</label>
        <input
          id="vertices"
          type="text"
          value={verticesRaw}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onVerticesChange(e.target.value)
          }
          placeholder={t("graphInput.verticesPlaceholder")}
        />
      </div>

      <div className="field">
        <label htmlFor="edges">{t("graphInput.edges")}</label>
        <textarea
          id="edges"
          value={edgesRaw}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onEdgesChange(e.target.value)
          }
          placeholder={t("graphInput.edgesPlaceholder")}
          rows={5}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <div className="buttons">
        <button
          className="btn-primary"
          onClick={onDrawGraph}
          disabled={!canDraw}
        >
          {t("graphInput.drawGraph")}
        </button>
        <button
          className="btn-primary"
          onClick={onOptimize}
          disabled={!canOptimize}
        >
          {t("graphInput.pathSearch")}
        </button>
        <button className="btn-secondary" onClick={onReset} type="button">
          {t("graphInput.reset")}
        </button>
      </div>

      <div className="benchmark-section">
        <h4>{t("graphInput.benchmarkTitle")}</h4>
        <div className="field">
          <label htmlFor="benchmark-nodes">{t("graphInput.nodeCount")}</label>
          <input
            id="benchmark-nodes"
            type="number"
            min={3}
            max={200}
            value={benchmarkNodeCount}
            onChange={(e) => setBenchmarkNodeCount(e.target.value)}
          />
        </div>
        <button
          className="btn-benchmark"
          onClick={() => onBenchmark(parsedNodeCount)}
          disabled={benchmarkLoading || !validNodeCount}
          type="button"
        >
          {benchmarkLoading
            ? benchmarkProgress ?? t("graphInput.runBenchmark")
            : t("graphInput.runBenchmark")}
        </button>
      </div>
    </div>
  );
}
