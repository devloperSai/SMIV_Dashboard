import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2, MapPin, Beef, Thermometer, Heart,
  AlertTriangle, Activity, ShieldAlert,
} from "lucide-react";
import Navbar from "../components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";
type FilterType = "today" | "week" | "month";
const LINE_COLORS = ["#0ea5e9", "#f59e0b", "#22c55e", "#ec4899", "#8b5cf6", "#ef4444"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNumber = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.\-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

const formatAlertValue = (val: any): string => {
  if (val === 0 || val === "0" || val === false || String(val).toLowerCase() === "no") return "No";
  if (val === 1 || val === "1" || val === true || String(val).toLowerCase() === "yes") return "Yes";
  return String(val);
};

const chartTooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  borderColor,
  valueColor,
}: {
  label: string;
  value: any;
  icon: any;
  borderColor: string;
  valueColor?: string;
}) => (
  <Card className="p-4 border-l-4" style={{ borderLeftColor: borderColor }}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4" style={{ color: borderColor }} />
      <div className="text-xs text-muted-foreground uppercase font-semibold">
        {label}
      </div>
    </div>
    <div
      className="text-2xl font-bold"
      style={{ color: valueColor ?? "#16a34a" }}
    >
      {value ?? "--"}
    </div>
  </Card>
);

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">{title}</h2>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CattleDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || id;
  const entityName = state?.entityName || "Cattle";
  const entityLocation = state?.entityLocation || "";

  const [historyData, setHistoryData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("week");

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const [historyRes, graphRes] = await Promise.all([
          apiClient.get<any>(
            API_URLS.GET_KPI_HISTORY(entityId),
            ROOTS.SMIV_PLATFORM,
            { "x-api-key": SMIV_API_KEY }
          ),
          apiClient.get<any>(
            `${API_URLS.GET_GRAPHICAL_DATA(entityId)}?filter=${activeFilter}`,
            ROOTS.SMIV_PLATFORM,
            { "x-api-key": SMIV_API_KEY }
          ),
        ]);

        setHistoryData(historyRes?.data || null);

        const rawGraph = Array.isArray(graphRes?.data) ? graphRes.data : [];
        const cleaned = rawGraph.map((group: any) => ({
          ...group,
          data: group.data?.map((point: any) => {
            const p: any = { x: point.x };
            group.legends?.forEach((l: any) => {
              p[l.key] = toNumber(point[l.key]);
            });
            return p;
          }) || [],
        }));
        setGraphData(cleaned);
      } catch (err) {
        console.error("CattleDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId, activeFilter]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const records: any[] = Array.isArray(historyData?.data) ? historyData.data : [];
  const latest = records[0] || null;
  const beltId = latest?.belt_id || entityName;

  const healthAlertRaw = historyData?.health_alert_count;
  const heatAlertRaw   = historyData?.heat_alert_count;
  const isHealthAlert  = healthAlertRaw === 1 || healthAlertRaw === "1" || healthAlertRaw === true;
  const isHeatAlert    = heatAlertRaw   === 1 || heatAlertRaw   === "1" || heatAlertRaw   === true;

  const hasGraphData = graphData.some(
    (g: any) =>
      g.legends?.length > 0 &&
      g.data?.length > 0 &&
      g.data.some((p: any) => g.legends.some((l: any) => p[l.key] !== null))
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Beef className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Smart Livestock
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {beltId}
            </h1>
            {entityLocation && (
              <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {entityLocation}
              </p>
            )}
          </div>

          {/* Status legend pill */}
          <div className="flex items-center gap-4 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
            {[
              { label: "Healthy",  color: "bg-green-500"  },
              { label: "Moderate", color: "bg-orange-400" },
              { label: "Critical", color: "bg-red-500"    },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`relative flex h-2.5 w-2.5 rounded-full ${color}`}>
                  <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`} />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-amber-500" />
            <p className="text-sm">Loading cattle data…</p>
          </div>
        ) : (
          <>
            {/* ── Section 1: Vitals ── */}
            <div className="mb-8">
              <SectionDivider title="Current Vitals" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                <StatCard
                  label="Temperature"
                  value={latest?.temp != null ? `${latest.temp} °C` : "--"}
                  icon={Thermometer}
                  borderColor="#f59e0b"
                />
                <StatCard
                  label="Heart Rate"
                  value={latest?.heart_rate != null ? `${latest.heart_rate} BPM` : "--"}
                  icon={Heart}
                  borderColor="#ef4444"
                />
                <StatCard
                  label="Active Belts"
                  value={historyData?.active_belt_count ?? "--"}
                  icon={Activity}
                  borderColor="#0ea5e9"
                />
                <StatCard
                  label="Total Belts"
                  value={historyData?.belt_count ?? "--"}
                  icon={Beef}
                  borderColor="#8b5cf6"
                />
              </div>
            </div>

            {/* ── Section 2: Alerts ── */}
            <div className="mb-8">
              <SectionDivider title="Alerts" />
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Health Alert"
                  value={healthAlertRaw != null ? formatAlertValue(healthAlertRaw) : "--"}
                  icon={ShieldAlert}
                  borderColor={isHealthAlert ? "#ef4444" : "#10b981"}
                  valueColor={isHealthAlert ? "#ef4444" : "#16a34a"}
                />
                <StatCard
                  label="Heat Alert"
                  value={heatAlertRaw != null ? formatAlertValue(heatAlertRaw) : "--"}
                  icon={AlertTriangle}
                  borderColor={isHeatAlert ? "#ef4444" : "#10b981"}
                  valueColor={isHeatAlert ? "#ef4444" : "#16a34a"}
                />
              </div>
            </div>

            {/* ── Section 3: Vital Trends ── */}
            <div className="mb-8">
              <SectionDivider title="Vital Trends" />
              {hasGraphData ? (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Activity className="h-4 w-4" style={{ color: "#0ea5e9" }} />
                          Vital Trends
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Temperature and heart rate over time
                        </p>
                      </div>
                      {/* Filter buttons */}
                      <div className="flex gap-2">
                        {(["today", "week", "month"] as FilterType[]).map((f) => (
                          <Button
                            key={f}
                            size="sm"
                            variant={activeFilter === f ? "default" : "outline"}
                            onClick={() => setActiveFilter(f)}
                            className="text-xs h-7 px-3"
                          >
                            {f === "today" ? "Today" : f === "week" ? "Week" : "Month"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={graphData[0]?.data || []}
                        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="x"
                          tickFormatter={(t) => new Date(t).toLocaleDateString([], { month: "short", day: "numeric" })}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={chartTooltipStyle}
                          labelFormatter={(t) => new Date(t).toLocaleString()}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                          iconType="circle"
                          iconSize={8}
                        />
                        {graphData[0]?.legends?.map((legend: any, i: number) => (
                          <Line
                            key={legend.key}
                            type="monotone"
                            dataKey={legend.key}
                            name={legend.label}
                            stroke={LINE_COLORS[i % LINE_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Activity className="h-10 w-10 mb-3 opacity-20" />
                    <p className="font-medium">No trend data available yet.</p>
                    <p className="text-xs mt-1">Graph data will appear once telemetry is recorded.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CattleDetails;