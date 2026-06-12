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
import { t } from "../../maha-ai/constants/mahaI18n";

type AuthTab = "login" | "register" | "forgot";

interface MahaLoginProps {
  onSuccess: (user: AuthUser, token: string) => void;
  onClose: () => void;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputStyle = (focused: boolean): React.CSSProperties => ({
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 700,
  color: "#64748B",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

const iconWrap: React.CSSProperties = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 15,
  zIndex: 1,
  pointerEvents: "none",
};

// ─── Login Panel ──────────────────────────────────────────────────────────────

const LoginPanel = ({
  onSuccess,
  onForgot,
}: {
  onSuccess: (user: AuthUser, token: string) => void;
  onForgot: () => void;
}) => {
  const { lang } = useLang();
  const s = t(lang);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState<"id" | "pass" | null>(null);

  const handle = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError(s.loginEmailOrPhone + " / " + s.loginPassword);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await loginUser({ identifier: identifier.trim(), password });
      onSuccess(data.data.user, data.data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : s.loginCTA);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>{s.loginEmailOrPhone}</label>
        <div style={{ position: "relative" }}>
          <span style={iconWrap}>👤</span>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={s.loginEmailPlaceholder}
            onKeyDown={(e) => e.key === "Enter" && handle()}
            onFocus={() => setFocused("id")}
            onBlur={() => setFocused(null)}
            style={inputStyle(focused === "id")}
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
            onClick={onForgot}
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
            onKeyDown={(e) => e.key === "Enter" && handle()}
            onFocus={() => setFocused("pass")}
            onBlur={() => setFocused(null)}
            style={{ ...inputStyle(focused === "pass"), paddingRight: 48 }}
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
              transition: "opacity 0.15s",
            }}
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {error && <ErrorBox msg={error} />}

      <PrimaryButton loading={loading} onClick={handle} label={s.loginCTA} />
    </div>
  );
};

// ─── Register Field (top-level to prevent remount-on-render focus loss) ───────

const RegisterField = ({
  label,
  icon,
  field,
  type = "text",
  placeholder,
  rightEl,
  value,
  onChange,
  focused,
  onFocus,
  onBlur,
}: {
  label: string;
  icon: string;
  field: string;
  type?: string;
  placeholder: string;
  rightEl?: React.ReactNode;
  value: string;
  onChange: (field: string, value: string) => void;
  focused: string | null;
  onFocus: (field: string) => void;
  onBlur: () => void;
}) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: "relative" }}>
      <span style={iconWrap}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        onFocus={() => onFocus(field)}
        onBlur={onBlur}
        style={{
          ...inputStyle(focused === field),
          paddingRight: rightEl ? 48 : 16,
        }}
      />
      {rightEl}
    </div>
  </div>
);

// ─── Register Panel ───────────────────────────────────────────────────────────

const RegisterPanel = ({
  onSuccess,
}: {
  onSuccess: (user: AuthUser, token: string) => void;
}) => {
  const { lang } = useLang();
  const s = t(lang);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    villageId: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [villages, setVillages] = useState<Village[]>([]);
  const [villagesLoading, setVillagesLoading] = useState(false);

  useEffect(() => {
    setVillagesLoading(true);
    fetchVillages().then((v) => {
      setVillages(v);
      setVillagesLoading(false);
    });
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async () => {
    if (!form.name.trim()) {
      setError(s.regName);
      return;
    }
    if (!form.email.trim()) {
      setError(s.regEmail);
      return;
    }
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError(s.regPhone);
      return;
    }
    if (!form.villageId) {
      setError(s.regVillage);
      return;
    }
    if (form.password.length < 6) {
      setError(s.regPasswordPlaceholder);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(s.regConfirmPassword);
      return;
    }

    setLoading(true);
    setError("");
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
      setError(err instanceof Error ? err.message : s.regCTA);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <RegisterField
          label={s.regName}
          icon="👤"
          field="name"
          placeholder={s.regNamePlaceholder}
          value={form.name}
          onChange={set}
          focused={focused}
          onFocus={setFocused}
          onBlur={() => setFocused(null)}
        />
        <RegisterField
          label={s.regPhone}
          icon="📱"
          field="phone"
          placeholder={s.regPhonePlaceholder}
          value={form.phone}
          onChange={set}
          focused={focused}
          onFocus={setFocused}
          onBlur={() => setFocused(null)}
        />
      </div>

      <RegisterField
        label={s.regEmail}
        icon="✉️"
        field="email"
        placeholder="email@example.com"
        value={form.email}
        onChange={set}
        focused={focused}
        onFocus={setFocused}
        onBlur={() => setFocused(null)}
      />

      <div>
        <label style={labelStyle}>{s.regVillage}</label>
        <div style={{ position: "relative" }}>
          <span style={iconWrap}>🏘️</span>
          <select
            value={form.villageId}
            onChange={(e) => set("villageId", e.target.value)}
            onFocus={() => setFocused("village")}
            onBlur={() => setFocused(null)}
            disabled={villagesLoading}
            style={{
              ...inputStyle(focused === "village"),
              appearance: "none",
              paddingRight: 36,
              cursor: "pointer",
              color: form.villageId ? "#0F172A" : "#94A3B8",
            }}
          >
            <option value="">
              {villagesLoading ? s.regVillageLoading : s.regVillagePlaceholder}
            </option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.gramPanchayat !== v.name ? ` (${v.gramPanchayat})` : ""}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>{s.regPassword}</label>
          <div style={{ position: "relative" }}>
            <span style={iconWrap}>🔒</span>
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder={s.regPasswordPlaceholder}
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused(null)}
              style={{ ...inputStyle(focused === "pass"), paddingRight: 48 }}
            />
            <button
              onClick={() => setShowPass((p) => !p)}
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
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div>
          <label style={labelStyle}>{s.regConfirmPassword}</label>
          <div style={{ position: "relative" }}>
            <span style={iconWrap}>🔒</span>
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder={s.regConfirmPlaceholder}
              onFocus={() => setFocused("confirm")}
              onBlur={() => setFocused(null)}
              style={{ ...inputStyle(focused === "confirm"), paddingRight: 48 }}
            />
            <button
              onClick={() => setShowConfirm((p) => !p)}
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
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorBox msg={error} />}

      <PrimaryButton loading={loading} onClick={handle} label={s.regCTA} />

      <p
        style={{
          fontSize: 10.5,
          color: "#94A3B8",
          textAlign: "center",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {s.regDisclaimer}
      </p>
    </div>
  );
};

// ─── Forgot Password Panel ────────────────────────────────────────────────────

const ForgotPanel = ({ onBack }: { onBack: () => void }) => {
  const { lang } = useLang();
  const s = t(lang);
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handle = async () => {
    if (!email.trim()) {
      setError(s.forgotEmailLabel);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : s.forgotCTA);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 48 }}>📧</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
          {s.forgotSentTitle}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "#64748B",
            lineHeight: 1.65,
            maxWidth: 280,
          }}
        >
          <strong>{email}</strong> {s.forgotSentBody}
        </div>
        <button
          onClick={onBack}
          style={{
            marginTop: 8,
            height: 44,
            borderRadius: 12,
            border: "1.5px solid #22C55E",
            background: "#F0FDF4",
            color: "#15803D",
            fontSize: 13,
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            padding: "0 24px",
          }}
        >
          {s.forgotSentBack}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 12,
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            onKeyDown={(e) => e.key === "Enter" && handle()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={inputStyle(focused)}
          />
        </div>
      </div>

      {error && <ErrorBox msg={error} />}

      <PrimaryButton loading={loading} onClick={handle} label={s.forgotCTA} />

      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#94A3B8",
          fontSize: 12,
          fontFamily: "Poppins, sans-serif",
          cursor: "pointer",
          padding: "4px 0",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#64748B";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
        }}
      >
        {s.forgotBack}
      </button>
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const ErrorBox = ({ msg }: { msg: string }) => (
  <div
    style={{
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      borderRadius: 10,
      padding: "9px 13px",
      fontSize: 12,
      color: "#EF4444",
      display: "flex",
      alignItems: "center",
      gap: 7,
      animation: "maha-slide-in 0.2s ease both",
    }}
  >
    ⚠️ {msg}
  </div>
);

const PrimaryButton = ({
  loading,
  onClick,
  label,
}: {
  loading: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      width: "100%",
      height: 50,
      borderRadius: 13,
      border: "none",
      background: loading
        ? "#CBD5E1"
        : "linear-gradient(135deg,#22C55E,#15803D)",
      color: "#fff",
      fontSize: 14,
      fontWeight: 700,
      fontFamily: "Poppins, sans-serif",
      cursor: loading ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      boxShadow: loading ? "none" : "0 6px 20px rgba(34,197,94,0.32)",
      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      letterSpacing: "0.01em",
    }}
    onMouseEnter={(e) => {
      if (!loading) {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(-1px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 10px 28px rgba(34,197,94,0.40)";
      }
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLButtonElement).style.boxShadow = loading
        ? "none"
        : "0 6px 20px rgba(34,197,94,0.32)";
    }}
  >
    {loading ? (
      <>
        <span
          style={{
            width: 17,
            height: 17,
            border: "2.5px solid rgba(255,255,255,0.35)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "maha-spin 0.8s linear infinite",
            display: "inline-block",
          }}
        />
        ...
      </>
    ) : (
      label
    )}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const MahaLogin = ({ onSuccess, onClose }: MahaLoginProps) => {
  const { lang } = useLang();
  const s = t(lang);
  const [tab, setTab] = useState<AuthTab>("login");

  const FEATURES = [
    { emoji: "🌾", text: s.feat1 },
    { emoji: "🌦️", text: s.feat2 },
    { emoji: "💰", text: s.feat3 },
    { emoji: "🐄", text: s.feat4 },
  ];

  const TABS: { id: AuthTab; label: string }[] = [
    { id: "login", label: s.loginTabLogin },
    { id: "register", label: s.loginTabRegister },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* ── Left decorative panel ── */}
      <div
        style={{
          width: "38%",
          flexShrink: 0,
          background: "linear-gradient(160deg,#16A34A 0%,#14532D 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 22px",
          position: "relative",
          overflow: "hidden",
        }}
        className="maha-login-left"
      >
        {[
          { right: -60, top: -60, w: 200, h: 200 },
          { left: -40, bottom: -40, w: 160, h: 160 },
          { right: 20, bottom: 100, w: 80, h: 80 },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...s,
              width: s.w,
              height: s.h,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
        ))}

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            marginBottom: 16,
            backdropFilter: "blur(6px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          🌾
        </div>
        <div
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 22,
            marginBottom: 4,
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          MAHA AI
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 12,
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          {s.smartVillage}
        </div>

        {FEATURES.map((f) => (
          <div
            key={f.text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.10)",
              borderRadius: 11,
              padding: "8px 13px",
              marginBottom: 7,
              width: "100%",
              backdropFilter: "blur(4px)",
            }}
          >
            <span style={{ fontSize: 15 }}>{f.emoji}</span>
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {f.text}
            </span>
          </div>
        ))}

        <style>{`@media (max-width: 600px) { .maha-login-left { display: none !important; } }`}</style>
      </div>

      {/* ── Right panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <div
          style={{
            padding: "18px 24px 14px",
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#0F172A",
                letterSpacing: "-0.02em",
              }}
            >
              {tab === "forgot" ? "🔑" : s.loginGreeting}
            </div>
            <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
              {tab === "login" && s.loginSubLogin}
              {tab === "register" && s.loginSubRegister}
              {tab === "forgot" && s.loginSubForgot}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              color: "#64748B",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#E2E8F0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#F1F5F9";
            }}
          >
            ×
          </button>
        </div>

        {tab !== "forgot" && (
          <div
            style={{
              padding: "12px 24px 0",
              display: "flex",
              gap: 6,
              flexShrink: 0,
            }}
          >
            {TABS.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 11,
                  border: tab === tb.id ? "none" : "1.5px solid #E2E8F0",
                  background:
                    tab === tb.id
                      ? "linear-gradient(135deg,#22C55E,#15803D)"
                      : "#F8FAFC",
                  color: tab === tb.id ? "#fff" : "#64748B",
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: "Poppins, sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    tab === tb.id ? "0 4px 12px rgba(34,197,94,0.28)" : "none",
                }}
              >
                {tb.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
          {tab === "login" && (
            <LoginPanel
              onSuccess={onSuccess}
              onForgot={() => setTab("forgot")}
            />
          )}
          {tab === "register" && <RegisterPanel onSuccess={onSuccess} />}
          {tab === "forgot" && <ForgotPanel onBack={() => setTab("login")} />}

          {tab === "login" && (
            <div
              style={{
                marginTop: 18,
                padding: "12px 14px",
                background: "#F0FDF4",
                borderRadius: 12,
                border: "1px solid #BBF7D0",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
              <div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#15803D",
                    marginBottom: 2,
                  }}
                >
                  {s.loginNewUserTitle}
                </div>
                <div
                  style={{ fontSize: 11, color: "#475569", lineHeight: 1.6 }}
                >
                  {s.loginNewUserBody}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
