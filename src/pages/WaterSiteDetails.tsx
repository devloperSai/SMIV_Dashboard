import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Activity,
  Droplets,
  Clock,
  MapPin,
  FlaskConical,
  Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;
type FilterType = "today" | "week" | "month";
const LINE_COLORS = ["#0ea5e9", "#f59e0b", "#22c55e", "#ec4899", "#8b5cf6"];

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
  unit,
  icon: Icon,
  borderColor,
}: {
  label: string;
  value: any;
  unit?: string;
  icon: any;
  borderColor: string;
}) => {
  if (value === null || value === undefined) return null;
  return (
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
};

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">
      {title}
    </h2>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const WaterSiteDetails = () => {
  const { siteId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || siteId;
  const entityName = state?.entityName || "Water Site";
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
            { "x-api-key": SMIV_API_KEY },
          ),
          apiClient.get<any>(
            `${API_URLS.GET_GRAPHICAL_DATA(entityId)}?filter=${activeFilter}`,
            ROOTS.SMIV_PLATFORM,
            { "x-api-key": SMIV_API_KEY },
          ),
        ]);

        setHistoryData(historyRes?.data || null);

        const rawGraph = Array.isArray(graphRes?.data) ? graphRes.data : [];
        const cleaned = rawGraph.map((group: any) => ({
          ...group,
          data:
            group.data?.map((point: any) => {
              const p: any = { x: point.x };
              group.legends?.forEach((l: any) => {
                p[l.key] = toNumber(point[l.key]);
              });
              return p;
            }) || [],
        }));
        setGraphData(cleaned);
      } catch (err) {
        console.error("WaterSiteDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId, activeFilter]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const latest = historyData?.data?.[0] || null;
  const location = latest?.locations?.[0] || null;

  const totalWater =
    latest?.total_water_supplied ?? historyData?.total_water_supplied;
  const flowRate = latest?.flow_rate;
  const phLevel = latest?.ph_level;
  const motorRuntime = latest?.motor_runtime;
  const supplyDuration = latest?.water_supply_duration;
  const monthlyConsumption = latest?.monthly_water_consumption;
  const phStatus = latest?.ph_status;
  const healthPrediction = latest?.health_disease_prediction;
  const qualityAlerts = latest?.quality_alert_count;
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const locationName = location?.name;

  const hasGraphData = graphData.some(
    (g: any) =>
      g.legends?.length > 0 &&
      g.data?.length > 0 &&
      g.data.some((p: any) => g.legends.some((l: any) => p[l.key] !== null)),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-3 text-muted-foreground">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="text-sm">Loading water site data…</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="h-5 w-5 text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Smart Water
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {entityName}
            </h1>
            {(entityLocation || locationName) && (
              <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {locationName || entityLocation}
              </p>
            )}
          </div>
        </div>

        {/* ── Section 1: Key Metrics ── */}
        <div className="mb-8">
          <SectionDivider title="Key Metrics" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Water Supplied"
              value={
                totalWater != null
                  ? parseFloat(String(totalWater)).toFixed(2)
                  : null
              }
              unit="KL"
              icon={Droplets}
              borderColor="#0ea5e9"
            />
            <StatCard
              label="Real-time Flow"
              value={flowRate}
              unit="LPM"
              icon={Activity}
              borderColor="#22c55e"
            />
            <StatCard
              label="Average pH"
              value={phLevel}
              unit="pH"
              icon={FlaskConical}
              borderColor="#8b5cf6"
            />
            <StatCard
              label="Water Health"
              value={healthPrediction}
              icon={Heart}
              borderColor="#10b981"
            />
          </div>
        </div>

        {/* ── Section 2: Operational Metrics + Location ── */}
        <div className="mb-8">
          <SectionDivider title="Operational Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operational Metrics */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: "#0ea5e9" }} />
                  Operational Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {[
                  {
                    label: "Motor Runtime",
                    val: motorRuntime != null ? `${motorRuntime} hrs` : null,
                    color: "#0ea5e9",
                    icon: Clock,
                  },
                  {
                    label: "Supply Duration",
                    val:
                      supplyDuration != null ? `${supplyDuration} hrs` : null,
                    color: "#22c55e",
                    icon: Activity,
                  },
                  {
                    label: "Monthly Consumption",
                    val:
                      monthlyConsumption != null
                        ? `${monthlyConsumption} KL`
                        : null,
                    color: "#8b5cf6",
                    icon: Droplets,
                  },
                  {
                    label: "pH Status",
                    val: phStatus ?? null,
                    color: "#f59e0b",
                    icon: FlaskConical,
                  },
                  {
                    label: "Quality Alerts",
                    val:
                      qualityAlerts != null
                        ? qualityAlerts === 0 || qualityAlerts === "0"
                          ? "No"
                          : String(qualityAlerts)
                        : null,
                    color:
                      qualityAlerts &&
                      qualityAlerts !== 0 &&
                      qualityAlerts !== "0"
                        ? "#ef4444"
                        : "#10b981",
                    icon: Heart,
                  },
                ]
                  .filter((r) => r.val !== null)
                  .map(({ label, val, color, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 py-3 border-b border-border last:border-0"
                    >
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

            {/* Location Details */}
            <Card className="overflow-hidden border border-border shadow-sm">
              <CardHeader className="pb-2 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {latitude && longitude ? (
                  <>
                    {/* Embedded Map */}
                    <div className="w-full h-[200px] relative">
                      <iframe
                        title="Water Site Location Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0, display: "block" }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`}
                      />
                      {/* Live pin badge */}
                      <div className="absolute top-2 left-2 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 shadow-md flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse inline-block" />
                        <span className="text-xs font-semibold text-foreground">
                          Live Pin
                        </span>
                      </div>
                      {/* Site name badge — top right */}
                      {locationName && (
                        <div className="absolute top-2 right-2 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 shadow-md flex items-center gap-1.5 max-w-[160px]">
                          <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-foreground truncate">
                            {locationName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Coordinates + CTA row */}
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-t border-border">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
                            Latitude
                          </p>
                          <p className="text-sm font-bold tabular-nums text-foreground">
                            {parseFloat(latitude).toFixed(6)}°
                          </p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
                            Longitude
                          </p>
                          <p className="text-sm font-bold tabular-nums text-foreground">
                            {parseFloat(longitude).toFixed(6)}°
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Section 3: Trend Chart ── */}
        {hasGraphData && (
          <div className="mb-8">
            <SectionDivider title="Water Quality Trends" />
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Activity
                        className="h-4 w-4"
                        style={{ color: "#0ea5e9" }}
                      />
                      Water Quality Trends
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Flow, pH and quality metrics over time
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(["today", "week", "month"] as FilterType[]).map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={activeFilter === f ? "default" : "outline"}
                        onClick={() => setActiveFilter(f)}
                        className="text-xs h-7 px-3"
                      >
                        {f === "today"
                          ? "Today"
                          : f === "week"
                            ? "Week"
                            : "Month"}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={graphData[0]?.data || []}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="x"
                      tickFormatter={(t) =>
                        new Date(t).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })
                      }
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
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterSiteDetails;
