import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Flame,
  MapPin,
  ShieldCheck,
  Building2,
  Zap,
  Radio,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;
const SATNAVARI_VILLAGE_ID = import.meta.env.VITE_SATNAVARI_VILLAGE_ID;
const USE_CASE_NAME = "Automatic Fire Extinguisher Solution";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stat {
  name: string;
  value: string | number;
}

interface UseCaseEntry {
  useCaseName?: string;
  assignmentId?: string;
  stats?: { name: string; value: string | number; unit?: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const palette = [
  { color: "#ef4444", icon: Flame },
  { color: "#f97316", icon: Zap },
  { color: "#8b5cf6", icon: Radio },
  { color: "#0ea5e9", icon: ShieldCheck },
  { color: "#10b981", icon: ShieldCheck },
  { color: "#f59e0b", icon: AlertTriangle },
];

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  borderColor,
}: {
  label: string;
  value: string | number;
  icon: any;
  borderColor: string;
}) => (
  <Card className="p-4 border-l-4" style={{ borderLeftColor: borderColor }}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4" style={{ color: borderColor }} />
      <div className="text-xs text-muted-foreground uppercase font-semibold">
        {label}
      </div>
    </div>
    <div className="text-2xl font-bold text-green-600">{value ?? "--"}</div>
  </Card>
);

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">
      {title}
    </h2>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FireExtinguisherDashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<any>(
          API_URLS.GET_USE_CASES_FOR_VILLAGE(SATNAVARI_VILLAGE_ID),
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY },
        );
        const useCases: UseCaseEntry[] = res?.data?.useCases ?? res?.data ?? [];
        const matched = useCases.find(
          (uc) =>
            uc.useCaseName?.trim().toLowerCase() ===
            USE_CASE_NAME.trim().toLowerCase(),
        );
        if (matched?.stats?.length) {
          setStats(
            matched.stats.map((s) => ({
              name: s.name,
              value: s.unit ? `${s.value} ${s.unit}` : s.value,
            })),
          );
        }
      } catch (err) {
        console.error("FireExtinguisherDashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const hasStats = stats.length > 0;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* ── Page Header — master format ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-5 w-5 text-red-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                Fire Safety — Terminate Fire Safety
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Automatic Fire Extinguisher Solution
            </h1>
            <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5" />
              Satnavari Village
            </p>
          </div>

          {/* Provider pill */}
          <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <Flame className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">
                Provider
              </p>
              <p className="text-sm font-semibold text-foreground">
                Terminate Fire Safety
              </p>
            </div>
            <div className="w-px h-8 bg-border mx-1" />
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">
                Status
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Deployed & Active
                </p>
              </div>
            </div>
            <div className="w-px h-8 bg-border mx-1" />
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">
                Village
              </p>
              <p className="text-sm font-semibold text-foreground">Satnavari</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-red-500" />
            <p className="text-sm">Loading fire extinguisher data…</p>
          </div>
        ) : (
          <>
            {/* ── Section 1: Live stat cards (dynamic from API) ── */}
            {hasStats && (
              <>
                <div className="mb-4">
                  <SectionDivider title="Live Statistics" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.slice(0, 4).map((stat, i) => {
                      const { color, icon } = palette[i % palette.length];
                      return (
                        <StatCard
                          key={i}
                          label={stat.name}
                          value={stat.value}
                          icon={icon}
                          borderColor={color}
                        />
                      );
                    })}
                  </div>
                </div>

                {stats.length > 4 && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {stats.slice(4).map((stat, i) => {
                      const { color, icon } = palette[(i + 4) % palette.length];
                      return (
                        <StatCard
                          key={i + 4}
                          label={stat.name}
                          value={stat.value}
                          icon={icon}
                          borderColor={color}
                        />
                      );
                    })}
                  </div>
                )}

                {stats.length <= 4 && <div className="mb-8" />}
              </>
            )}

            {/* ── Section 2: System Capabilities ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    System Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      icon: Flame,
                      color: "#ef4444",
                      title: "Auto Detection",
                      desc: "Detects fire via integrated heat and smoke sensors",
                    },
                    {
                      icon: Zap,
                      color: "#f59e0b",
                      title: "Instant Response",
                      desc: "Triggers suppression system within seconds of detection",
                    },
                    {
                      icon: Radio,
                      color: "#8b5cf6",
                      title: "Remote Monitoring",
                      desc: "Live status and emergency alerts via IoT platform",
                    },
                    {
                      icon: ShieldCheck,
                      color: "#10b981",
                      title: "Safety Certified",
                      desc: "Deployed by certified fire safety professionals",
                    },
                  ].map(({ icon: Icon, color, title, desc }) => (
                    <div
                      key={title}
                      className="flex gap-3 p-3 rounded-xl border border-border bg-muted/20"
                    >
                      <div
                        className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0"
                        style={{ background: `${color}18` }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-0.5">
                          {title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ── System Summary ── */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    System Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Organisation", val: "Terminate Fire Safety" },
                    { label: "Location", val: "Satnavari Village" },
                    { label: "System Type", val: "Auto Extinguisher" },
                    { label: "Status", val: "Deployed & Active" },
                    {
                      label: "Use Case",
                      val: "Automatic Fire Extinguisher Solution",
                    },
                  ].map(({ label, val }) => (
                    <div
                      key={label}
                      className="flex justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">
                        {val}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FireExtinguisherDashboard;
