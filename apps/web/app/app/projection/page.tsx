// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  CONFIG                                                             */
/* ------------------------------------------------------------------ */

const CUES = [
  { at: 0.75, label: "⏱ 75% — begin wrapping up", color: "#f59e0b" },
  { at: 0.90, label: "🎤 Q&A incoming", color: "#06b6d4" },
  { at: 1.00, label: "✅ Time's up!", color: "#22c55e" },
];

const DURATIONS = [
  { label: "2 min", seconds: 120 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
];

const VENUES = [
  { label: "Meeting Room", id: "meeting", seats: 6, rows: 1, desc: "6 people" },
  { label: "Workshop", id: "workshop", seats: 15, rows: 2, desc: "15 attendees" },
  { label: "Conference", id: "conference", seats: 30, rows: 3, desc: "30 people" },
  { label: "Auditorium", id: "auditorium", seats: 60, rows: 4, desc: "60 seats" },
];

const AUDIENCE_MODES = [
  { id: "silhouettes", label: "Silhouettes", icon: "👥", desc: "Generated audience outlines" },
  { id: "photos", label: "Upload Photos", icon: "📸", desc: "Your own audience images" },
  { id: "video", label: "Upload Video", icon: "🎥", desc: "Real audience footage" },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function formatTime(s: number) {
  var m = Math.floor(s / 60);
  var sec = s % 60;
  return m.toString().padStart(2, "0") + ":" + sec.toString().padStart(2, "0");
}

function seededRand(seed: number) {
  var x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ */
/*  SVG PERSON                                                         */
/* ------------------------------------------------------------------ */

function PersonSilhouette({ scale, seed, sitting }: { scale: number; seed: number; sitting: boolean }) {
  var r = function (s: number) { return seededRand(seed + s); };
  var skinTone = r(1) > 0.5 ? "rgba(180,160,140," : "rgba(120,90,70,";
  var baseOpacity = 0.7 + r(2) * 0.3;
  var hairDark = r(3) > 0.4;
  var hasGlasses = r(4) > 0.75;
  var headTilt = (r(5) - 0.5) * 6;
  var shirtHue = Math.floor(r(6) * 360);
  var shirtLight = 20 + Math.floor(r(7) * 25);
  var isFemale = r(8) > 0.5;
  var hairLength = isFemale ? 12 + r(9) * 8 : 4 + r(9) * 4;
  var shoulderW = isFemale ? 18 * scale : 22 * scale;
  var w = 44 * scale;
  var h = sitting ? 52 * scale : 68 * scale;

  return (
    <svg width={w} height={h} viewBox={"0 0 44 " + (sitting ? "52" : "68")} style={{ overflow: "visible" }}>
      <g transform={"rotate(" + headTilt + " 22 12)"}>
        {isFemale && (
          <ellipse cx="22" cy={12 + hairLength * 0.3} rx={9 + hairLength * 0.15} ry={hairLength * 0.7}
            fill={hairDark ? "rgba(30,20,10," + baseOpacity + ")" : "rgba(80,50,20," + baseOpacity + ")"} />
        )}
        <ellipse cx="22" cy="11" rx="7.5" ry="9" fill={skinTone + baseOpacity + ")"} />
        <ellipse cx="22" cy={isFemale ? "7" : "6.5"} rx={isFemale ? "7.5" : "7"} ry={isFemale ? "5" : "4.5"}
          fill={hairDark ? "rgba(25,15,8," + baseOpacity + ")" : "rgba(70,45,15," + baseOpacity + ")"} />
        <ellipse cx="14.5" cy="11.5" rx="1.8" ry="2.5" fill={skinTone + (baseOpacity * 0.8) + ")"} />
        <ellipse cx="29.5" cy="11.5" rx="1.8" ry="2.5" fill={skinTone + (baseOpacity * 0.8) + ")"} />
        {hasGlasses && (<>
          <circle cx="18.5" cy="11" r="3.5" fill="none" stroke={"rgba(60,60,60," + baseOpacity + ")"} strokeWidth="0.8" />
          <circle cx="25.5" cy="11" r="3.5" fill="none" stroke={"rgba(60,60,60," + baseOpacity + ")"} strokeWidth="0.8" />
        </>)}
      </g>
      <rect x="19.5" y="19" width="5" height="4" rx="1" fill={skinTone + (baseOpacity * 0.9) + ")"} />
      <path d={sitting
        ? "M 22 23 C 10 23 6 30 6 38 L 6 52 L 38 52 L 38 38 C 38 30 34 23 22 23 Z"
        : "M 22 23 C 8 23 4 32 4 42 L 4 68 L 40 68 L 40 42 C 40 32 36 23 22 23 Z"}
        fill={"hsla(" + shirtHue + ",30%," + shirtLight + "%," + baseOpacity + ")"} />
      {r(10) > 0.5 ? (
        <path d="M 19 23 L 22 27 L 25 23" fill="none" stroke={"rgba(255,255,255," + (baseOpacity * 0.2) + ")"} strokeWidth="0.8" />
      ) : (
        <ellipse cx="22" cy="23.5" rx="3.5" ry="2" fill={"rgba(255,255,255," + (baseOpacity * 0.08) + ")"} />
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  SILHOUETTE AUDIENCE                                                */
/* ------------------------------------------------------------------ */

function SilhouetteAudience({ venue }: { venue: string }) {
  var config = VENUES.find(function (v) { return v.id === venue; }) || VENUES[2];
  var totalRows = config.rows;
  var totalPeople = config.seats;
  var peoplePerRow = Math.ceil(totalPeople / totalRows);
  var rows = [];
  var assigned = 0;
  for (var rr = 0; rr < totalRows; rr++) {
    var count = Math.min(peoplePerRow + (rr === 0 ? 2 : -rr), totalPeople - assigned);
    rows.push(count);
    assigned += count;
  }
  rows.reverse();

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: venue === "meeting" ? "30%" : venue === "workshop" ? "40%" : venue === "conference" ? "50%" : "60%",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      alignItems: "center", pointerEvents: "none", overflow: "hidden", padding: "0 20px",
    }}>
      {rows.map(function (count, ri) {
        var depthFactor = 1 - (ri / rows.length) * 0.4;
        var scale = (0.5 + depthFactor * 0.5) * (venue === "meeting" ? 1.3 : venue === "auditorium" ? 0.8 : 1.0);
        var gap = Math.max(2, 12 - ri * 2) * scale;
        return (
          <div key={ri} style={{
            display: "flex", justifyContent: "center", gap: gap,
            marginBottom: ri === rows.length - 1 ? 0 : -4,
            animation: "audienceBreathe " + (5 + ri) + "s " + (ri * 0.7) + "s ease-in-out infinite",
            opacity: 0.5 + depthFactor * 0.5,
          }}>
            {Array.from({ length: count }).map(function (_, pi) {
              var seed = ri * 100 + pi;
              var microShift = (seededRand(seed + 50) - 0.5) * 4;
              var isMoving = seededRand(seed + 70) > 0.85;
              return (
                <div key={pi} style={{
                  transform: "translateX(" + microShift + "px)",
                  animation: isMoving ? "personShift " + (6 + seededRand(seed + 80) * 4) + "s ease-in-out infinite" : "none",
                }}>
                  <PersonSilhouette scale={scale} seed={seed} sitting={venue !== "meeting"} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PHOTO AUDIENCE                                                     */
/* ------------------------------------------------------------------ */

function PhotoAudience({ photos, venue }: { photos: string[]; venue: string }) {
  var config = VENUES.find(function (v) { return v.id === venue; }) || VENUES[2];
  var totalSeats = config.seats;
  var totalRows = config.rows;
  var seatsPerRow = Math.ceil(totalSeats / totalRows);

  // Repeat photos to fill seats
  var filled = [];
  for (var i = 0; i < totalSeats; i++) {
    filled.push(photos[i % photos.length]);
  }

  var rows = [];
  for (var r = 0; r < totalRows; r++) {
    rows.push(filled.slice(r * seatsPerRow, (r + 1) * seatsPerRow));
  }
  rows.reverse();

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: venue === "meeting" ? "35%" : venue === "workshop" ? "45%" : venue === "conference" ? "55%" : "65%",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      alignItems: "center", pointerEvents: "none", overflow: "hidden", padding: "0 16px",
    }}>
      {rows.map(function (rowPhotos, ri) {
        var depthFactor = 1 - (ri / rows.length) * 0.35;
        var size = (40 + depthFactor * 40) * (venue === "meeting" ? 1.4 : venue === "auditorium" ? 0.7 : 1.0);
        var gap = Math.max(4, 14 - ri * 3);
        return (
          <div key={ri} style={{
            display: "flex", justifyContent: "center", gap: gap,
            marginBottom: ri === rows.length - 1 ? 8 : 2,
            animation: "audienceBreathe " + (5 + ri) + "s " + (ri * 0.7) + "s ease-in-out infinite",
            opacity: 0.55 + depthFactor * 0.45,
          }}>
            {rowPhotos.map(function (src, pi) {
              var microShift = (seededRand(ri * 100 + pi + 50) - 0.5) * 5;
              var isMoving = seededRand(ri * 100 + pi + 70) > 0.82;
              return (
                <div key={pi} style={{
                  transform: "translateX(" + microShift + "px)",
                  animation: isMoving ? "personShift " + (7 + seededRand(ri * 100 + pi + 80) * 5) + "s ease-in-out infinite" : "none",
                }}>
                  <div style={{
                    width: size, height: size * 1.35, borderRadius: size * 0.18,
                    overflow: "hidden", background: "rgba(255,255,255,0.05)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}>
                    <img src={src} alt="" style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      filter: "brightness(0.7) saturate(0.8)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VIDEO AUDIENCE                                                     */
/* ------------------------------------------------------------------ */

function VideoAudience({ videoSrc, videoRef }: { videoSrc: string; videoRef: any }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: "70%",
      overflow: "hidden", pointerEvents: "none",
    }}>
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          filter: "brightness(0.55) saturate(0.7)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
        }}
      />
      {/* Subtle vignette overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center bottom, transparent 40%, rgba(10,10,18,0.7) 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FILE UPLOAD COMPONENTS                                             */
/* ------------------------------------------------------------------ */

function PhotoUploader({ photos, setPhotos }: { photos: string[]; setPhotos: any }) {
  var inputRef = useRef(null);

  var handleFiles = function (e) {
    var files = Array.from(e.target.files || []);
    files.forEach(function (file) {
      if (!file.type.startsWith("image/")) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        setPhotos(function (prev) { return prev.concat([ev.target.result]); });
      };
      reader.readAsDataURL(file);
    });
  };

  var removePhoto = function (idx) {
    setPhotos(function (prev) { return prev.filter(function (_, i) { return i !== idx; }); });
  };

  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", marginBottom: 10, textAlign: "center" }}>
        Audience Photos
      </p>
      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, textAlign: "center" }}>
        Upload photos of people. They will be arranged as your audience. Upload at least 1 — it will be duplicated to fill seats.
      </p>

      {/* Upload zone */}
      <div
        onClick={function () { inputRef.current && inputRef.current.click(); }}
        style={{
          border: "2px dashed rgba(124,58,237,0.25)", borderRadius: 16,
          padding: "20px", textAlign: "center", cursor: "pointer",
          background: "rgba(124,58,237,0.03)", transition: "all 0.2s",
          marginBottom: 14,
        }}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
        <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
        <div style={{ fontSize: 14, color: "#7c3aed", fontWeight: 600 }}>Click to upload photos</div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>JPG, PNG · Multiple allowed · Portraits work best</div>
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {photos.map(function (src, i) {
            return (
              <div key={i} style={{ position: "relative" }}>
                <img src={src} alt="" style={{
                  width: 56, height: 72, objectFit: "cover", borderRadius: 10,
                  border: "2px solid rgba(124,58,237,0.15)",
                }} />
                <button onClick={function (e) { e.stopPropagation(); removePhoto(i); }} style={{
                  position: "absolute", top: -6, right: -6, width: 20, height: 20,
                  borderRadius: "50%", border: "none", background: "#ef4444", color: "#fff",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VideoUploader({ videoSrc, setVideoSrc }: { videoSrc: string | null; setVideoSrc: any }) {
  var inputRef = useRef(null);

  var handleFile = function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var url = URL.createObjectURL(file);
    setVideoSrc(url);
  };

  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", marginBottom: 10, textAlign: "center" }}>
        Audience Video
      </p>
      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, textAlign: "center" }}>
        Upload a video of a real audience, lecture hall, or conference room. It will loop as your backdrop.
      </p>

      {!videoSrc ? (
        <div
          onClick={function () { inputRef.current && inputRef.current.click(); }}
          style={{
            border: "2px dashed rgba(124,58,237,0.25)", borderRadius: 16,
            padding: "20px", textAlign: "center", cursor: "pointer",
            background: "rgba(124,58,237,0.03)", transition: "all 0.2s",
          }}
        >
          <input ref={inputRef} type="file" accept="video/*" onChange={handleFile} style={{ display: "none" }} />
          <div style={{ fontSize: 28, marginBottom: 6 }}>🎥</div>
          <div style={{ fontSize: 14, color: "#7c3aed", fontWeight: 600 }}>Click to upload a video</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>MP4, WebM · Audience/room footage works best</div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <video src={videoSrc} style={{
            width: "100%", maxWidth: 400, borderRadius: 14,
            border: "2px solid rgba(124,58,237,0.15)",
          }} autoPlay loop muted playsInline />
          <div style={{ marginTop: 10 }}>
            <button onClick={function () { setVideoSrc(null); }} style={{
              padding: "8px 20px", borderRadius: 10, border: "1.5px solid #e5e7eb",
              background: "transparent", color: "#6b7280", fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            }}>Remove video</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN                                                               */
/* ------------------------------------------------------------------ */

export default function ProjectionPage() {
  var _s = useState("setup"); var phase = _s[0]; var setPhase = _s[1];
  var _d = useState(300); var totalSeconds = _d[0]; var setTotalSeconds = _d[1];
  var _v = useState("conference"); var venue = _v[0]; var setVenue = _v[1];
  var _a = useState("silhouettes"); var audienceMode = _a[0]; var setAudienceMode = _a[1];
  var _e = useState(0); var elapsed = _e[0]; var setElapsed = _e[1];
  var _c = useState(null); var activeCue = _c[0]; var setActiveCue = _c[1];
  var _cc = useState("#f59e0b"); var cueColor = _cc[0]; var setCueColor = _cc[1];
  var _p = useState(false); var isPaused = _p[0]; var setIsPaused = _p[1];
  var _pm = useState(false); var projectorMode = _pm[0]; var setProjectorMode = _pm[1];
  var _ph = useState([]); var photos = _ph[0]; var setPhotos = _ph[1];
  var _vs = useState(null); var videoSrc = _vs[0]; var setVideoSrc = _vs[1];

  var intervalRef = useRef(null);
  var firedCues = useRef(new Set());
  var containerRef = useRef(null);
  var videoRef = useRef(null);

  var remaining = totalSeconds - elapsed;
  var progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;

  var stopSession = useCallback(function () {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setPhase("done");
  }, []);

  var startSession = useCallback(function () {
    setElapsed(0); setActiveCue(null);
    firedCues.current = new Set();
    setPhase("live"); setIsPaused(false);
  }, []);

  var resetSession = useCallback(function () {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setElapsed(0); setActiveCue(null);
    firedCues.current = new Set();
    setPhase("setup"); setIsPaused(false); setProjectorMode(false);
  }, []);

  var togglePause = useCallback(function () { setIsPaused(function (p) { return !p; }); }, []);

  var goFullscreen = function () {
    if (containerRef.current && containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(function () { });
    }
  };

  // Timer
  useEffect(function () {
    if (phase !== "live" || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(function () {
      setElapsed(function (prev) {
        var next = prev + 1;
        if (next >= totalSeconds) { stopSession(); return totalSeconds; }
        return next;
      });
    }, 1000);
    return function () { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, isPaused, totalSeconds, stopSession]);

  // Cues
  useEffect(function () {
    if (phase !== "live") return;
    for (var i = 0; i < CUES.length; i++) {
      var cue = CUES[i];
      var threshold = Math.floor(cue.at * totalSeconds);
      if (elapsed >= threshold && !firedCues.current.has(threshold)) {
        firedCues.current.add(threshold);
        setActiveCue(cue.label);
        setCueColor(cue.color);
        setTimeout(function () { setActiveCue(null); }, 5000);
      }
    }
  }, [elapsed, phase, totalSeconds]);

  // Keyboard
  useEffect(function () {
    var handler = function (e) {
      if (e.key === " " || e.code === "Space") { e.preventDefault(); togglePause(); }
      if (e.key === "Escape") resetSession();
      if (e.key === "f" || e.key === "F") goFullscreen();
      if (e.key === "p" || e.key === "P") setProjectorMode(function (m) { return !m; });
    };
    if (phase === "live") {
      window.addEventListener("keydown", handler);
      return function () { window.removeEventListener("keydown", handler); };
    }
  }, [phase, togglePause, resetSession]);

  var canStart = audienceMode === "silhouettes"
    || (audienceMode === "photos" && photos.length > 0)
    || (audienceMode === "video" && videoSrc);

  return (
    <div ref={containerRef} style={{
      minHeight: "100vh",
      background: phase === "setup" ? "#faf9ff" : "#0a0a12",
      color: phase === "setup" ? "#1e1b4b" : "#fff",
      transition: "background .6s, color .6s",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
      cursor: phase === "live" && projectorMode ? "none" : "default",
    }}>
      <style>{"\n@keyframes audienceBreathe { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-2px); } }\n@keyframes personShift { 0%,100% { transform:translateX(0); } 25% { transform:translateX(2px); } 75% { transform:translateX(-1px); } }\n@keyframes cueSlideIn { from { opacity:0; transform:translateY(-20px) translateX(-50%); } to { opacity:1; transform:translateY(0) translateX(-50%); } }\n@keyframes pulseRing { 0% { box-shadow:0 0 0 0 rgba(124,58,237,0.4); } 70% { box-shadow:0 0 0 20px rgba(124,58,237,0); } 100% { box-shadow:0 0 0 0 rgba(124,58,237,0); } }\n@keyframes timerGlow { 0%,100% { text-shadow:0 0 30px rgba(124,58,237,0.3); } 50% { text-shadow:0 0 60px rgba(124,58,237,0.6); } }\n@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }\n"}</style>

      {/* =========== SETUP =========== */}
      {phase === "setup" && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "flex-start", minHeight: "100vh", padding: "32px 24px",
          overflowY: "auto",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12, marginTop: 8 }}>🎬</div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(26px, 4vw, 38px)", marginBottom: 6, letterSpacing: "-0.02em",
          }}>Projection Mode</h1>
          <p style={{
            color: "#9ca3af", fontSize: 14, marginBottom: 32,
            textAlign: "center", maxWidth: 460, lineHeight: 1.6,
          }}>
            Practice speaking to a realistic audience. Upload your own photos or videos, or use generated silhouettes. Connect a projector for full immersion.
          </p>

          {/* Audience Mode */}
          <div style={{ marginBottom: 28, width: "100%", maxWidth: 600 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", marginBottom: 10, textAlign: "center" }}>Audience Type</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {AUDIENCE_MODES.map(function (mode) {
                return (
                  <button key={mode.id} onClick={function () { setAudienceMode(mode.id); }} style={{
                    padding: "16px 10px", borderRadius: 14,
                    border: audienceMode === mode.id ? "2px solid #7c3aed" : "1.5px solid #e5e7eb",
                    background: audienceMode === mode.id ? "rgba(124,58,237,0.08)" : "transparent",
                    color: audienceMode === mode.id ? "#7c3aed" : "#6b7280",
                    fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{mode.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{mode.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{mode.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo uploader */}
          {audienceMode === "photos" && (
            <div style={{ marginBottom: 28, width: "100%", maxWidth: 600 }}>
              <PhotoUploader photos={photos} setPhotos={setPhotos} />
            </div>
          )}

          {/* Video uploader */}
          {audienceMode === "video" && (
            <div style={{ marginBottom: 28, width: "100%", maxWidth: 600 }}>
              <VideoUploader videoSrc={videoSrc} setVideoSrc={setVideoSrc} />
            </div>
          )}

          {/* Venue selector (only for silhouettes and photos) */}
          {audienceMode !== "video" && (
            <div style={{ marginBottom: 28, width: "100%", maxWidth: 600 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", marginBottom: 10, textAlign: "center" }}>Venue Size</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                {VENUES.map(function (v) {
                  return (
                    <button key={v.id} onClick={function () { setVenue(v.id); }} style={{
                      padding: "12px 10px", borderRadius: 12,
                      border: venue === v.id ? "2px solid #7c3aed" : "1.5px solid #e5e7eb",
                      background: venue === v.id ? "rgba(124,58,237,0.08)" : "transparent",
                      color: venue === v.id ? "#7c3aed" : "#6b7280",
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s",
                      textAlign: "center",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{v.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>{v.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Duration */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed", marginBottom: 10, textAlign: "center" }}>Session Duration</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {DURATIONS.map(function (d) {
                return (
                  <button key={d.seconds} onClick={function () { setTotalSeconds(d.seconds); }} style={{
                    padding: "10px 22px", borderRadius: 12,
                    border: totalSeconds === d.seconds ? "2px solid #7c3aed" : "1.5px solid #e5e7eb",
                    background: totalSeconds === d.seconds ? "rgba(124,58,237,0.08)" : "transparent",
                    color: totalSeconds === d.seconds ? "#7c3aed" : "#6b7280",
                    fontWeight: 600, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>{d.label}</button>
                );
              })}
            </div>
          </div>

          <button
            onClick={function () { if (canStart) { startSession(); setTimeout(goFullscreen, 100); } }}
            disabled={!canStart}
            style={{
              padding: "18px 48px", borderRadius: 16, border: "none",
              background: canStart ? "linear-gradient(135deg, #7c3aed, #6366f1)" : "#d1d5db",
              color: "#fff", fontSize: 18, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              cursor: canStart ? "pointer" : "not-allowed",
              boxShadow: canStart ? "0 8px 32px rgba(124,58,237,0.35)" : "none",
              transition: "all 0.3s",
              animation: canStart ? "pulseRing 2s infinite" : "none",
              opacity: canStart ? 1 : 0.5,
            }}
          >Enter Stage →</button>

          <div style={{ color: "#c4b5fd", fontSize: 11, marginTop: 18, textAlign: "center", lineHeight: 1.9 }}>
            <div>F = fullscreen · Space = pause · Esc = exit</div>
            <div>P = projector mode (audience only, no UI)</div>
          </div>
        </div>
      )}

      {/* =========== LIVE / DONE =========== */}
      {(phase === "live" || phase === "done") && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: projectorMode ? "flex-end" : "center",
          minHeight: "100vh", position: "relative",
          animation: "fadeIn 0.8s ease",
        }}>
          {/* Ambient stage light */}
          {!projectorMode && (
            <div style={{
              position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)",
              width: 600, height: 300, borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(124,58,237,0.04) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
          )}

          {/* Timer */}
          {!projectorMode && (
            <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: 20 }}>
              <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(64px, 12vw, 120px)",
                fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1,
                animation: phase === "live" && !isPaused ? "timerGlow 3s ease-in-out infinite" : "none",
                color: remaining <= 30 && phase === "live" ? "#f59e0b" : "#fff",
                transition: "color 0.5s",
              }}>{formatTime(Math.max(0, remaining))}</div>
              <div style={{
                width: "clamp(200px, 40vw, 400px)", height: 3, borderRadius: 2,
                background: "rgba(255,255,255,0.06)", margin: "20px auto 0", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: phase === "done" ? "linear-gradient(90deg, #22c55e, #10b981)" : "linear-gradient(90deg, #7c3aed, #a78bfa)",
                  width: Math.min(progress * 100, 100) + "%", transition: "width 1s linear",
                }} />
              </div>
              {isPaused && phase === "live" && (
                <div style={{ marginTop: 16, fontSize: 15, fontWeight: 600, color: "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase" }}>⏸ Paused</div>
              )}
            </div>
          )}

          {/* Cue */}
          {activeCue && !projectorMode && (
            <div style={{
              position: "absolute", top: "8%", left: "50%",
              background: cueColor + "15", border: "1px solid " + cueColor + "40",
              borderRadius: 16, padding: "12px 28px", fontSize: 17, fontWeight: 600,
              color: cueColor, animation: "cueSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              zIndex: 20, whiteSpace: "nowrap",
            }}>{activeCue}</div>
          )}

          {/* Done */}
          {phase === "done" && !projectorMode && (
            <div style={{ textAlign: "center", marginTop: 16, zIndex: 10, animation: "fadeIn 0.5s ease" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👏</div>
              <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, marginBottom: 6 }}>Session Complete</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>{formatTime(totalSeconds)} delivered.</p>
            </div>
          )}

          {/* Controls */}
          {!projectorMode && (
            <div style={{
              position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
              display: "flex", gap: 12, zIndex: 10, flexWrap: "wrap", justifyContent: "center",
            }}>
              {phase === "live" && (<>
                <button onClick={togglePause} style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{isPaused ? "▶ Resume" : "⏸ Pause"}</button>
                <button onClick={function () { setProjectorMode(true); }} style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.08)", color: "#a78bfa", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>📽 Projector</button>
                <button onClick={goFullscreen} style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>⛶ Fullscreen</button>
                <button onClick={resetSession} style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "#f87171", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>✕ End</button>
              </>)}
              {phase === "done" && (<>
                <button onClick={startSession} style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #7c3aed, #6366f1)", color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.3)" }}>Go Again →</button>
                <button onClick={resetSession} style={{ padding: "14px 32px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>← Back</button>
              </>)}
            </div>
          )}

          {/* AUDIENCE RENDERING */}
          {audienceMode === "silhouettes" && <SilhouetteAudience venue={venue} />}
          {audienceMode === "photos" && photos.length > 0 && <PhotoAudience photos={photos} venue={venue} />}
          {audienceMode === "video" && videoSrc && <VideoAudience videoSrc={videoSrc} videoRef={videoRef} />}

          {/* Projector mode: tiny timer */}
          {projectorMode && phase === "live" && (
            <div style={{
              position: "absolute", top: 16, right: 20, zIndex: 10,
              fontSize: 14, color: "rgba(255,255,255,0.12)",
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}>{formatTime(remaining)}</div>
          )}
        </div>
      )}
    </div>
  );
}
