"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getUser } from "../api-client";

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [plan, setPlan] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    apiFetch("/plans/today").then((r) => r.ok ? r.json() : null).then(setPlan).catch(() => {});
    apiFetch("/progress/weekly").then((r) => r.ok ? r.json() : null).then(setProgress).catch(() => {});
  }, []);

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 28,
    border: "1px solid rgba(124,58,237,.05)", transition: "all .3s", cursor: "pointer",
  };

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000 }}>
      <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 32, color: "#1e1b4b", marginBottom: 8 }}>
        Welcome back{user ? `, ${user.email.split("@")[0]}` : ""}.
      </h1>
      <p style={{ color: "#9ca3af", fontSize: 15, marginBottom: 40 }}>Ready to train? Here&apos;s your overview.</p>

      {/* Quick stats */}
      {progress && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Streak", value: `${progress.streak_days} days`, accent: "🔥" },
            { label: "This Week", value: `${progress.total_attempts} sessions`, accent: "📊" },
            { label: "Avg Score", value: `${progress.avg_score}`, accent: "⭐" },
            { label: "Words Spoken", value: progress.total_words.toLocaleString(), accent: "💬" },
          ].map((s, i) => (
            <div key={i} style={{ ...card, cursor: "default", padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.accent}</div>
              <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 24, color: "#1e1b4b" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
        <div onClick={() => router.push("/app/plan")} style={card}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1e1b4b", marginBottom: 6 }}>Today&apos;s Plan</h3>
          {plan ? (
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5 }}>
              <strong style={{ color: "#7c3aed" }}>{plan.track}</strong> · {plan.difficulty} · {plan.steps?.length || 0} steps
            </p>
          ) : (
            <p style={{ fontSize: 14, color: "#c4b5fd" }}>Loading plan...</p>
          )}
        </div>

        <div onClick={() => router.push("/app/review")} style={card}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎙️</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1e1b4b", marginBottom: 6 }}>Record & Review</h3>
          <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5 }}>Upload a recording, paste your transcript, and get calm, coach-first feedback.</p>
        </div>

        <div onClick={() => router.push("/app/conversations")} style={card}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1e1b4b", marginBottom: 6 }}>Conversation Mode</h3>
          <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5 }}>Practice networking, investor calls, conflict resolution, and more.</p>
        </div>

        <div onClick={() => router.push("/app/progress")} style={card}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1e1b4b", marginBottom: 6 }}>Progress</h3>
          <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.5 }}>View weekly trends, streaks, and detailed analytics.</p>
        </div>
      </div>
    </div>
  );
}
