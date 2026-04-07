"use client";
// src/components/features/AuthScreen.tsx

import { useState } from "react";
import { useAuth }  from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Icon }     from "@/components/ui/Icon";
import { Spinner }  from "@/components/ui/Spinner";

export function AuthScreen() {
  const [mode,   setMode]   = useState<"login" | "register">("login");
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [pw,     setPw]     = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState("");
  const { login, register } = useAuth();
  const toast = useToast();

  const iS: React.CSSProperties = {
    width: "100%", padding: "13px 16px 13px 44px",
    background: "#0f172a", border: "1px solid #ffffff12",
    borderRadius: 12, color: "#e2e8f0", fontSize: 16, outline: "none", boxSizing: "border-box",
  };

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      if (mode === "login") { await login(email, pw); toast("Bem-vindo de volta! 👋", "success"); }
      else                  { await register(name, email, pw); toast("Conta criada! 🎉", "success"); }
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -100, right: -80, width: 320, height: 320, borderRadius: "50%", background: "#4D96FF0c", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 280, height: 280, borderRadius: "50%", background: "#6BCB770a", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* logo */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg,#4D96FF,#6BCB77)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 8px 32px rgba(77,150,255,0.3)", fontSize: 28 }}>💚</div>
        <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-1.2px" }}>Fluxo</h1>
        <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>Seu dinheiro, em movimento.</p>
      </div>

      <div style={{ width: "100%", maxWidth: 390, background: "#1e293b", borderRadius: 20, padding: 24, border: "1px solid #ffffff0d", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}>
        {/* tabs */}
        <div style={{ display: "flex", background: "#0f172a", borderRadius: 10, padding: 4, marginBottom: 22 }}>
          {(["login", "register"] as const).map((v) => (
            <button key={v} onClick={() => { setMode(v); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer", background: mode === v ? "#4D96FF" : "transparent", color: mode === v ? "#fff" : "#64748b", fontWeight: 600, fontSize: 14 }}>
              {v === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><Icon name="person" size={17} color="#475569" /></div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" style={iS} onFocus={(e) => (e.target.style.borderColor = "#4D96FF")} onBlur={(e) => (e.target.style.borderColor = "#ffffff12")} />
            </div>
          )}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><Icon name="mail" size={17} color="#475569" /></div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" type="email" autoCapitalize="none" style={iS} onFocus={(e) => (e.target.style.borderColor = "#4D96FF")} onBlur={(e) => (e.target.style.borderColor = "#ffffff12")} />
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><Icon name="lock" size={17} color="#475569" /></div>
            <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Senha" type={showPw ? "text" : "password"} style={{ ...iS, paddingRight: 48 }} onFocus={(e) => (e.target.style.borderColor = "#4D96FF")} onBlur={(e) => (e.target.style.borderColor = "#ffffff12")} onKeyDown={(e) => e.key === "Enter" && submit()} />
            <button onClick={() => setShowPw((p) => !p)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4 }}><Icon name={showPw ? "eyeoff" : "eye"} size={17} color="#475569" /></button>
          </div>
        </div>

        {err && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#FF6B6B12", border: "1px solid #FF6B6B33", color: "#FF6B6B", fontSize: 13 }}>{err}</div>}

        <button onClick={submit} disabled={busy} style={{ width: "100%", marginTop: 18, padding: "15px 0", borderRadius: 12, border: "none", background: busy ? "#1e3a5f" : "linear-gradient(135deg,#4D96FF,#3b82f6)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: busy ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, boxShadow: busy ? "none" : "0 4px 20px rgba(77,150,255,0.3)" }}>
          {busy ? <><Spinner size={18} color="#fff" /><span>Aguarde...</span></> : mode === "login" ? "Entrar →" : "Criar conta →"}
        </button>
      </div>
    </div>
  );
}
