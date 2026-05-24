import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Activity,
  MapPin,
  Building2,
  Wifi,
  BarChart2,
  ShieldCheck,
  Radio,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";
const SATNAVARI_VILLAGE_ID = import.meta.env.VITE_SATNAVARI_VILLAGE_ID || "a5fc0498-d3e7-492e-a104-b97635af4503";
const USE_CASE_NAME = "eQoSim Proposal";

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

const EQoSimDashboard = () => {
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
        console.error("EQoSimDashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const hasStats = stats.length > 0;

  const palette = [
    { borderColor: "#6366f1", icon: Activity },
    { borderColor: "#0ea5e9", icon: Wifi },
    { borderColor: "#10b981", icon: BarChart2 },
    { borderColor: "#f59e0b", icon: Radio },
    { borderColor: "#8b5cf6", icon: ShieldCheck },
    { borderColor: "#f97316", icon: Activity },
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
              <Activity className="h-5 w-5 text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Network Quality Simulation
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              eQoSim Proposal
            </h1>
            <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5" />
              Satnavari Village
            </p>
          </div>

          {/* Provider pill */}
          <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">
                Provider
              </p>
              <p className="text-sm font-semibold text-foreground">
                Sensorise Pvt Ltd
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
            <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
            <p className="text-sm">Loading eQoSim data…</p>
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
              <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <Activity
                      className="h-4 w-4"
                      style={{ color: "#6366f1" }}
                    />
                    System Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {[
                    {
                      label: "Organisation",
                      val: "Sensorise Pvt Ltd",
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
                      val: "Network QoS Simulator",
                      icon: Activity,
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
                      className="flex items-center gap-3 py-3 border-b border-indigo-100 dark:border-indigo-800 last:border-0"
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
                    <BarChart2
                      className="h-4 w-4"
                      style={{ color: "#10b981" }}
                    />
                    System Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        icon: Activity,
                        color: "#6366f1",
                        title: "QoS Simulation",
                        desc: "Simulates network quality parameters for rural connectivity planning",
                      },
                      {
                        icon: Wifi,
                        color: "#0ea5e9",
                        title: "Network Analysis",
                        desc: "Real-time analysis of signal strength and throughput metrics",
                      },
                      {
                        icon: BarChart2,
                        color: "#10b981",
                        title: "Performance Reports",
                        desc: "Generates detailed reports on network performance over time",
                      },
                      {
                        icon: Radio,
                        color: "#f59e0b",
                        title: "IoT Integration",
                        desc: "Integrates with IoT sensors for live environment monitoring",
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

export default EQoSimDashboard;
