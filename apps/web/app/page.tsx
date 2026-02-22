"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const FEATURES = [
  { icon: "🎯", title: "Daily Challenges", desc: "30-minute structured sessions across 5 speaking tracks — from business pitches to casual networking." },
  { icon: "🎙️", title: "Record & Review", desc: "Capture your delivery, play it back, and see exactly where your clarity shines or drifts." },
  { icon: "📊", title: "Calm Feedback", desc: "Strengths first. One focus area. One drill for tomorrow. No overwhelming scorecards." },
  { icon: "💬", title: "Conversation Sim", desc: "Practice real scenarios — investor calls, networking, conflict resolution — with AI partners." },
  { icon: "🎬", title: "Projection Mode", desc: "Full-screen cinematic practice with audience silhouettes, timers, and gentle cues." },
  { icon: "📈", title: "Progress Tracking", desc: "Weekly trends, streaks, and exportable data — metrics that serve you, not define you." },
];

const TRACKS = [
  { name: "Academic Talk", emoji: "🎓", color: "#7c3aed" },
  { name: "Business Pitch", emoji: "💼", color: "#6366f1" },
  { name: "Table Topics", emoji: "🗣️", color: "#8b5cf6" },
  { name: "Hard Q&A", emoji: "🔥", color: "#a78bfa" },
  { name: "Casual Chat", emoji: "☕", color: "#c084fc" },
];

const TESTIMONIALS = [
  { name: "Adaeze O.", role: "Fintech Founder, Lagos", text: "StageRoom helped me stop second-guessing my accent and start owning my delivery. My last investor pitch landed a follow-up in 24 hours.", avatar: "AO", color: "#7c3aed" },
  { name: "Dr. Ravi M.", role: "Researcher, Toronto", text: "The daily challenges gave me structure I never had. I present at conferences with real confidence now — not performance anxiety.", avatar: "RM", color: "#6366f1" },
  { name: "Mei-Lin C.", role: "Consultant, Singapore", text: "Finally — a platform that treats speaking clarity as a skill, not an identity problem. The feedback is precise and kind.", avatar: "MC", color: "#8b5cf6" },
];

const NAV_LINKS = ["Features", "Tracks", "How", "Testimonials"];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

/** Generate stable waveform heights once (no Math.random in render). */
function generateWaveform(count: number): { opacity: number; duration: number }[] {
  const bars: { opacity: number; duration: number }[] = [];
  // Use seeded-ish approach via index math
  for (let i = 0; i < count; i++) {
    const seed = ((i * 7 + 13) % 17) / 17; // deterministic 0-1
    bars.push({
      opacity: 0.4 + seed * 0.6,
      duration: 0.8 + seed * 0.6,
    });
  }
  return bars;
}

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTS                                                     */
/* ------------------------------------------------------------------ */

function FloatingCard({ children, className = "", delay = 0, x = 0, y = 0 }: {
  children: React.ReactNode; className?: string; delay?: number; x: string; y: string;
}) {
  return (
    <div className={className} style={{
      position: "absolute", left: x, top: y,
      animation: `floatIn 0.8s ${delay}s both cubic-bezier(0.16,1,0.3,1), gentleFloat 6s ${delay + 0.8}s infinite ease-in-out`,
    }}>
      {children}
    </div>
  );
}

function NavBar({ scrolled, onCTA }: { scrolled: boolean; onCTA: () => void }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 24px", height: 72,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
      borderBottom: scrolled ? "1px solid rgba(124,58,237,0.08)" : "none",
      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "linear-gradient(135deg,#7c3aed,#6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 18, fontWeight: 700,
        }}>S</div>
        <span style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 22, fontWeight: 400, color: "#1e1b4b", letterSpacing: "-0.02em" }}>
          StageRoom
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, color: "#4b5563" }}>
        {NAV_LINKS.map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="nav-link" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s", cursor: "pointer" }}>
            {item}
          </a>
        ))}
        <button onClick={onCTA} style={{
          background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", border: "none",
          borderRadius: 100, padding: "10px 24px", fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
          transition: "transform 0.2s,box-shadow 0.2s",
          boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
        }}>
          Get Started
        </button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const waveformRef = useRef(generateWaveform(24));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisibleSections((prev) => new Set([...prev, e.target.id]));
        });
      },
      { threshold: 0.15 }
    );
    Object.values(sectionRefs.current).forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  const regSection = (id: string) => (el: HTMLElement | null) => { sectionRefs.current[id] = el; };
  const goApp = () => router.push("/auth");

  const sectionStyle = (id: string): React.CSSProperties => ({
    opacity: visibleSections.has(id) ? 1 : 0,
    transform: visibleSections.has(id) ? "translateY(0)" : "translateY(40px)",
    transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
  });

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: "#1e1b4b", background: "#faf9ff", overflowX: "hidden", minHeight: "100vh" }}>
      {/* ---------- GLOBAL STYLES ---------- */}
      <style>{`
        @keyframes floatIn { from { opacity:0; transform:translateY(30px) scale(.92); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes gentleFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes pulseGlow { 0%,100% { opacity:.4; transform:scale(1); } 50% { opacity:.7; transform:scale(1.05); } }
        @keyframes waveform { 0%,100% { height:12px; } 50% { height:28px; } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-60px); } to { opacity:1; transform:translateX(0); } }

        .feature-card:hover { transform:translateY(-4px); box-shadow:0 20px 60px rgba(124,58,237,.12); }
        .track-pill:hover { transform:scale(1.05); box-shadow:0 8px 30px rgba(124,58,237,.25); }
        .testimonial-card:hover { transform:translateY(-2px); }
        .nav-link:hover { color:#7c3aed !important; }

        /* ---------- RESPONSIVE HERO ---------- */
        .hero-wrap { display:flex; align-items:center; gap:60px; max-width:1200px; width:100%; position:relative; }
        .hero-right { flex:1; position:relative; height:520px; min-width:320px; }
        @media (max-width:900px) {
          .hero-wrap { flex-direction:column; text-align:center; gap:32px; }
          .hero-right { width:100%; height:400px; min-width:unset; }
          .hero-wrap .hero-cta-row { justify-content:center; }
          .hero-wrap .hero-proof { justify-content:center; }
        }
        @media (max-width:600px) {
          .hero-right { display:none; }
        }
      `}</style>

      <NavBar scrolled={scrolled} onCTA={goApp} />

      {/* ==================== HERO ==================== */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", overflow: "hidden" }}>
        {/* Blobs */}
        <div style={{ position: "absolute", top: -120, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.08) 0%,transparent 70%)", animation: "pulseGlow 8s infinite" }} />
        <div style={{ position: "absolute", bottom: -60, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,.06) 0%,transparent 70%)", animation: "pulseGlow 10s 2s infinite" }} />

        <div className="hero-wrap">
          {/* Left */}
          <div style={{ flex: 1, animation: "slideInLeft .9s cubic-bezier(.16,1,.3,1) both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.08)", borderRadius: 100, padding: "6px 16px", marginBottom: 28, fontSize: 13, fontWeight: 600, color: "#7c3aed", letterSpacing: ".02em" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed" }} />
              Now in Beta — Join Free
            </div>

            <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(36px,5vw,64px)", lineHeight: 1.08, fontWeight: 400, color: "#1e1b4b", letterSpacing: "-.03em", marginBottom: 24 }}>
              Speak with<br />
              <span style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>clarity</span>, not<br />
              compromise.
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: "#6b7280", maxWidth: 460, marginBottom: 40 }}>
              Premium performance training for global professionals who want clearer speech, stronger confidence, and professional presence — without losing identity.
            </p>

            <div className="hero-cta-row" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={goApp} style={{
                background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", border: "none", borderRadius: 14,
                padding: "16px 36px", fontSize: 16, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                cursor: "pointer", transition: "all .3s", boxShadow: "0 8px 32px rgba(124,58,237,.35)",
              }}>
                Start Training →
              </button>
              <a href="#how" style={{
                background: "transparent", color: "#7c3aed", border: "2px solid rgba(124,58,237,.2)",
                borderRadius: 14, padding: "14px 28px", fontSize: 16, fontWeight: 600,
                fontFamily: "'DM Sans',sans-serif", cursor: "pointer", textDecoration: "none", transition: "all .3s",
              }}>
                See How It Works
              </a>
            </div>

            <div className="hero-proof" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 48, flexWrap: "wrap" }}>
              <div style={{ display: "flex" }}>
                {["AO", "RM", "MC", "JK"].map((initials, i) => (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `hsl(${260 + i * 15},70%,${55 + i * 5}%)`,
                    border: "2px solid #fff", marginLeft: i > 0 ? -10 : 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 700,
                  }}>{initials}</div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#9ca3af" }}>
                <span style={{ color: "#1e1b4b", fontWeight: 600 }}>2,400+</span> professionals training worldwide
              </div>
            </div>
          </div>

          {/* Right — floating cards */}
          <div className="hero-right">
            {/* Main card */}
            <FloatingCard delay={0.1} x="10%" y="5%">
              <div style={{
                background: "rgba(255,255,255,.9)", backdropFilter: "blur(20px)", borderRadius: 20, padding: 24, width: 300,
                boxShadow: "0 20px 60px rgba(30,27,75,.08),0 0 0 1px rgba(124,58,237,.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎙️</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b" }}>Daily Challenge</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Business Pitch · Medium</div>
                  </div>
                </div>
                {/* Waveform — uses stable ref, no Math.random() */}
                <div style={{ display: "flex", alignItems: "center", gap: 3, height: 40, padding: "0 8px", marginBottom: 16 }}>
                  {waveformRef.current.map((bar, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 2,
                      background: "linear-gradient(to top,#7c3aed,#a78bfa)",
                      opacity: bar.opacity,
                      animation: `waveform ${bar.duration}s ${i * 0.05}s infinite ease-in-out`,
                    }} />
                  ))}
                </div>
                <div style={{ background: "rgba(124,58,237,.06)", borderRadius: 12, padding: 12, fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                  &ldquo;Your pacing was strong. Let&rsquo;s work on sentence endings tomorrow.&rdquo;
                </div>
              </div>
            </FloatingCard>

            {/* Score */}
            <FloatingCard delay={0.4} x="55%" y="28%">
              <div style={{
                background: "rgba(255,255,255,.92)", backdropFilter: "blur(20px)", borderRadius: 16, padding: 18, width: 180,
                boxShadow: "0 16px 48px rgba(30,27,75,.07),0 0 0 1px rgba(124,58,237,.05)",
              }}>
                <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, marginBottom: 8 }}>Clarity Score</div>
                <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 42, background: "linear-gradient(135deg,#7c3aed,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 8 }}>87</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>↑ 12%</span>
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>this week</span>
                </div>
              </div>
            </FloatingCard>

            {/* Streak */}
            <FloatingCard delay={0.6} x="5%" y="65%">
              <div style={{
                background: "linear-gradient(135deg,#7c3aed,#6366f1)", borderRadius: 16, padding: 18, width: 160,
                boxShadow: "0 16px 48px rgba(124,58,237,.25)", color: "#fff",
              }}>
                <div style={{ fontSize: 12, opacity: .8, fontWeight: 500, marginBottom: 6 }}>Current Streak</div>
                <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 36, lineHeight: 1, marginBottom: 4 }}>14 🔥</div>
                <div style={{ fontSize: 12, opacity: .7 }}>days in a row</div>
              </div>
            </FloatingCard>

            {/* User float */}
            <FloatingCard delay={0.8} x="40%" y="70%">
              <div style={{
                background: "rgba(255,255,255,.92)", backdropFilter: "blur(20px)", borderRadius: 16, padding: 14, width: 220,
                boxShadow: "0 12px 40px rgba(30,27,75,.06),0 0 0 1px rgba(124,58,237,.05)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>AO</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>Adaeze O.</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    &ldquo;Finally stopped second-guessing...&rdquo;
                  </div>
                </div>
              </div>
            </FloatingCard>

            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: .15 }} viewBox="0 0 500 520">
              <line x1="180" y1="150" x2="330" y2="220" stroke="#7c3aed" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="150" y1="280" x2="100" y2="380" stroke="#7c3aed" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="330" y1="300" x2="280" y2="400" stroke="#7c3aed" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>
      </section>

      {/* ==================== LOGOS ==================== */}
      <section style={{ padding: "40px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, letterSpacing: ".05em", textTransform: "uppercase" }}>Trusted by professionals at</p>
        <div style={{ display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap", justifyContent: "center", opacity: .35 }}>
          {["McKinsey", "Deloitte", "Google", "Stanford", "World Bank"].map((n) => (
            <span key={n} style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 20, color: "#1e1b4b", letterSpacing: "-.02em" }}>{n}</span>
          ))}
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" ref={regSection("features")} style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto", ...sectionStyle("features") }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>The Platform</p>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(28px,4vw,44px)", color: "#1e1b4b", letterSpacing: "-.02em", marginBottom: 16 }}>
            Everything you need to train.<br />Nothing you don&apos;t.
          </h2>
          <p style={{ fontSize: 16, color: "#9ca3af", maxWidth: 520, margin: "0 auto" }}>Structured sessions. Honest feedback. Real progress. Designed for professionals who take their voice seriously.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: "rgba(255,255,255,.8)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 28,
              border: "1px solid rgba(124,58,237,.05)", transition: "all .3s cubic-bezier(.16,1,.3,1)", cursor: "default",
            }}>
              <div style={{ fontSize: 28, marginBottom: 16, width: 52, height: 52, borderRadius: 14, background: "rgba(124,58,237,.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1e1b4b", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TRACKS ==================== */}
      <section id="tracks" ref={regSection("tracks")} style={{ padding: "80px 24px", background: "linear-gradient(180deg,#faf9ff 0%,#f0ecff 100%)", ...sectionStyle("tracks") }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Speaking Tracks</p>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(28px,4vw,44px)", color: "#1e1b4b", letterSpacing: "-.02em", marginBottom: 16 }}>Five tracks. Infinite scenarios.</h2>
          <p style={{ fontSize: 16, color: "#9ca3af", maxWidth: 500, margin: "0 auto 48px" }}>Rotate through real-world speaking contexts. Each day brings a new challenge tailored to your level.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            {TRACKS.map((t, i) => (
              <div key={i} className="track-pill" style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(255,255,255,.9)", backdropFilter: "blur(12px)", borderRadius: 100,
                padding: "14px 28px", boxShadow: "0 4px 20px rgba(30,27,75,.05)",
                border: `1px solid ${t.color}20`, transition: "all .3s cubic-bezier(.16,1,.3,1)", cursor: "pointer",
              }}>
                <span style={{ fontSize: 20 }}>{t.emoji}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: t.color }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how" ref={regSection("how")} style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto", ...sectionStyle("how") }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>How It Works</p>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(28px,4vw,44px)", color: "#1e1b4b", letterSpacing: "-.02em" }}>Three steps. Daily.</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            { num: "01", title: "Get your challenge", desc: "A structured 30-minute session — your track, your difficulty, your pace. No two days are the same." },
            { num: "02", title: "Speak and record", desc: "Deliver your talk. StageRoom captures your audio and gives you honest playback with transcript." },
            { num: "03", title: "Review calm feedback", desc: "Three strengths. One focus area. One drill for tomorrow. No overwhelming metrics — unless you want them." },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 28, alignItems: "flex-start", padding: "36px 0", borderBottom: i < 2 ? "1px solid rgba(124,58,237,.08)" : "none" }}>
              <div style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 48, color: "rgba(124,58,237,.12)", lineHeight: 1, flexShrink: 0, width: 80 }}>{step.num}</div>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#1e1b4b", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.7, maxWidth: 500 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section id="testimonials" ref={regSection("testimonials")} style={{ padding: "80px 24px", background: "linear-gradient(180deg,#faf9ff 0%,#f5f0ff 100%)", ...sectionStyle("testimonials") }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Testimonials</p>
            <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(28px,4vw,44px)", color: "#1e1b4b", letterSpacing: "-.02em" }}>Voices that found theirs.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card" style={{
                background: "rgba(255,255,255,.85)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 28,
                border: "1px solid rgba(124,58,237,.06)", transition: "all .3s",
              }}>
                <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.7, marginBottom: 24, fontStyle: "italic" }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section style={{ padding: "100px 24px", textAlign: "center" }}>
        <div style={{
          maxWidth: 700, margin: "0 auto", background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
          borderRadius: 28, padding: "64px 40px", position: "relative", overflow: "hidden",
          boxShadow: "0 32px 80px rgba(124,58,237,.3)",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "clamp(28px,4vw,40px)", color: "#fff", letterSpacing: "-.02em", marginBottom: 16, position: "relative" }}>Your voice deserves a stage.</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.8)", maxWidth: 440, margin: "0 auto 36px", lineHeight: 1.6, position: "relative" }}>
            Join thousands of global professionals training their clarity, confidence, and presence — one session at a time.
          </p>
          <button onClick={goApp} style={{
            background: "#fff", color: "#7c3aed", border: "none", borderRadius: 14,
            padding: "16px 40px", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
            cursor: "pointer", transition: "all .3s", position: "relative",
            boxShadow: "0 4px 20px rgba(0,0,0,.15)",
          }}>
            Start Free Training →
          </button>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer style={{ padding: "48px 24px 32px", borderTop: "1px solid rgba(124,58,237,.06)", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700 }}>S</div>
            <span style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 18, color: "#1e1b4b" }}>StageRoom</span>
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 13, color: "#9ca3af" }}>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Contact</a>
          </div>
          <div style={{ fontSize: 12, color: "#d1d5db" }}>© 2026 StageRoom. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
