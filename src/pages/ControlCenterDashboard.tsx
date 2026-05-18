import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Monitor,
  MapPin,
  Building2,
  Server,
  ShieldCheck,
  LayoutDashboard,
  Cpu,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;
const SATNAVARI_VILLAGE_ID = import.meta.env.VITE_SATNAVARI_VILLAGE_ID;
const USE_CASE_NAME = "Control Center Infra";

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

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  unit,
  icon: Icon,
  borderColor,
}: {
  label: string;
  value: string | number;
  unit?: string;
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
    <div className="text-2xl font-bold text-green-600">
      {value ?? "--"}{" "}
      {unit && (
        <span className="text-sm font-normal text-muted-foreground">
          {unit}
        </span>
      )}
    </div>
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

const ControlCenterDashboard = () => {
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
        console.error("ControlCenterDashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const hasStats = stats.length > 0;

  const palette = [
    { borderColor: "#6366f1", icon: Monitor },
    { borderColor: "#0ea5e9", icon: Server },
    { borderColor: "#10b981", icon: Cpu },
    { borderColor: "#f59e0b", icon: LayoutDashboard },
    { borderColor: "#8b5cf6", icon: ShieldCheck },
    { borderColor: "#f97316", icon: Monitor },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="h-5 w-5 text-violet-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                Command & Control Infrastructure
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Control Center Infra
            </h1>
            <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5" />
              Satnavari Village
            </p>
          </div>

          {/* Provider pill */}
          <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Monitor className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">
                Provider
              </p>
              <p className="text-sm font-semibold text-foreground">
                PRAGMATA BIZCONSERV LLP
              </p>
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
            <Loader2 className="animate-spin h-8 w-8 text-violet-500" />
            <p className="text-sm">Loading control center data…</p>
          </div>
        ) : (
          <>
            {/* ── Section 1: Live Stats ── */}
            {hasStats && (
              <div className="mb-8">
                <SectionDivider title="Live Statistics" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, i) => {
                    const { borderColor, icon } = palette[i % palette.length];
                    return (
                      <StatCard
                        key={i}
                        label={stat.name}
                        value={stat.value}
                        icon={icon}
                        borderColor={borderColor}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Section 2: Summary + Capabilities ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2">
                    <Monitor className="h-4 w-4" style={{ color: "#6366f1" }} />
                    System Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {[
                    {
                      label: "Organisation",
                      val: "PRAGMATA BIZCONSERV",
                      icon: Building2,
                      color: "#6366f1",
                    },
                    {
                      label: "Location",
                      val: "Satnavari Village",
                      icon: MapPin,
                      color: "#0ea5e9",
                    },
                    {
                      label: "System Type",
                      val: "Control Center Infra",
                      icon: Monitor,
                      color: "#8b5cf6",
                    },
                    {
                      label: "Status",
                      val: "Deployed & Active",
                      icon: ShieldCheck,
                      color: "#10b981",
                    },
                  ].map(({ label, val, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 py-3 border-b border-violet-100 dark:border-violet-800 last:border-0"
                    >
                      {/* master format: flat tinted icon, no bubble */}
                      <Icon
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color }}
                      />
                      <div className="text-xs text-muted-foreground uppercase font-semibold flex-1">
                        {label}
                      </div>
                      <p className="text-sm font-bold text-green-600">{val}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Capabilities card */}
              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Cpu className="h-4 w-4" style={{ color: "#10b981" }} />
                    System Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        icon: LayoutDashboard,
                        color: "#6366f1",
                        title: "Centralised NOC",
                        desc: "Single-pane view of all village use cases from a unified control centre",
                      },
                      {
                        icon: Server,
                        color: "#0ea5e9",
                        title: "Server Infrastructure",
                        desc: "On-premise and cloud server infrastructure supporting all deployed systems",
                      },
                      {
                        icon: Monitor,
                        color: "#8b5cf6",
                        title: "Live Monitoring",
                        desc: "Real-time dashboards for tracking system health across all use cases",
                      },
                      {
                        icon: Cpu,
                        color: "#10b981",
                        title: "Edge Computing",
                        desc: "Local compute resources enabling low-latency data processing at the edge",
                      },
                    ].map(({ icon: Icon, color, title, desc }) => (
                      <div
                        key={title}
                        className="flex gap-3 p-3 rounded-xl border border-border bg-muted/20"
                      >
                        {/* master format: flat tinted icon, no bubble */}
                        <Icon
                          className="h-4 w-4 flex-shrink-0 mt-0.5"
                          style={{ color }}
                        />
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ControlCenterDashboard;
