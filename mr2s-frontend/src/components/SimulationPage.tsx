import { useTranslation } from "react-i18next";

const SIMULATION_URL = "https://quantum-guardians.github.io/mr2s_simulation/";

export function SimulationPage() {
  const { t } = useTranslation();

  return (
    <div className="simulation-page">
      <div className="simulation-header">
        <h2>{t("simulation.title")}</h2>
        <p>{t("simulation.description")}</p>
      </div>
      <div className="simulation-frame-wrapper">
        <iframe
          src={SIMULATION_URL}
          title={t("simulation.title")}
          className="simulation-frame"
          sandbox="allow-scripts allow-same-origin allow-forms"
          allowFullScreen
        />
      </div>
    </div>
  );
}
