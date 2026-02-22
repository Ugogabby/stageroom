"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken, setUser } from "../api-client";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email || !password) { setError("Email and password required."); return; }
    setLoading(true);
    try {
      const res = await apiFetch(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || "Something went wrong.");
        return;
      }
      const data = await res.json();
      setToken(data.token);
      setUser({ email: data.email, user_id: data.user_id });
      router.push("/app");
    } catch (e: any) {
      setError("Could not connect to server. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,.9)", backdropFilter: "blur(20px)", borderRadius: 24,
    padding: 40, width: "100%", maxWidth: 420,
    boxShadow: "0 20px 60px rgba(30,27,75,.08),0 0 0 1px rgba(124,58,237,.06)",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb",
    fontSize: 15, fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "border .2s",
    background: "#faf9ff",
  };
  const btnStyle: React.CSSProperties = {
    width: "100%", padding: "16px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600,
    fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all .3s",
    background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff",
    boxShadow: "0 8px 32px rgba(124,58,237,.3)", marginTop: 8,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(135deg,#faf9ff 0%,#f0ecff 100%)" }}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700 }}>S</div>
          <span style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 24, color: "#1e1b4b" }}>StageRoom</span>
        </div>

        <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 28, textAlign: "center", color: "#1e1b4b", marginBottom: 8 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p style={{ textAlign: "center", fontSize: 14, color: "#9ca3af", marginBottom: 32 }}>
          {mode === "login" ? "Sign in to continue training." : "Start your clarity journey."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          {error && <p style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{error}</p>}
          <button onClick={submit} disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#9ca3af" }}>
          {mode === "login" ? "No account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: "#7c3aed", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a href="/" style={{ fontSize: 13, color: "#c4b5fd", textDecoration: "none" }}>← Back to home</a>
        </div>
      </div>
    </div>
  );
}
