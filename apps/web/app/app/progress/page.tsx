"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../api-client";

interface WeeklySummary {
  total_attempts: number;
  avg_score: number;
  total_words: number;
  total_fillers: number;
  streak_days: number;
  daily_scores: { date: string; score: number; track: string }[];
}

export default function ProgressPage() {
  const [data, setData] = useState<WeeklySummary | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch("/progress/weekly")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setErr("Could not load progress. Complete a session first."));
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Date", "Track", "Score"],
      ...data.daily_scores.map((d) => [d.date, d.track, String(d.score)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stageroom_progress.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxScore = 100;

  return (
    <div style={{ padding: "40px 32px", maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 28, color: "#1e1b4b", marginBottom: 4 }}>Progress</h1>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Your weekly overview. Consistency beats perfection.</p>
        </div>
        {data && data.daily_scores.length > 0 && (
          <button
            onClick={exportCSV}
            style={{
              padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb",
              background: "transparent", color: "#6b7280", fontSize: 13, fontWeight: 500,
              fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all .2s",
            }}
          >
            Export CSV ↓
          </button>
        )}
      </div>

      {err && <p style={{ color: "#9ca3af", fontSize: 14 }}>{err}</p>}

      {data && (
        <>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 14, marginBottom: 40 }}>
            {[
              { label: "Streak", value: `${data.streak_days}`, icon: "🔥" },
              { label: "Sessions", value: `${data.total_attempts}`, icon: "📊" },
              { label: "Avg Score", value: `${data.avg_score}`, icon: "⭐" },
              { label: "Words", value: data.total_words.toLocaleString(), icon: "💬" },
              { label: "Fillers", value: `${data.total_fillers}`, icon: "🤔" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", borderRadius: 16, padding: 18,
                border: "1px solid rgba(124,58,237,.05)", textAlign: "center",
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 24, color: "#1e1b4b" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          {data.daily_scores.length > 0 ? (
            <div style={{
              background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 28,
              border: "1px solid rgba(124,58,237,.05)",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e1b4b", marginBottom: 20 }}>Daily Scores</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180 }}>
                {data.daily_scores.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1e1b4b" }}>{d.score}</div>
                    <div style={{
                      width: "100%", maxWidth: 40, borderRadius: "8px 8px 4px 4px",
                      background: `linear-gradient(to top,#7c3aed,#a78bfa)`,
                      height: `${(d.score / maxScore) * 140}px`,
                      transition: "height .5s cubic-bezier(.16,1,.3,1)",
                      minHeight: 8,
                    }} />
                    <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", lineHeight: 1.2 }}>
                      {d.date.slice(5)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: "rgba(124,58,237,.04)", borderRadius: 16, padding: 32, textAlign: "center",
            }}>
              <p style={{ color: "#9ca3af", fontSize: 14 }}>No sessions this week yet. Complete your first to see progress here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
