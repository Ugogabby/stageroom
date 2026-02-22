"use client";

import { useState } from "react";

const SCENARIOS = [
  {
    scenario: "Networking Event",
    emoji: "🤝",
    description: "You've just arrived at a tech industry mixer. Someone approaches you.",
    turns: [
      { role: "partner", content: "Hey! I don't think we've met — I'm Jordan. I work in product at a fintech startup. What brings you here?" },
      { role: "user", content: "" },
      { role: "partner", content: "Oh interesting! What does your day-to-day actually look like?" },
      { role: "user", content: "" },
      { role: "partner", content: "That's cool. We're actually looking for someone with that kind of background. Mind if I grab your LinkedIn?" },
      { role: "user", content: "" },
    ],
  },
  {
    scenario: "Investor Call",
    emoji: "💰",
    description: "A VC partner has 10 minutes for you on a Zoom call.",
    turns: [
      { role: "partner", content: "I've got about 10 minutes — give me the quick version. What are you building and why now?" },
      { role: "user", content: "" },
      { role: "partner", content: "Interesting. What's your traction look like?" },
      { role: "user", content: "" },
      { role: "partner", content: "And what's stopping a bigger player from just doing this?" },
      { role: "user", content: "" },
    ],
  },
  {
    scenario: "Coffee with Manager",
    emoji: "☕",
    description: "Your skip-level manager invited you for a casual 15-minute coffee.",
    turns: [
      { role: "partner", content: "Thanks for making time! I've been wanting to hear — how are things going on your team?" },
      { role: "user", content: "" },
      { role: "partner", content: "Good to hear. Is there anything you think we should be doing differently?" },
      { role: "user", content: "" },
      { role: "partner", content: "I appreciate the candor. Where do you see yourself in a year?" },
      { role: "user", content: "" },
    ],
  },
  {
    scenario: "Conflict Resolution",
    emoji: "⚡",
    description: "A colleague disagrees with your project direction in a team meeting.",
    turns: [
      { role: "partner", content: "Honestly, I don't think this approach is going to work. We tried something similar last year and it failed." },
      { role: "user", content: "" },
      { role: "partner", content: "I hear you, but the data doesn't support it. What's your evidence?" },
      { role: "user", content: "" },
      { role: "partner", content: "Okay, I see your point on that. But the timeline still worries me." },
      { role: "user", content: "" },
    ],
  },
];

export default function ConversationsPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const scenario = selected !== null ? SCENARIOS[selected] : null;

  const startScenario = (idx: number) => {
    setSelected(idx);
    setCurrentTurn(0);
    setResponses([]);
    setInput("");
  };

  const submitResponse = () => {
    if (!input.trim() || !scenario) return;
    const newResponses = [...responses, input];
    setResponses(newResponses);
    setInput("");
    // Move to next partner turn (skip user turns in the turns array)
    setCurrentTurn((t) => t + 2); // +2 because turns alternate partner/user
  };

  const visibleTurns = scenario
    ? scenario.turns.filter((_, i) => i <= currentTurn).map((t, i) => ({
        ...t,
        userResponse: t.role === "user" ? responses[Math.floor(i / 2)] : undefined,
      }))
    : [];

  const isComplete = scenario && currentTurn >= scenario.turns.length;

  return (
    <div style={{ padding: "40px 32px", maxWidth: 720 }}>
      <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 28, color: "#1e1b4b", marginBottom: 4 }}>Conversation Mode</h1>
      <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 32 }}>Practice real speaking scenarios. Respond as you would in real life.</p>

      {!scenario ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {SCENARIOS.map((s, i) => (
            <div
              key={i}
              onClick={() => startScenario(i)}
              style={{
                background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 24,
                border: "1px solid rgba(124,58,237,.05)", cursor: "pointer", transition: "all .3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.emoji}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e1b4b", marginBottom: 6 }}>{s.scenario}</h3>
              <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>{s.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 14, color: "#7c3aed", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>← Back</button>
            <div>
              <span style={{ fontSize: 20, marginRight: 8 }}>{scenario.emoji}</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#1e1b4b" }}>{scenario.scenario}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            {visibleTurns.map((turn, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: turn.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%", borderRadius: 16, padding: "14px 18px",
                  background: turn.role === "partner" ? "rgba(255,255,255,.9)" : "linear-gradient(135deg,#7c3aed,#6366f1)",
                  color: turn.role === "partner" ? "#1e1b4b" : "#fff",
                  fontSize: 14, lineHeight: 1.6,
                  boxShadow: turn.role === "partner" ? "0 4px 16px rgba(30,27,75,.05)" : "0 4px 16px rgba(124,58,237,.2)",
                  border: turn.role === "partner" ? "1px solid rgba(124,58,237,.06)" : "none",
                }}>
                  {turn.role === "partner" ? turn.content : (turn.userResponse || "...")}
                </div>
              </div>
            ))}
          </div>

          {!isComplete && scenario.turns[currentTurn]?.role === "user" && (
            <div style={{ display: "flex", gap: 10 }}>
              <textarea
                rows={2}
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitResponse(); } }}
                style={{
                  flex: 1, padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb",
                  fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none",
                  background: "#faf9ff", resize: "none", lineHeight: 1.5,
                }}
              />
              <button
                onClick={submitResponse}
                style={{
                  padding: "12px 20px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff",
                  fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                  cursor: "pointer", alignSelf: "flex-end",
                }}
              >
                Send
              </button>
            </div>
          )}

          {isComplete && (
            <div style={{
              background: "rgba(124,58,237,.06)", borderRadius: 16, padding: 20, textAlign: "center",
            }}>
              <p style={{ fontSize: 15, color: "#7c3aed", fontWeight: 600, marginBottom: 8 }}>Conversation complete!</p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>Review your responses. Were they clear, concise, and confident?</p>
              <button
                onClick={() => setSelected(null)}
                style={{
                  padding: "12px 24px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff",
                  fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
                }}
              >
                Try Another Scenario
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
