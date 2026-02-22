// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../api-client";

interface Step {
  type: string;
  duration_min: number;
  prompt: string;
}

interface Plan {
  id: number;
  date: string;
  track: string;
  difficulty: string;
  steps: Step[];
}

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch("/plans/today")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setPlan)
      .catch(() => setErr("No plan available. Make sure the seed script has been run."));
  }, []);

  const typeColors: Record<string, string> = { warmup: "#f59e0b", main: "#7c3aed", cooldown: "#06b6d4", drill: "#10b981" };

  if (err) return (
    <div style={{ padding: "40px 32px", maxWidth: 700 }}>
      <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 28, color: "#1e1b4b", marginBottom: 12 }}>Today&apos;s Plan</h1>
      <p style={{ color: "#ef4444" }}>{err}</p>
    </div>
  );

  if (!plan) return (
    <div style={{ padding: "40px 32px" }}>
      <p style={{ color: "#9ca3af" }}>Loading today&apos;s plan...</p>
    </div>
  );

  return (
    <div style={{ padding: "40px 32px", maxWidth: 700 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 28, color: "#1e1b4b", marginBottom: 4 }}>Today&apos;s Plan</h1>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>
          <span style={{ color: "#7c3aed", fontWeight: 600 }}>{plan.track}</span> · {plan.difficulty} · {plan.date}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {plan.steps.map((step, i) => {
          const active = i === activeStep;
          return (
            <div
              key={i}
              onClick={() => setActiveStep(i)}
              style={{
                background: active ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.6)",
                backdropFilter: "blur(12px)", borderRadius: 16, padding: 24,
                border: active ? "2px solid #7c3aed" : "1px solid rgba(124,58,237,.05)",
                cursor: "pointer", transition: "all .3s",
                boxShadow: active ? "0 8px 32px rgba(124,58,237,.1)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: active ? 12 : 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: typeColors[step.type] || "#7c3aed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", textTransform: "capitalize" }}>{step.type}</span>
                <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>{step.duration_min} min</span>
              </div>
              {active && (
                <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, whiteSpace: "pre-line", marginTop: 8 }}>
                  {step.prompt}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
        <button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => s - 1)}
          style={{
            padding: "12px 24px", borderRadius: 12, border: "1.5px solid #e5e7eb",
            background: "transparent", color: "#6b7280", fontSize: 14, fontWeight: 500,
            fontFamily: "'DM Sans',sans-serif", cursor: activeStep === 0 ? "not-allowed" : "pointer",
            opacity: activeStep === 0 ? 0.4 : 1, transition: "all .2s",
          }}
        >
          ← Previous
        </button>
        <button
          disabled={activeStep === plan.steps.length - 1}
          onClick={() => setActiveStep((s) => s + 1)}
          style={{
            padding: "12px 24px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff",
            fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
            cursor: activeStep === plan.steps.length - 1 ? "not-allowed" : "pointer",
            opacity: activeStep === plan.steps.length - 1 ? 0.5 : 1,
            boxShadow: "0 4px 16px rgba(124,58,237,.25)", transition: "all .2s",
          }}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
