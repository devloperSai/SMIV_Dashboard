import { useLang } from "../context/LangContext";
import { t } from "../constants/mahaI18n";

interface SuggestionChipsProps {
  onSelect: (label: string) => void;
}

export const SuggestionChips = ({ onSelect }: SuggestionChipsProps) => {
  const { lang } = useLang();
  const s = t(lang);

  const chips = [
    { emoji: "🌱", label: s.chip1 },
    { emoji: "🏛️", label: s.chip2 },
    { emoji: "🌡️", label: s.chip3 },
    { emoji: "📈", label: s.chip4 },
    { emoji: "🐄", label: s.chip5 },
    { emoji: "🤖", label: s.chip6 },
  ];

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#94A3B8",
          fontFamily: "Poppins, sans-serif",
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 16,
            height: 2,
            background: "#22C55E",
            borderRadius: 1,
            display: "inline-block",
          }}
        />
        {s.suggestionsLabel}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 9,
        }}
      >
        {chips.map((chip, i) => (
          <button
            key={i}
            onClick={() => onSelect(chip.label)}
            style={{
              background: "#fff",
              border: "1.5px solid #E2E8F0",
              borderRadius: 14,
              padding: "11px 13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 9,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              textAlign: "left",
              transition: "all 0.18s cubic-bezier(0.34,1.2,0.64,1)",
              fontFamily: "Poppins, sans-serif",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.transform = "translateY(-2px) scale(1.02)";
              b.style.borderColor = "#86EFAC";
              b.style.boxShadow = "0 6px 16px rgba(22,163,74,0.14)";
              b.style.background = "#F0FDF4";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.transform = "translateY(0) scale(1)";
              b.style.borderColor = "#E2E8F0";
              b.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)";
              b.style.background = "#fff";
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.97)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px) scale(1.02)";
            }}
          >
            <span
              style={{
                fontSize: 20,
                flexShrink: 0,
                width: 32,
                height: 32,
                background: "#F0FDF4",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {chip.emoji}
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#1E293B",
                lineHeight: 1.3,
              }}
            >
              {chip.label}
            </span>
            <span
              style={{
                marginLeft: "auto",
                color: "#CBD5E1",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
