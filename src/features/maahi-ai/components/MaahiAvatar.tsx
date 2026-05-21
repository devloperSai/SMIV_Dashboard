interface MaahiAvatarProps {
  size?: number;
  showPulse?: boolean;
}

export const MaahiAvatar = ({
  size = 28,
  showPulse = false,
}: MaahiAvatarProps) => (
  <div
    style={{ position: "relative", flexShrink: 0, width: size, height: size }}
  >
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.44,
        fontWeight: 700,
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        boxShadow: "0 2px 8px rgba(22,163,74,0.28)",
        border: "2px solid rgba(255,255,255,0.9)",
      }}
    >
      म
    </div>
    {showPulse && (
      <span
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: Math.max(8, size * 0.28),
          height: Math.max(8, size * 0.28),
          borderRadius: "50%",
          background: "#22C55E",
          border: "2px solid #fff",
          animation: "maahi-pulse 2s ease infinite",
        }}
      />
    )}
  </div>
);
