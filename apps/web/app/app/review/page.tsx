"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { apiFetch } from "../../api-client";

var TRACKS = ["Business Pitch", "Academic Talk", "Table Topics", "Hard Q&A", "Casual Conversation"];

function ScoreRing({ label, value, max, color }) {
  var pct = max > 0 ? (value / max) * 100 : 0;
  var r = 32, c = 2 * Math.PI * r, o = c - (pct / 100) * c;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="5" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" transform="rotate(-90 38 38)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }} />
        <text x="38" y="42" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1e1b4b"
          fontFamily="'DM Serif Display',Georgia,serif">{value}</text>
      </svg>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function AudioRecorder({ onRecordingComplete, onTranscriptUpdate }) {
  var _r = useState("idle"), recState = _r[0], setRecState = _r[1];
  var _t = useState(0), timer = _t[0], setTimer = _t[1];
  var _b = useState(null), audioBlob = _b[0], setAudioBlob = _b[1];
  var _u = useState(null), audioUrl = _u[0], setAudioUrl = _u[1];
  var _l = useState([]), levels = _l[0], setLevels = _l[1];
  var _lt = useState(""), liveTranscript = _lt[0], setLiveTranscript = _lt[1];
  var _ss = useState(false), speechOk = _ss[0], setSpeechOk = _ss[1];

  var mrRef = useRef(null), chunks = useRef([]), streamRef = useRef(null);
  var analyserRef = useRef(null), afRef = useRef(null), timerRef = useRef(null);
  var startT = useRef(0), recogRef = useRef(null), txRef = useRef(""), itRef = useRef("");

  useEffect(function(){ setSpeechOk(!!(window.SpeechRecognition||window.webkitSpeechRecognition)); },[]);

  var cleanup = useCallback(function(){
    if(timerRef.current) clearInterval(timerRef.current);
    if(afRef.current) cancelAnimationFrame(afRef.current);
    if(streamRef.current) streamRef.current.getTracks().forEach(function(t){t.stop();});
    if(recogRef.current) try{recogRef.current.stop();}catch(e){}
  },[]);
  useEffect(function(){return cleanup;},[cleanup]);

  var startSR = function(){
    var SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    var rec = new SR(); rec.continuous=true; rec.interimResults=true; rec.lang="en-US";
    recogRef.current=rec; txRef.current=""; itRef.current="";
    rec.onresult=function(ev){
      var f="",im="";
      for(var i=0;i<ev.results.length;i++){
        if(ev.results[i].isFinal) f+=ev.results[i][0].transcript+" ";
        else im+=ev.results[i][0].transcript;
      }
      txRef.current=f; itRef.current=im;
      var full=f+im; setLiveTranscript(full);
      if(onTranscriptUpdate) onTranscriptUpdate(full);
    };
    rec.onerror=function(ev){ if(ev.error==="no-speech"||ev.error==="aborted") try{rec.start();}catch(e){} };
    rec.onend=function(){ try{rec.start();}catch(e){} };
    try{rec.start();}catch(e){}
  };

  var startRec = async function(){
    try{
      var stream = await navigator.mediaDevices.getUserMedia({audio:true});
      streamRef.current=stream;
      var ctx=new AudioContext(), src=ctx.createMediaStreamSource(stream), an=ctx.createAnalyser();
      an.fftSize=256; src.connect(an); analyserRef.current=an;
      var opts={mimeType:"audio/webm;codecs=opus"};
      try{new MediaRecorder(stream,opts);}catch(e){opts={};}
      var mr=new MediaRecorder(stream,opts); mrRef.current=mr; chunks.current=[];
      mr.ondataavailable=function(e){if(e.data.size>0) chunks.current.push(e.data);};
      mr.onstop=function(){
        var blob=new Blob(chunks.current,{type:mr.mimeType||"audio/webm"});
        setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob)); setRecState("done");
        if(streamRef.current) streamRef.current.getTracks().forEach(function(t){t.stop();});
        if(timerRef.current) clearInterval(timerRef.current);
        if(afRef.current) cancelAnimationFrame(afRef.current);
        if(recogRef.current) try{recogRef.current.stop();}catch(e){}
        var ft=txRef.current+itRef.current; setLiveTranscript(ft);
        if(onTranscriptUpdate) onTranscriptUpdate(ft);
      };
      mr.start(250); setRecState("recording"); startT.current=Date.now();
      setTimer(0); setLevels([]); setLiveTranscript(""); txRef.current=""; itRef.current="";
      timerRef.current=setInterval(function(){setTimer(function(){return Math.floor((Date.now()-startT.current)/1000);});},1000);
      startSR();
      var bl=an.frequencyBinCount, da=new Uint8Array(bl);
      var tick=function(){
        an.getByteFrequencyData(da); var s=0;
        for(var i=0;i<bl;i++) s+=da[i];
        setLevels(function(p){var n=p.concat([s/bl/255]); return n.length>80?n.slice(-80):n;});
        afRef.current=requestAnimationFrame(tick);
      }; tick();
    }catch(err){alert("Microphone access denied.");}
  };

  var stopRec=function(){if(mrRef.current&&mrRef.current.state!=="inactive") mrRef.current.stop();};
  var pauseRec=function(){if(mrRef.current&&mrRef.current.state==="recording"){mrRef.current.pause();setRecState("paused");if(timerRef.current)clearInterval(timerRef.current);if(recogRef.current)try{recogRef.current.stop();}catch(e){}}};
  var resumeRec=function(){if(mrRef.current&&mrRef.current.state==="paused"){mrRef.current.resume();setRecState("recording");var off=timer,rt=Date.now();timerRef.current=setInterval(function(){setTimer(off+Math.floor((Date.now()-rt)/1000));},1000);startSR();}};
  var resetRec=function(){cleanup();if(audioUrl)URL.revokeObjectURL(audioUrl);setAudioBlob(null);setAudioUrl(null);setRecState("idle");setTimer(0);setLevels([]);setLiveTranscript("");if(onTranscriptUpdate)onTranscriptUpdate("");};
  var confirmRec=function(){if(audioBlob) onRecordingComplete(audioBlob,timer);};
  var fmt=function(s){var m=Math.floor(s/60),sc=s%60;return m.toString().padStart(2,"0")+":"+sc.toString().padStart(2,"0");};

  return (
    <div style={{background:recState==="recording"?"rgba(124,58,237,0.04)":"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",borderRadius:20,padding:24,border:recState==="recording"?"2px solid rgba(124,58,237,0.2)":"1px solid rgba(124,58,237,0.05)",transition:"all 0.3s"}}>
      <style>{"\n@keyframes recPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}\n"}</style>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:recState==="recording"?"#ef4444":recState==="paused"?"#f59e0b":"#d1d5db",animation:recState==="recording"?"recPulse 1.2s ease-in-out infinite":"none"}}/>
        <span style={{fontSize:14,fontWeight:600,color:"#1e1b4b"}}>{recState==="idle"?"Ready to Record":recState==="recording"?"Recording & Transcribing...":recState==="paused"?"Paused":"Recording Complete"}</span>
        {speechOk&&recState==="idle"&&<span style={{fontSize:11,color:"#22c55e",marginLeft:4}}>✓ Auto-transcription ready</span>}
        <span style={{marginLeft:"auto",fontFamily:"'DM Serif Display',Georgia,serif",fontSize:24,color:recState==="recording"?"#7c3aed":"#9ca3af"}}>{fmt(timer)}</span>
      </div>
      {(recState==="recording"||recState==="paused")&&<div style={{display:"flex",alignItems:"center",gap:2,height:48,marginBottom:12,padding:"0 4px"}}>{levels.map(function(lv,i){return<div key={i} style={{width:3,borderRadius:2,flexShrink:0,height:Math.max(3,lv*44)+"px",background:"linear-gradient(to top,#7c3aed,#a78bfa)",opacity:.4+lv*.6,transition:"height 0.1s"}}/>;})}</div>}
      {(recState==="recording"||recState==="paused")&&liveTranscript&&<div style={{background:"rgba(124,58,237,0.04)",borderRadius:12,padding:"10px 14px",marginBottom:14,maxHeight:100,overflowY:"auto",fontSize:13,color:"#4b5563",lineHeight:1.6,fontStyle:"italic",border:"1px solid rgba(124,58,237,0.08)"}}><span style={{fontSize:10,color:"#7c3aed",fontWeight:600,fontStyle:"normal",display:"block",marginBottom:4}}>LIVE TRANSCRIPT</span>{liveTranscript}</div>}
      {recState==="done"&&audioUrl&&<div style={{marginBottom:16}}><audio controls src={audioUrl} style={{width:"100%",borderRadius:12}}/></div>}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {recState==="idle"&&<button onClick={startRec} style={{padding:"12px 28px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#7c3aed,#6366f1)",color:"#fff",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",boxShadow:"0 4px 16px rgba(124,58,237,0.25)",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>🎙</span> Start Recording</button>}
        {recState==="recording"&&<><button onClick={pauseRec} style={{padding:"10px 22px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"white",color:"#6b7280",fontSize:13,fontWeight:500,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>⏸ Pause</button><button onClick={stopRec} style={{padding:"10px 22px",borderRadius:10,border:"none",background:"#ef4444",color:"#fff",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>⏹ Stop</button></>}
        {recState==="paused"&&<><button onClick={resumeRec} style={{padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#7c3aed,#6366f1)",color:"#fff",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>▶ Resume</button><button onClick={stopRec} style={{padding:"10px 22px",borderRadius:10,border:"none",background:"#ef4444",color:"#fff",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>⏹ Stop</button></>}
        {recState==="done"&&<><button onClick={confirmRec} style={{padding:"12px 28px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#7c3aed,#6366f1)",color:"#fff",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",boxShadow:"0 4px 16px rgba(124,58,237,0.25)"}}>✓ Use This Recording</button><button onClick={startRec} style={{padding:"10px 22px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"white",color:"#6b7280",fontSize:13,fontWeight:500,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>🔄 Again</button><button onClick={resetRec} style={{padding:"10px 22px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"white",color:"#6b7280",fontSize:13,fontWeight:500,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>✕ Discard</button></>}
      </div>
      {!speechOk&&recState==="idle"&&<p style={{fontSize:11,color:"#f59e0b",marginTop:10}}>⚠ Auto-transcription needs Chrome or Edge. You can still record and type manually.</p>}
    </div>
  );
}

export default function ReviewPage(){
  var _tr=useState(TRACKS[0]),track=_tr[0],setTrack=_tr[1];
  var _tx=useState(""),transcript=_tx[0],setTranscript=_tx[1];
  var _du=useState(""),duration=_du[0],setDuration=_du[1];
  var _fi=useState(null),file=_fi[0],setFile=_fi[1];
  var _fn=useState(""),fileName=_fn[0],setFileName=_fn[1];
  var _lo=useState(false),loading=_lo[0],setLoading=_lo[1];
  var _re=useState(null),result=_re[0],setResult=_re[1];
  var _er=useState(""),error=_er[0],setError=_er[1];
  var _sm=useState(false),showMetrics=_sm[0],setShowMetrics=_sm[1];
  var _im=useState("record"),inputMode=_im[0],setInputMode=_im[1];
  var fileRef=useRef(null);

  var uploadAndGrade=async function(){
    setError("");
    if(!transcript.trim()){setError("No transcript. Speak during recording or paste manually.");return;}
    setLoading(true);
    try{
      var form=new FormData(); form.append("track",track); form.append("transcript",transcript);
      if(duration) form.append("duration_seconds",duration);
      if(file){var mf=file instanceof Blob&&!(file instanceof File)?new File([file],fileName||"recording.webm",{type:"audio/webm"}):file; form.append("media",mf);}
      var ar=await apiFetch("/attempts/",{method:"POST",body:form});
      if(!ar.ok){setError("Failed to save.");return;} var att=await ar.json();
      var gr=await apiFetch("/grading/grade",{method:"POST",body:JSON.stringify({attempt_id:att.id,transcript:transcript,duration_seconds:duration?parseInt(duration):null})});
      if(!gr.ok){setError("Grading failed.");return;} setResult(await gr.json());
    }catch(e){setError("Server connection failed.");}finally{setLoading(false);}
  };

  var resetAll=function(){setResult(null);setTranscript("");setFile(null);setFileName("");setDuration("");setShowMetrics(false);setError("");};

  var is={width:"100%",padding:"12px 14px",borderRadius:12,border:"1.5px solid #e5e7eb",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",background:"#faf9ff"};

  return(
    <div style={{padding:"40px 32px",maxWidth:740}}>
      <h1 style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:28,color:"#1e1b4b",marginBottom:4}}>Record & Review</h1>
      <p style={{color:"#9ca3af",fontSize:14,marginBottom:32}}>Record with auto-transcription, then get feedback on clarity, delivery, pacing, and accent.</p>

      {!result?(
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div><label style={{fontSize:13,fontWeight:600,color:"#4b5563",marginBottom:6,display:"block"}}>Track</label>
          <select value={track} onChange={function(e){setTrack(e.target.value);}} style={{...is,cursor:"pointer"}}>{TRACKS.map(function(t){return<option key={t} value={t}>{t}</option>;})}</select></div>

          <div><label style={{fontSize:13,fontWeight:600,color:"#4b5563",marginBottom:8,display:"block"}}>Audio Source</label>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[{id:"record",label:"🎙 Record Live",sub:"auto-transcribes"},{id:"upload",label:"📎 Upload File",sub:"manual transcript"}].map(function(m){
              return<button key={m.id} onClick={function(){setInputMode(m.id);}} style={{padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",border:inputMode===m.id?"2px solid #7c3aed":"1.5px solid #e5e7eb",background:inputMode===m.id?"rgba(124,58,237,0.08)":"transparent",color:inputMode===m.id?"#7c3aed":"#6b7280",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span>{m.label}</span><span style={{fontSize:10,opacity:.7,fontWeight:400}}>{m.sub}</span></button>;
            })}
          </div>
          {inputMode==="record"?<AudioRecorder onRecordingComplete={function(b,s){setFile(b);setFileName("recording-"+new Date().toISOString().slice(0,16)+".webm");setDuration(String(s));}} onTranscriptUpdate={function(t){setTranscript(t);}}/>:
          <div><input ref={fileRef} type="file" accept="audio/*,video/*" onChange={function(e){var f=e.target.files&&e.target.files[0];if(f){setFile(f);setFileName(f.name);}}} style={{display:"none"}}/>
          <button onClick={function(){fileRef.current&&fileRef.current.click();}} style={{...is,cursor:"pointer",color:file?"#1e1b4b":"#9ca3af",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>📎</span>{fileName||"Choose file..."}</button></div>}
          {file&&<div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(124,58,237,0.06)",borderRadius:10,padding:"8px 14px",marginTop:10,fontSize:13,color:"#7c3aed"}}><span>✓</span><span style={{fontWeight:600}}>{fileName}</span>{duration&&<span style={{color:"#9ca3af"}}>· {duration}s</span>}<button onClick={function(){setFile(null);setFileName("");setDuration("");}} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:14}}>×</button></div>}
          </div>

          {inputMode==="upload"&&<div><label style={{fontSize:13,fontWeight:600,color:"#4b5563",marginBottom:6,display:"block"}}>Duration (seconds)</label><input type="number" placeholder="e.g. 180" value={duration} onChange={function(e){setDuration(e.target.value);}} style={is}/></div>}

          <div><label style={{fontSize:13,fontWeight:600,color:"#4b5563",marginBottom:6,display:"block"}}>Transcript {inputMode==="record"?"(auto-filled — edit if needed)":"*"}</label>
          <textarea rows={8} placeholder={inputMode==="record"?"Start recording — your speech appears here automatically...":"Paste what you said here."} value={transcript} onChange={function(e){setTranscript(e.target.value);}} style={{...is,resize:"vertical",lineHeight:1.6}}/>
          {transcript&&<div style={{fontSize:11,color:"#9ca3af",marginTop:6}}>{transcript.split(/\s+/).filter(Boolean).length} words{duration?" · "+duration+"s":""}</div>}
          </div>

          {error&&<p style={{color:"#ef4444",fontSize:13}}>{error}</p>}
          <button onClick={uploadAndGrade} disabled={loading} style={{padding:"16px",borderRadius:14,border:"none",fontSize:16,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",background:"linear-gradient(135deg,#7c3aed,#6366f1)",color:"#fff",boxShadow:"0 8px 32px rgba(124,58,237,0.3)",opacity:loading?.7:1}}>{loading?"Analyzing...":"Generate Feedback"}</button>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:24}}>
          {/* Score header */}
          <div style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",borderRadius:24,padding:"32px 28px",color:"#fff",boxShadow:"0 16px 48px rgba(124,58,237,0.25)"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:13,opacity:.8,marginBottom:6}}>Overall Score</div>
              <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:72,lineHeight:1}}>{result.scores?result.scores.overall:result.score}</div>
              <div style={{fontSize:13,opacity:.6,marginTop:4}}>{track} · out of 100</div>
            </div>
            {result.scores&&<div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
              <ScoreRing label="Clarity" value={result.scores.clarity} max={25} color="#a78bfa"/>
              <ScoreRing label="Delivery" value={result.scores.delivery} max={25} color="#c4b5fd"/>
              <ScoreRing label="Pacing" value={result.scores.pacing} max={25} color="#818cf8"/>
              <ScoreRing label="Structure" value={result.scores.structure} max={25} color="#6366f1"/>
            </div>}
          </div>

          {/* Feedback */}
          <div style={{background:"rgba(255,255,255,0.9)",backdropFilter:"blur(12px)",borderRadius:20,padding:28,border:"1px solid rgba(124,58,237,0.05)"}}>
            <h3 style={{fontSize:16,fontWeight:600,color:"#1e1b4b",marginBottom:16}}>✨ Strengths</h3>
            {result.feedback.strengths.map(function(s,i){return<p key={i} style={{fontSize:14,color:"#4b5563",lineHeight:1.7,marginBottom:8,paddingLeft:12,borderLeft:"2px solid #c4b5fd"}}>{s}</p>;})}
            <h3 style={{fontSize:16,fontWeight:600,color:"#1e1b4b",marginTop:24,marginBottom:8}}>🎯 Focus Area</h3>
            <p style={{fontSize:14,color:"#4b5563",lineHeight:1.7,paddingLeft:12,borderLeft:"2px solid #f59e0b"}}>{result.feedback.focus_area}</p>
            <h3 style={{fontSize:16,fontWeight:600,color:"#1e1b4b",marginTop:24,marginBottom:8}}>🏋️ Drill for Tomorrow</h3>
            <p style={{fontSize:14,color:"#4b5563",lineHeight:1.7,paddingLeft:12,borderLeft:"2px solid #10b981"}}>{result.feedback.drill}</p>
          </div>

          {/* Accent challenges */}
          {result.metrics.clarity_challenges&&Object.keys(result.metrics.clarity_challenges).length>0&&(
            <div style={{background:"rgba(255,255,255,0.9)",borderRadius:20,padding:28,border:"1px solid rgba(124,58,237,0.05)"}}>
              <h3 style={{fontSize:16,fontWeight:600,color:"#1e1b4b",marginBottom:12}}>🗣️ Accent & Clarity Focus</h3>
              <p style={{fontSize:13,color:"#9ca3af",marginBottom:14}}>Words that commonly challenge international speakers:</p>
              {Object.entries(result.metrics.clarity_challenges).map(function(e){
                var labels={"th_sounds":"'th' sounds","v_and_w":"'v' and 'w'","r_and_l":"'r' and 'l'","ed_endings":"'-ed' endings","consonant_clusters":"Consonant clusters"};
                return<div key={e[0]} style={{marginBottom:12}}><div style={{fontSize:13,fontWeight:600,color:"#7c3aed",marginBottom:4}}>{labels[e[0]]||e[0]}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{e[1].map(function(w){return<span key={w} style={{padding:"4px 10px",borderRadius:8,background:"rgba(124,58,237,0.06)",fontSize:13,color:"#4b5563"}}>{w}</span>;})}</div></div>;
              })}
            </div>
          )}

          {/* Metrics */}
          <div style={{background:"rgba(255,255,255,0.7)",borderRadius:16,border:"1px solid rgba(124,58,237,0.05)",overflow:"hidden"}}>
            <button onClick={function(){setShowMetrics(!showMetrics);}} style={{width:"100%",padding:"16px 20px",background:"none",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:14,fontWeight:600,color:"#7c3aed",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View Detailed Metrics<span style={{transition:"transform .2s",transform:showMetrics?"rotate(180deg)":"rotate(0)"}}>▼</span></button>
            {showMetrics&&<div style={{padding:"0 20px 20px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                {[{l:"Words",v:result.metrics.word_count},{l:"WPM",v:result.metrics.wpm},{l:"Duration",v:result.metrics.duration_seconds?result.metrics.duration_seconds+"s":"N/A"},{l:"Fillers",v:result.metrics.filler_count},{l:"Hedges",v:result.metrics.hedge_count||0},{l:"Sentences",v:result.metrics.sentences?result.metrics.sentences.count:0},{l:"Avg Length",v:result.metrics.sentences?result.metrics.sentences.avg_length+"w":"N/A"},{l:"Transitions",v:result.metrics.transitions?result.metrics.transitions.total:0},{l:"Pause Density",v:result.metrics.pauses?result.metrics.pauses.pause_density_per_100w+"/100w":"N/A"}].map(function(m,i){return<div key={i} style={{background:"#faf9ff",borderRadius:10,padding:10,textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:"#1e1b4b"}}>{m.v}</div><div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>{m.l}</div></div>;})}
              </div>
              {result.metrics.fillers&&Object.keys(result.metrics.fillers).length>0&&<div style={{background:"#faf9ff",borderRadius:10,padding:12,marginBottom:10}}><div style={{fontSize:12,color:"#9ca3af",marginBottom:6}}>Fillers</div><div style={{fontSize:13,color:"#4b5563"}}>{Object.entries(result.metrics.fillers).map(function(e){return<span key={e[0]} style={{marginRight:12}}><strong>{e[0]}</strong> ×{e[1]}</span>;})}</div></div>}
              {result.metrics.hedges&&Object.keys(result.metrics.hedges).length>0&&<div style={{background:"#faf9ff",borderRadius:10,padding:12}}><div style={{fontSize:12,color:"#9ca3af",marginBottom:6}}>Hedging words</div><div style={{fontSize:13,color:"#4b5563"}}>{Object.entries(result.metrics.hedges).map(function(e){return<span key={e[0]} style={{marginRight:12}}><strong>{e[0]}</strong> ×{e[1]}</span>;})}</div></div>}
            </div>}
          </div>
          <button onClick={resetAll} style={{padding:"14px",borderRadius:12,border:"2px solid rgba(124,58,237,0.15)",background:"transparent",color:"#7c3aed",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>← New Attempt</button>
        </div>
      )}
    </div>
  );
}
