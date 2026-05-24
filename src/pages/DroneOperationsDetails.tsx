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
  BarChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Wind,
  Sprout,
  Users,
  Flame,
  Megaphone,
  MapPin,
  BookOpen,
  CalendarCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";
type FilterType = "week" | "month" | "all";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DroneRecord {
  record_id?: string;
  record_date?: string;
  flying_hours?: number;
  acres_sprayed?: number;
  farmer_count?: number;
  fire_prevented?: number;
  announcement_made?: number;
}

interface HistoryResponse {
  useCaseId?: string;
  useCaseName?: string;
  useCaseProvider?: string;
  data?: DroneRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number | null) =>
  n != null ? n.toLocaleString() : "--";

const formatDate = (ts?: string, filter?: FilterType) => {
  if (!ts) return "N/A";
  const d = new Date(ts);
  if (filter === "week")
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const formatDateFull = (ts?: string) => {
  if (!ts) return "N/A";
  return new Date(ts).toLocaleString();
};

const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
const avg = (arr: number[]): number => (arr.length ? sum(arr) / arr.length : 0);

// ─── StatCard — master format ─────────────────────────────────────────────────

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

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

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

const DroneOperationsDetails = () => {
  const { droneId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || droneId;
  const entityName = state?.entityName || "Drone Unit";
  const entityLocation = state?.entityLocation || "";

  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("month");

  // ── Fetch ───────────────────────────────────────────────────────────────────
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
        console.error("DroneOperationsDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [entityId]);

  // ── Derived data ─────────────────────────────────────────────────────────────

  const allRecords: DroneRecord[] = historyData?.data || [];

  const filteredRecords = allRecords.filter((r) => {
    if (!r.record_date) return true;
    const t = new Date(r.record_date).getTime();
    const now = Date.now();
    if (activeFilter === "week") return t >= now - 7 * 86_400_000;
    if (activeFilter === "month") return t >= now - 30 * 86_400_000;
    return true;
  });

  const displayRecords = filteredRecords.length > 0 ? filteredRecords : allRecords;

  const chartData = [...displayRecords]
    .sort((a, b) => new Date(a.record_date!).getTime() - new Date(b.record_date!).getTime())
    .map((r) => ({
      x: r.record_date ?? "",
      flying_hours: r.flying_hours ?? null,
      acres_sprayed: r.acres_sprayed ?? null,
      farmer_count: r.farmer_count ?? null,
      fire_prevented: r.fire_prevented ?? null,
      announcement_made: r.announcement_made ?? null,
    }));

  const flyingHoursArr = displayRecords.map((r) => r.flying_hours ?? 0);
  const acresArr = displayRecords.map((r) => r.acres_sprayed ?? 0);
  const farmersArr = displayRecords.map((r) => r.farmer_count ?? 0);
  const fireArr = displayRecords.map((r) => r.fire_prevented ?? 0);
  const announcementsArr = displayRecords.map((r) => r.announcement_made ?? 0);

  const hasData = displayRecords.length > 0;

  const latestRecord = [...displayRecords].sort(
    (a, b) => new Date(b.record_date!).getTime() - new Date(a.record_date!).getTime()
  )[0];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">

        {/* ── Header — master format meta pill ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wind className="h-5 w-5 text-sky-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Drone Operations
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

          {/* Meta pill */}
          {historyData && (
            <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
              <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                <Wind className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Provider</p>
                <p className="text-sm font-semibold text-foreground">
                  {historyData.useCaseProvider ?? "--"}
                </p>
              </div>
              {latestRecord?.record_date && (
                <>
                  <div className="w-px h-8 bg-border mx-1" />
                  <div>
                    <p className="text-xs text-muted-foreground leading-none mb-0.5">Last Updated</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(latestRecord.record_date).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : !hasData ? (
          <div className="flex justify-center py-20 text-muted-foreground text-sm">
            No data available.
          </div>
        ) : (
          <>
            {/* ── Section 1: KPI stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                label="Total Flying Hours"
                value={sum(flyingHoursArr).toFixed(1)}
                unit="hrs"
                icon={Wind}
                borderColor="#0ea5e9"
              />
              <StatCard
                label="Total Acres Sprayed"
                value={sum(acresArr).toFixed(1)}
                unit="ac"
                icon={Sprout}
                borderColor="#10b981"
              />
              <StatCard
                label="Farmers Reached"
                value={fmt(sum(farmersArr))}
                icon={Users}
                borderColor="#8b5cf6"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatCard
                label="Fires Prevented"
                value={fmt(sum(fireArr))}
                icon={Flame}
                borderColor="#ef4444"
              />
              <StatCard
                label="Announcements Made"
                value={fmt(sum(announcementsArr))}
                icon={Megaphone}
                borderColor="#f59e0b"
              />
            </div>

            {/* ── Section 2: Charts ── */}
            <div className="mb-6">
              {/* Filter row */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  Operational Trends
                </h2>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  {(["week", "month", "all"] as FilterType[]).map((f) => (
                    <Button
                      key={f}
                      size="sm"
                      variant={activeFilter === f ? "default" : "ghost"}
                      className={`h-7 px-3 text-xs rounded-md ${
                        activeFilter === f ? "" : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveFilter(f)}
                    >
                      {f === "week" ? "Week" : f === "month" ? "Month" : "All"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Flying Hours — Area Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Wind className="h-4 w-4 text-muted-foreground" />
                        Flying Hours
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">hrs / day</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradFlying" x1="0" y1="0" x2="0" y2="1">
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
                          width={40}
                        />
                        <Tooltip content={<CustomTooltip filter={activeFilter} />} />
                        <Area
                          type="monotone"
                          dataKey="flying_hours"
                          name="Flying Hours"
                          stroke="#0ea5e9"
                          strokeWidth={2.5}
                          fill="url(#gradFlying)"
                          connectNulls={false}
                          dot={chartData.length <= 14 ? { r: 3, fill: "#0ea5e9", strokeWidth: 0 } : false}
                          activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Acres Sprayed — Area Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Sprout className="h-4 w-4 text-muted-foreground" />
                        Acres Sprayed
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">acres / day</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradAcres" x1="0" y1="0" x2="0" y2="1">
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
                          width={40}
                        />
                        <Tooltip content={<CustomTooltip filter={activeFilter} />} />
                        <Area
                          type="monotone"
                          dataKey="acres_sprayed"
                          name="Acres Sprayed"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#gradAcres)"
                          connectNulls={false}
                          dot={chartData.length <= 14 ? { r: 3, fill: "#10b981", strokeWidth: 0 } : false}
                          activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Outreach — Farmers + Announcements bar chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Farmer & Announcement Outreach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
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
                          width={30}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip filter={activeFilter} />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                        />
                        <Bar
                          dataKey="farmer_count"
                          name="Farmers"
                          fill="#8b5cf6"
                          opacity={0.85}
                          radius={[3, 3, 0, 0]}
                          maxBarSize={28}
                        />
                        <Bar
                          dataKey="announcement_made"
                          name="Announcements"
                          fill="#f59e0b"
                          opacity={0.85}
                          radius={[3, 3, 0, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Combined — Flying Hours (area) + Acres (bar) */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      Flying Hours vs Acres Sprayed
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
                          width={40}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          fontSize={10}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                        />
                        <Tooltip content={<CustomTooltip filter={activeFilter} />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="acres_sprayed"
                          name="Acres Sprayed"
                          fill="#10b981"
                          opacity={0.3}
                          radius={[3, 3, 0, 0]}
                          maxBarSize={24}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="flying_hours"
                          name="Flying Hours"
                          stroke="#0ea5e9"
                          strokeWidth={2.5}
                          fill="#0ea5e912"
                          connectNulls={false}
                          dot={false}
                          activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── Section 3: Averages + Record Info ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Daily Averages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    Daily Averages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Avg Flying Hours",    val: `${avg(flyingHoursArr).toFixed(2)} hrs` },
                    { label: "Avg Acres Sprayed",   val: `${avg(acresArr).toFixed(2)} ac` },
                    { label: "Avg Farmers Reached", val: avg(farmersArr).toFixed(1) },
                    { label: "Avg Announcements",   val: avg(announcementsArr).toFixed(1) },
                    { label: "Days Recorded",       val: displayRecords.length },
                  ].map(({ label, val }) => (
                    <div
                      key={label}
                      className="flex justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{val}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Record Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Record Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Provider",              val: historyData?.useCaseProvider ?? "--" },
                    { label: "Use Case",              val: historyData?.useCaseName ?? "--" },
                    { label: "Last Updated",          val: formatDateFull(latestRecord?.record_date) },
                    { label: "Total Flying Hours",    val: `${sum(flyingHoursArr).toFixed(2)} hrs` },
                    { label: "Total Acres Sprayed",   val: `${sum(acresArr).toFixed(2)} ac` },
                    { label: "Total Fires Prevented", val: fmt(sum(fireArr)) },
                  ].map(({ label, val }) => (
                    <div
                      key={label}
                      className="flex justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{val}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* ── Section 4: Daily Operations Log ── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Daily Operations Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {["Date", "Flying Hrs", "Acres Sprayed", "Farmers", "Fire Prevented", "Announcements"].map(
                          (h, i) => (
                            <th
                              key={h}
                              className={`text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3 ${
                                i === 0 ? "text-left" : "text-right"
                              }`}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {[...displayRecords]
                        .sort(
                          (a, b) =>
                            new Date(b.record_date!).getTime() -
                            new Date(a.record_date!).getTime()
                        )
                        .map((r, idx) => (
                          <tr
                            key={r.record_id ?? idx}
                            className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-5 py-3 font-medium text-foreground">
                              {r.record_date
                                ? new Date(r.record_date).toLocaleDateString([], {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "--"}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-sky-600 dark:text-sky-400 font-semibold">
                              {r.flying_hours?.toFixed(2) ?? "--"}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                              {r.acres_sprayed?.toFixed(2) ?? "--"}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-violet-600 dark:text-violet-400 font-semibold">
                              {r.farmer_count ?? "--"}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums">
                              <span
                                className={`font-semibold ${
                                  (r.fire_prevented ?? 0) > 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {r.fire_prevented ?? 0}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-amber-600 dark:text-amber-400 font-semibold">
                              {r.announcement_made ?? "--"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/40 border-t-2 border-border font-semibold">
                        <td className="px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                          Total ({displayRecords.length} days)
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-sky-600 dark:text-sky-400">
                          {sum(flyingHoursArr).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                          {sum(acresArr).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-violet-600 dark:text-violet-400">
                          {sum(farmersArr)}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-red-600 dark:text-red-400">
                          {sum(fireArr)}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-amber-600 dark:text-amber-400">
                          {sum(announcementsArr)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default DroneOperationsDetails;