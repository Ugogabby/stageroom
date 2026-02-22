"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getUser, clearAuth } from "../api-client";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/app", icon: "📊" },
  { label: "Today's Plan", path: "/app/plan", icon: "🎯" },
  { label: "Record & Review", path: "/app/review", icon: "🎙️" },
  { label: "Conversations", path: "/app/conversations", icon: "💬" },
  { label: "Progress", path: "/app/progress", icon: "📈" },
  { label: "Projection", path: "/app/projection", icon: "🎬" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUserState] = useState<{ email: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth"); return; }
    const u = getUser();
    if (u) setUserState(u);
  }, [router]);

  const logout = () => { clearAuth(); router.push("/"); };

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", color: "#9ca3af" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .app-sidebar { transform: translateX(-100%); position: fixed !important; z-index: 200; }
          .app-sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ display: "none", position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 150 }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${sidebarOpen ? "open" : ""}`}
        style={{
          width: 260, background: "#fff", borderRight: "1px solid rgba(124,58,237,.06)",
          display: "flex", flexDirection: "column", padding: "24px 16px",
          transition: "transform .3s", position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, paddingLeft: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700 }}>S</div>
          <span style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 20, color: "#1e1b4b" }}>StageRoom</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { router.push(item.path); setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12, border: "none",
                  background: active ? "rgba(124,58,237,.08)" : "transparent",
                  color: active ? "#7c3aed" : "#6b7280",
                  fontWeight: active ? 600 : 500, fontSize: 14,
                  fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
                  transition: "all .2s", textAlign: "left", width: "100%",
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid rgba(124,58,237,.06)", paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: "#9ca3af", paddingLeft: 8, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          <button
            onClick={logout}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
              background: "transparent", color: "#6b7280", fontSize: 13, fontWeight: 500,
              fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all .2s",
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: "#faf9ff", overflow: "auto" }}>
        {/* Mobile header */}
        <div style={{ display: "none", padding: "16px 20px", borderBottom: "1px solid rgba(124,58,237,.06)", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#1e1b4b" }}>☰</button>
          <span style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 18, color: "#1e1b4b" }}>StageRoom</span>
        </div>
        <style>{`@media (max-width: 768px) { main > div:first-child { display: flex !important; } }`}</style>
        {children}
      </main>
    </div>
  );
}
