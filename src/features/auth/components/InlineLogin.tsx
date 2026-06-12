// src/features/auth/components/InlineLogin.tsx
// Extracted from maha-ai/components/MahaAIButton.tsx
// Inline login panel used inside the AI Services hub floating button.

import { useState, useEffect } from "react";
import { AuthUser } from "../../maha-ai/types/maha.types";
import {
  loginUser,
  registerUser,
  forgotPassword,
  fetchVillages,
  Village,
} from "../../maha-ai/api/mahaApi";
import { useLang } from "../../maha-ai/context/LangContext";
import { t, LANG_META, Lang } from "../../maha-ai/constants/mahaI18n";

// ─── Shared input/label helpers ───────────────────────────────────────────────
export const inputStyle = (focused: boolean): React.CSSProperties => ({
  width: "100%",
  height: 48,
  borderRadius: 12,
  border: `1.5px solid ${focused ? "#22C55E" : "#E2E8F0"}`,
  background: focused ? "#fff" : "#F8FAFC",
  padding: "0 16px 0 44px",
  fontSize: 13.5,
  fontFamily: "Poppins, sans-serif",
  color: "#0F172A",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "all 0.2s ease",
  boxShadow: focused ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
});

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 700,
  color: "#64748B",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

export const iconWrap: React.CSSProperties = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 15,
  zIndex: 1,
  pointerEvents: "none",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthTab = "login" | "register" | "forgot";

interface InlineLoginProps {
  lang: Lang;
  onSuccess: (user: AuthUser, token: string) => void;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const InlineLogin = ({ lang, onSuccess, onBack }: InlineLoginProps) => {
  const s = t(lang);
  const [tab, setTab] = useState<AuthTab>("login");

  // Login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginFocused, setLoginFocused] = useState<"id" | "pass" | null>(null);

  // Register state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    villageId: "",
  });
  const [regFocused, setRegFocused] = useState<string | null>(null);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [villages, setVillages] = useState<Village[]>([]);
  const [villagesLoading, setVillagesLoading] = useState(false);

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotFocused, setForgotFocused] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (tab === "register") {
      setVillagesLoading(true);
      fetchVillages().then((v) => {
        setVillages(v);
        setVillagesLoading(false);
      });
    }
  }, [tab]);

  const setReg = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setLoginError(s.loginEmailOrPhone + " / " + s.loginPassword);
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      const data = await loginUser({ identifier: identifier.trim(), password });
      onSuccess(data.data.user, data.data.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : s.loginCTA);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.name.trim()) {
      setRegError(s.regName);
      return;
    }
    if (!form.email.trim()) {
      setRegError(s.regEmail);
      return;
    }
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setRegError(s.regPhone);
      return;
    }
    if (!form.villageId) {
      setRegError(s.regVillage);
      return;
    }
    if (form.password.length < 6) {
      setRegError(s.regPasswordPlaceholder);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setRegError(s.regConfirmPassword);
      return;
    }
    setRegLoading(true);
    setRegError("");
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        villageId: form.villageId,
      });
      const loginData = await loginUser({
        identifier: form.email.trim(),
        password: form.password,
      });
      onSuccess(loginData.data.user, loginData.data.token);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : s.regCTA);
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!forgotEmail.trim()) {
      setForgotError(s.forgotEmailLabel);
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    try {
      await forgotPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : s.forgotCTA);
    } finally {
      setForgotLoading(false);
    }
  };

  const btnStyle = (loading: boolean): React.CSSProperties => ({
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "none",
    background: loading ? "#CBD5E1" : "linear-gradient(135deg,#22C55E,#15803D)",
    color: "#fff",
    fontSize: 13.5,
    fontWeight: 700,
    fontFamily: "Poppins, sans-serif",
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: loading ? "none" : "0 4px 14px rgba(34,197,94,0.30)",
    transition: "all 0.2s ease",
    marginTop: 4,
  });

  const ErrorBox = ({ msg }: { msg: string }) => (
    <div
      style={{
        background: "#FEF2F2",
        border: "1px solid #FECACA",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 11.5,
        color: "#EF4444",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      ⚠️ {msg}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "Poppins, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#16A34A 0%,#14532D 100%)",
          padding: "16px 18px 14px",
          borderRadius: "22px 22px 0 0",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onBack}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                cursor: "pointer",
                color: "#fff",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ←
            </button>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                MAHA AI
              </div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)" }}>
                {lang === "hi"
                  ? "साइन इन करें"
                  : lang === "mr"
                    ? "साइन इन करा"
                    : "Sign In"}
              </div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span>{LANG_META[lang].flag}</span>
            {LANG_META[lang].nativeLabel}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {tab !== "forgot" && (
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "12px 16px 0",
            flexShrink: 0,
          }}
        >
          {(
            [
              ["login", s.loginTabLogin],
              ["register", s.loginTabRegister],
            ] as [AuthTab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                border: tab === id ? "none" : "1.5px solid #E2E8F0",
                background:
                  tab === id
                    ? "linear-gradient(135deg,#22C55E,#15803D)"
                    : "#F8FAFC",
                color: tab === id ? "#fff" : "#64748B",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  tab === id ? "0 3px 10px rgba(34,197,94,0.25)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 16px 16px",
          scrollbarWidth: "thin",
        }}
      >
        {/* ── Login ── */}
        {tab === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>{s.loginEmailOrPhone}</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}>👤</span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={s.loginEmailPlaceholder}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  onFocus={() => setLoginFocused("id")}
                  onBlur={() => setLoginFocused(null)}
                  style={inputStyle(loginFocused === "id")}
                />
              </div>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  {s.loginPassword}
                </label>
                <button
                  onClick={() => setTab("forgot")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 11,
                    color: "#22C55E",
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  {s.loginForgotLink}
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}>🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  onFocus={() => setLoginFocused("pass")}
                  onBlur={() => setLoginFocused(null)}
                  style={{
                    ...inputStyle(loginFocused === "pass"),
                    paddingRight: 48,
                  }}
                />
                <button
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 15,
                    padding: 0,
                    opacity: 0.65,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            {loginError && <ErrorBox msg={loginError} />}
            <button
              disabled={loginLoading}
              onClick={handleLogin}
              style={btnStyle(loginLoading)}
            >
              {loginLoading && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2.5px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "maha-spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
              )}
              {loginLoading ? "..." : s.loginCTA}
            </button>
          </div>
        )}

        {/* ── Register ── */}
        {tab === "register" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                {
                  label: s.regName,
                  icon: "👤",
                  field: "name",
                  ph: s.regNamePlaceholder,
                  type: "text",
                },
                {
                  label: s.regPhone,
                  icon: "📱",
                  field: "phone",
                  ph: s.regPhonePlaceholder,
                  type: "tel",
                },
              ].map(({ label, icon, field, ph, type }) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <span style={iconWrap}>{icon}</span>
                    <input
                      type={type}
                      value={(form as any)[field]}
                      onChange={(e) => setReg(field, e.target.value)}
                      placeholder={ph}
                      onFocus={() => setRegFocused(field)}
                      onBlur={() => setRegFocused(null)}
                      style={inputStyle(regFocused === field)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label style={labelStyle}>{s.regEmail}</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}>✉️</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setReg("email", e.target.value)}
                  placeholder="email@example.com"
                  onFocus={() => setRegFocused("email")}
                  onBlur={() => setRegFocused(null)}
                  style={inputStyle(regFocused === "email")}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{s.regVillage}</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}>🏘️</span>
                <select
                  value={form.villageId}
                  onChange={(e) => setReg("villageId", e.target.value)}
                  onFocus={() => setRegFocused("village")}
                  onBlur={() => setRegFocused(null)}
                  disabled={villagesLoading}
                  style={{
                    ...inputStyle(regFocused === "village"),
                    appearance: "none",
                    paddingRight: 36,
                    cursor: "pointer",
                    color: form.villageId ? "#0F172A" : "#94A3B8",
                  }}
                >
                  <option value="">
                    {villagesLoading
                      ? s.regVillageLoading
                      : s.regVillagePlaceholder}
                  </option>
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                      {v.gramPanchayat !== v.name
                        ? ` (${v.gramPanchayat})`
                        : ""}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 11,
                    color: "#94A3B8",
                    pointerEvents: "none",
                  }}
                >
                  ▼
                </span>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                {
                  label: s.regPassword,
                  field: "password",
                  show: showRegPass,
                  toggle: () => setShowRegPass((p) => !p),
                  ph: s.regPasswordPlaceholder,
                },
                {
                  label: s.regConfirmPassword,
                  field: "confirmPassword",
                  show: showRegConfirm,
                  toggle: () => setShowRegConfirm((p) => !p),
                  ph: s.regConfirmPlaceholder,
                },
              ].map(({ label, field, show, toggle, ph }) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <span style={iconWrap}>🔒</span>
                    <input
                      type={show ? "text" : "password"}
                      value={(form as any)[field]}
                      onChange={(e) => setReg(field, e.target.value)}
                      placeholder={ph}
                      onFocus={() => setRegFocused(field)}
                      onBlur={() => setRegFocused(null)}
                      style={{
                        ...inputStyle(regFocused === field),
                        paddingRight: 48,
                      }}
                    />
                    <button
                      onClick={toggle}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        padding: 0,
                        opacity: 0.65,
                      }}
                    >
                      {show ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {regError && <ErrorBox msg={regError} />}
            <button
              disabled={regLoading}
              onClick={handleRegister}
              style={btnStyle(regLoading)}
            >
              {regLoading && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2.5px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "maha-spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
              )}
              {regLoading ? "..." : s.regCTA}
            </button>
            <p
              style={{
                fontSize: 10,
                color: "#94A3B8",
                textAlign: "center",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {s.regDisclaimer}
            </p>
          </div>
        )}

        {/* ── Forgot ── */}
        {tab === "forgot" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {forgotSent ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "10px 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 40 }}>📧</div>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}
                >
                  {s.forgotSentTitle}
                </div>
                <div
                  style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}
                >
                  <strong>{forgotEmail}</strong> {s.forgotSentBody}
                </div>
                <button
                  onClick={() => {
                    setForgotSent(false);
                    setTab("login");
                  }}
                  style={{
                    height: 42,
                    borderRadius: 11,
                    border: "1.5px solid #22C55E",
                    background: "#F0FDF4",
                    color: "#15803D",
                    fontSize: 12.5,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "0 20px",
                  }}
                >
                  {s.forgotSentBack}
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    borderRadius: 11,
                    padding: "11px 13px",
                    fontSize: 11.5,
                    color: "#92400E",
                    lineHeight: 1.6,
                  }}
                >
                  {s.forgotInfoBox}
                </div>
                <div>
                  <label style={labelStyle}>{s.forgotEmailLabel}</label>
                  <div style={{ position: "relative" }}>
                    <span style={iconWrap}>✉️</span>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="email@example.com"
                      onKeyDown={(e) => e.key === "Enter" && handleForgot()}
                      onFocus={() => setForgotFocused(true)}
                      onBlur={() => setForgotFocused(false)}
                      style={inputStyle(forgotFocused)}
                    />
                  </div>
                </div>
                {forgotError && <ErrorBox msg={forgotError} />}
                <button
                  disabled={forgotLoading}
                  onClick={handleForgot}
                  style={btnStyle(forgotLoading)}
                >
                  {forgotLoading && (
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2.5px solid rgba(255,255,255,0.35)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "maha-spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    />
                  )}
                  {forgotLoading ? "..." : s.forgotCTA}
                </button>
                <button
                  onClick={() => setTab("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    fontSize: 11.5,
                    fontFamily: "Poppins, sans-serif",
                    cursor: "pointer",
                    padding: "2px 0",
                  }}
                >
                  {s.forgotBack}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineLogin;
