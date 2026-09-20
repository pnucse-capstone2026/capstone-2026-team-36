import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { OptimizeSmallWorldRequest } from "../types.ts";
import type { OptimizeSmallWorldResponse } from "../types.ts";

type DebugPanelProps = {
  request: OptimizeSmallWorldRequest | null;
  response: OptimizeSmallWorldResponse | null;
};

export function DebugPanel({ request, response }: DebugPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="debug-panel">
      <button
        type="button"
        className="debug-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? t("debugPanel.hide") : t("debugPanel.show")}
      </button>
      {open && (
        <div className="debug-content">
          <div className="debug-grid">
            <div>
              <strong>Request</strong>
              <pre>{request ? JSON.stringify(request, null, 2) : "-"}</pre>
            </div>
            <div>
              <strong>Response</strong>
              <pre>{response ? JSON.stringify(response, null, 2) : "-"}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
