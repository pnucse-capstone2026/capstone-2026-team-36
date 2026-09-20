import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GraphInput } from "./components/GraphInput.tsx";
import { GraphVisualization } from "./components/GraphVisualization.tsx";
import { ResultPanel } from "./components/ResultPanel.tsx";
import { DebugPanel } from "./components/DebugPanel.tsx";
import { BenchmarkPanel } from "./components/BenchmarkPanel.tsx";
import { SimulationPage } from "./components/SimulationPage.tsx";
import { validateAndParse } from "./utils/validation.ts";
import { generateRandomPlanarGraph } from "./utils/planarGraph.ts";
import { optimizeSmallWorld, runBenchmark } from "./api.ts";
import type {
  ParsedGraph,
  OptimizeSmallWorldResponse,
  ApiTarget,
  BenchmarkResult,
} from "./types.ts";
import "./App.css";

type Language = "ko" | "en" | "ja";
type Page = "optimizer" | "simulation";

export default function App() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState<Page>("optimizer");
  const [verticesRaw, setVerticesRaw] = useState("1,2,3,4,5");
  const [edgesRaw, setEdgesRaw] = useState("1 2\n2 3\n3 4\n4 5\n5 1");
  const [parsedGraph, setParsedGraph] = useState<ParsedGraph | null>(null);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizeSmallWorldResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [apiTarget, setApiTarget] = useState<ApiTarget>("qubo");
  const [benchmarkResult, setBenchmarkResult] =
    useState<BenchmarkResult | null>(null);
  const [benchmarkGraph, setBenchmarkGraph] = useState<ParsedGraph | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "light" || attr === "dark") return attr;
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const handleLanguageChange = useCallback(
    (lng: Language) => {
      void i18n.changeLanguage(lng);
    },
    [i18n]
  );

  const handleDrawGraph = useCallback(() => {
    const result = validateAndParse(verticesRaw, edgesRaw);
    if (!result.valid) {
      setError(t(result.error.key, result.error));
      return;
    }
    setError(null);
    setParsedGraph(result.graph);
    setOptimizationResult(null);
    setHasDrawn(true);
  }, [verticesRaw, edgesRaw, t]);

  const handleOptimize = useCallback(async () => {
    if (!parsedGraph) return;
    const result = validateAndParse(verticesRaw, edgesRaw);
    if (!result.valid) {
      setError(t(result.error.key, result.error));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await optimizeSmallWorld(
        {
          vertices: parsedGraph.vertices,
          edges: parsedGraph.edges,
        },
        apiTarget
      );
      setOptimizationResult(res);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : t("errors.unknown");
      if (
        msg.includes("fetch") ||
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError")
      ) {
        setError(t("errors.cors"));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [parsedGraph, verticesRaw, edgesRaw, apiTarget, t]);

  const handleVerticesChange = useCallback((v: string) => {
    setVerticesRaw(v);
    setError(null);
  }, []);

  const handleEdgesChange = useCallback((e: string) => {
    setEdgesRaw(e);
    setError(null);
  }, []);

  const handleApiTargetChange = useCallback((target: ApiTarget) => {
    setApiTarget(target);
    setError(null);
  }, []);

  const handleBenchmark = useCallback(async (nodeCount: number) => {
    setBenchmarkLoading(true);
    setBenchmarkResult(null);
    setBenchmarkProgress(t("benchmarkPanel.generating"));
    setError(null);
    try {
      const graph = generateRandomPlanarGraph(nodeCount);
      setBenchmarkGraph(graph);
      setParsedGraph(graph);
      setOptimizationResult(null);
      setHasDrawn(true);
      setVerticesRaw(graph.vertices.join(","));
      setEdgesRaw(graph.edges.map(([u, v]) => `${u} ${v}`).join("\n"));

      const result = await runBenchmark(graph, (target, iteration) => {
        const labels: Record<string, string> = {
          "qubo": "QUBO",
          "raw-sa": "Raw SA",
          "robin": "Robin",
        };
        setBenchmarkProgress(`${labels[target]} ${iteration}/10...`);
      });
      setBenchmarkResult(result);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : t("errors.unknown");
      setError(msg);
    } finally {
      setBenchmarkLoading(false);
      setBenchmarkProgress(null);
    }
  }, [t]);

  const handleReset = useCallback(() => {
    setVerticesRaw("1,2,3,4,5");
    setEdgesRaw("1 2\n2 3\n3 4\n4 5\n5 1");
    setParsedGraph(null);
    setOptimizationResult(null);
    setHasDrawn(false);
    setError(null);
  }, []);

  const canDraw = verticesRaw.trim().length > 0;
  const canOptimize = parsedGraph !== null && !loading;

  const requestForDebug = parsedGraph
    ? {
        vertices: parsedGraph.vertices,
        edges: parsedGraph.edges,
      }
    : null;

  const currentLanguage = (i18n.language as Language) ?? "ko";

  return (
    <div className="app">
      <header>
        <div className="header-row">
          <div>
            <h1>{t("header.title")}</h1>
            <p>{t("header.subtitle")}</p>
          </div>
          <div className="header-controls">
            <select
              className="language-select"
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              aria-label={t("language")}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              title={
                theme === "light"
                  ? t("header.switchToDark")
                  : t("header.switchToLight")
              }
              aria-label={
                theme === "light"
                  ? t("header.darkMode")
                  : t("header.lightMode")
              }
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
        <nav className="nav-tabs">
          <button
            type="button"
            className={`nav-tab${page === "optimizer" ? " nav-tab--active" : ""}`}
            onClick={() => setPage("optimizer")}
          >
            {t("nav.optimizer")}
          </button>
          <button
            type="button"
            className={`nav-tab${page === "simulation" ? " nav-tab--active" : ""}`}
            onClick={() => setPage("simulation")}
          >
            {t("nav.simulation")}
          </button>
        </nav>
      </header>

      {page === "simulation" ? (
        <SimulationPage />
      ) : (
        <>
          <div className="layout">
            <aside className="sidebar">
              <GraphInput
                verticesRaw={verticesRaw}
                edgesRaw={edgesRaw}
                onVerticesChange={handleVerticesChange}
                onEdgesChange={handleEdgesChange}
                onDrawGraph={handleDrawGraph}
                onOptimize={handleOptimize}
                onReset={handleReset}
                onBenchmark={handleBenchmark}
                canDraw={canDraw}
                canOptimize={canOptimize}
                benchmarkLoading={benchmarkLoading}
                benchmarkProgress={benchmarkProgress}
                error={error}
                apiTarget={apiTarget}
                onApiTargetChange={handleApiTargetChange}
              />
              {loading && <div className="loading">{t("loading")}</div>}
              <ResultPanel result={optimizationResult} />
              <BenchmarkPanel result={benchmarkResult} loading={benchmarkLoading} graph={benchmarkGraph} />
            </aside>

            <main className="main">
              <GraphVisualization
                parsedGraph={parsedGraph}
                directedEdges={optimizationResult?.edges ?? null}
                hasDrawn={hasDrawn}
              />
            </main>
          </div>

          <DebugPanel request={requestForDebug} response={optimizationResult} />
        </>
      )}
    </div>
  );
}
