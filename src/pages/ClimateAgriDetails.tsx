import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Leaf,
  Droplets,
  Zap,
  FlaskConical,
  BadgeCheck,
  Award,
  Sprout,
  TrendingDown,
  TrendingUp,
  User,
  MapPin,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";
type FilterType = "today" | "week" | "month";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TelemetryRecord {
  crop?: string;
  farmer?: string;
  carbon_emissions_kgCO2e?: number;
  water_consumption_liters?: number;
  using_solar_pump?: boolean;
  using_natural_fertilizer?: boolean;
  eligible_for_green_credits?: boolean;
  natural_produce_certification?: boolean;
  timestamp?: string;
}

interface HistoryResponse {
  useCaseId?: string;
  useCaseName?: string;
  useCaseProvider?: string;
  data?: TelemetryRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (ts: string, filter: FilterType) => {
  const d = new Date(ts);
  if (filter === "today") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (filter === "month") {
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

const avg = (arr: number[]): number =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

const pct = (a: number, b: number): number =>
  b === 0 ? 0 : ((a - b) / b) * 100;

// ─── StatCard — format from DroneOperationsDetails ────────────────────────────

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
        <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      )}
    </div>
  </Card>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const BooleanBadge = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: boolean | undefined;
  icon: any;
}) => (
  <div
    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-colors ${
      value
        ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400"
        : "bg-muted/40 border-border text-muted-foreground"
    }`}
  >
    <Icon className={`h-4 w-4 flex-shrink-0 ${value ? "" : "opacity-40"}`} />
    <span className="text-sm font-medium">{label}</span>
    {value ? (
      <BadgeCheck className="h-4 w-4 ml-auto text-emerald-500" />
    ) : (
      <AlertCircle className="h-4 w-4 ml-auto opacity-30" />
    )}
  </div>
);

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, filter }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-muted-foreground text-xs mb-2 font-medium">
        {label ? formatDate(label, filter) : ""}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ClimateAgriDetails = () => {
  const { siteId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || siteId;
  const entityName = state?.entityName || "Climate Station";
  const entityLocation = state?.entityLocation || "";

  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("week");

  // ── Data fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const res = await apiClient.get<any>(
          API_URLS.GET_KPI_HISTORY(entityId),
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY }
        );
        setHistoryData(res?.data || null);
      } catch (err) {
        console.error("ClimateAgriDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [entityId]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const records: TelemetryRecord[] = historyData?.data || [];

  // Filter records by time window
  const filteredRecords = records.filter((r) => {
    if (!r.timestamp) return true;
    const t = new Date(r.timestamp).getTime();
    const now = Date.now();
    if (activeFilter === "today") return t >= now - 86_400_000;
    if (activeFilter === "week") return t >= now - 7 * 86_400_000;
    return t >= now - 30 * 86_400_000;
  });

  // Use all records if filter produces nothing (sparse data guard)
  const displayRecords = filteredRecords.length > 0 ? filteredRecords : records;

  // Latest snapshot (first record — API returns newest-first)
  const latest = displayRecords[0] ?? records[0];

  // Chart data — sorted oldest→newest for left-to-right plotting
  const chartData = [...displayRecords].reverse().map((r) => ({
    x: r.timestamp ?? "",
    carbon: r.carbon_emissions_kgCO2e ?? null,
    water: r.water_consumption_liters ?? null,
  }));

  // Aggregate stats
  const carbonValues = displayRecords
    .map((r) => r.carbon_emissions_kgCO2e)
    .filter((v): v is number => v != null);
  const waterValues = displayRecords
    .map((r) => r.water_consumption_liters)
    .filter((v): v is number => v != null);

  const avgCarbon = avg(carbonValues);
  const avgWater = avg(waterValues);
  const maxCarbon = carbonValues.length ? Math.max(...carbonValues) : 0;
  const minCarbon = carbonValues.length ? Math.min(...carbonValues) : 0;
  const maxWater = waterValues.length ? Math.max(...waterValues) : 0;
  const minWater = waterValues.length ? Math.min(...waterValues) : 0;

  // Trend: compare first-half avg vs second-half avg
  const half = Math.floor(carbonValues.length / 2);
  const carbonTrend =
    carbonValues.length >= 2
      ? pct(avg(carbonValues.slice(0, half)), avg(carbonValues.slice(half)))
      : null;
  const waterTrend =
    waterValues.length >= 2
      ? pct(avg(waterValues.slice(0, half)), avg(waterValues.slice(half)))
      : null;

  // Sustainability flags from latest record
  const usingSolarPump = latest?.using_solar_pump;
  const usingNaturalFertilizer = latest?.using_natural_fertilizer;
  const greenCredits = latest?.eligible_for_green_credits;
  const natureCert = latest?.natural_produce_certification;

  const hasData = displayRecords.length > 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-5 w-5 text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Climate Smart Agriculture
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {entityName}
            </h1>
            {entityLocation && (
              <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {entityLocation}
              </p>
            )}
          </div>

          {/* Farmer info pill */}
          {latest?.farmer && (
            <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Farmer</p>
                <p className="text-sm font-semibold text-foreground">{latest.farmer}</p>
              </div>
              {latest.crop && (
                <>
                  <div className="w-px h-8 bg-border mx-1" />
                  <div>
                    <p className="text-xs text-muted-foreground leading-none mb-0.5">Crop</p>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {latest.crop}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
            <p className="text-sm">Loading sustainability data…</p>
          </div>
        ) : !hasData ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Sprout className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">No data available for this period.</p>
              <p className="text-xs mt-1">Data will appear once telemetry starts transmitting.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── KPI Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Avg Carbon Emissions"
                value={avgCarbon.toFixed(1)}
                unit="kg CO₂e"
                icon={Leaf}
                borderColor="#10b981"
              />
              <StatCard
                label="Avg Water Consumption"
                value={avgWater.toFixed(0)}
                unit="L"
                icon={Droplets}
                borderColor="#0ea5e9"
              />
              <StatCard
                label="Total Records"
                value={displayRecords.length}
                icon={Sprout}
                borderColor="#8b5cf6"
              />
              <StatCard
                label="Latest Carbon"
                value={latest?.carbon_emissions_kgCO2e?.toFixed(1) ?? "--"}
                unit="kg CO₂e"
                icon={
                  latest?.carbon_emissions_kgCO2e != null &&
                  latest.carbon_emissions_kgCO2e < avgCarbon
                    ? TrendingDown
                    : TrendingUp
                }
                borderColor={
                  latest?.carbon_emissions_kgCO2e != null &&
                  latest.carbon_emissions_kgCO2e < avgCarbon
                    ? "#10b981"
                    : "#f59e0b"
                }
              />
            </div>

            {/* ── Charts Section ── */}
            <div className="mb-8">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">
                  Sustainability Trends
                </h2>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  {(["today", "week", "month"] as FilterType[]).map((f) => (
                    <Button
                      key={f}
                      size="sm"
                      variant={activeFilter === f ? "default" : "ghost"}
                      className={`h-7 px-3 text-xs rounded-md ${
                        activeFilter === f ? "" : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveFilter(f)}
                    >
                      {f === "today" ? "Today" : f === "week" ? "Week" : "Month"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Carbon Emissions — Area Chart */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                        Carbon Emissions
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">kg CO₂e</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradCarbon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="x"
                          tickFormatter={(t) => formatDate(t, activeFilter)}
                          fontSize={10}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          fontSize={10}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          width={45}
                        />
                        <Tooltip
                          content={<CustomTooltip filter={activeFilter} />}
                          cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="carbon"
                          name="Carbon (kg CO₂e)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#gradCarbon)"
                          connectNulls={false}
                          dot={chartData.length <= 14 ? { r: 3, fill: "#10b981", strokeWidth: 0 } : false}
                          activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Water Consumption — Area Chart */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-500 inline-block" />
                        Water Consumption
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">Liters</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradWater" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="x"
                          tickFormatter={(t) => formatDate(t, activeFilter)}
                          fontSize={10}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          fontSize={10}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          width={45}
                        />
                        <Tooltip
                          content={<CustomTooltip filter={activeFilter} />}
                          cursor={{ stroke: "#0ea5e9", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="water"
                          name="Water (L)"
                          stroke="#0ea5e9"
                          strokeWidth={2.5}
                          fill="url(#gradWater)"
                          connectNulls={false}
                          dot={chartData.length <= 14 ? { r: 3, fill: "#0ea5e9", strokeWidth: 0 } : false}
                          activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Combined Overview — ComposedChart (Bar + Line) spanning full width */}
                <Card className="border-0 shadow-sm lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Combined Overview — Carbon & Water
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="x"
                          tickFormatter={(t) => formatDate(t, activeFilter)}
                          fontSize={10}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          fontSize={10}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          width={45}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          fontSize={10}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          width={45}
                        />
                        <Tooltip
                          content={<CustomTooltip filter={activeFilter} />}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="water"
                          name="Water (L)"
                          fill="#0ea5e9"
                          opacity={0.3}
                          radius={[3, 3, 0, 0]}
                          maxBarSize={24}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="carbon"
                          name="Carbon (kg CO₂e)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="#10b98112"
                          connectNulls={false}
                          dot={false}
                          activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── Sustainability Certifications ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Practices & Certifications */}
              <Card className="border-0 shadow-sm lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Practices & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BooleanBadge
                      label="Solar Pump in Use"
                      value={usingSolarPump}
                      icon={Zap}
                    />
                    <BooleanBadge
                      label="Natural Fertilizer"
                      value={usingNaturalFertilizer}
                      icon={FlaskConical}
                    />
                    <BooleanBadge
                      label="Eligible for Green Credits"
                      value={greenCredits}
                      icon={Award}
                    />
                    <BooleanBadge
                      label="Natural Produce Certified"
                      value={natureCert}
                      icon={BadgeCheck}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats sidebar card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Period Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Total Carbon",
                      val: `${carbonValues.reduce((a, b) => a + b, 0).toFixed(1)} kg CO₂e`,
                      color: "text-emerald-700 dark:text-emerald-300",
                    },
                    {
                      label: "Total Water",
                      val: `${waterValues.reduce((a, b) => a + b, 0).toFixed(0)} L`,
                      color: "text-sky-700 dark:text-sky-300",
                    },
                    {
                      label: "Avg Carbon / Reading",
                      val: `${avgCarbon.toFixed(1)} kg CO₂e`,
                      color: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      label: "Avg Water / Reading",
                      val: `${avgWater.toFixed(0)} L`,
                      color: "text-sky-600 dark:text-sky-400",
                    },
                    {
                      label: "Data Points",
                      val: `${displayRecords.length} records`,
                      color: "text-muted-foreground",
                    },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-emerald-100 dark:border-emerald-800 last:border-0">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className={`text-sm font-semibold tabular-nums ${color}`}>{val}</span>
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

export default ClimateAgriDetails;