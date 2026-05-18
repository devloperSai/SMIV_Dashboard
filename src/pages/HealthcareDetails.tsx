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
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Heart,
  Users,
  Stethoscope,
  Pill,
  Clock,
  TrendingUp,
  TrendingDown,
  MapPin,
  Activity,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;
type FilterType = "week" | "month" | "all";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealthRecord {
  timestamp?: string;
  ratio?: string;
  status?: string;
  downtime?: number;
  updatime?: number;
  male_patient?: number;
  stock_report?: string;
  consultantion?: number;
  patient_count?: number;
  female_patient?: number;
  medicine_dispensed?: string;
}

interface HistoryResponse {
  useCaseId?: string;
  useCaseName?: string;
  useCaseProvider?: string;
  entityId?: string;
  data?: HealthRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (ts: string, filter: FilterType) => {
  const d = new Date(ts);
  if (filter === "week")
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const avg = (arr: number[]) => (arr.length ? sum(arr) / arr.length : 0);
const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100);

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

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">{title}</h2>
    <div className="flex-1 h-px bg-border" />
  </div>
);

const CustomTooltip = ({ active, payload, label, filter }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-muted-foreground text-xs mb-2 font-medium">
        {label ? formatDate(label, filter) : ""}
      </p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const HealthcareDetails = () => {
  const { healthId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || healthId;
  const entityName = state?.entityName || "Healthcare Centre";
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
        console.error("HealthcareDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [entityId]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const allRecords: HealthRecord[] = historyData?.data || [];

  const filteredRecords = allRecords.filter((r) => {
    if (!r.timestamp) return true;
    const t = new Date(r.timestamp).getTime();
    const now = Date.now();
    if (activeFilter === "week") return t >= now - 7 * 86_400_000;
    if (activeFilter === "month") return t >= now - 30 * 86_400_000;
    return true;
  });

  const displayRecords = filteredRecords.length > 0 ? filteredRecords : allRecords;
  const latest = displayRecords[0] ?? allRecords[0];

  const chartData = [...displayRecords]
    .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime())
    .map((r) => ({
      x: r.timestamp ?? "",
      patients: r.patient_count ?? null,
      male: r.male_patient ?? null,
      female: r.female_patient ?? null,
      consultations: r.consultantion ?? null,
      medicine: r.medicine_dispensed != null ? parseInt(r.medicine_dispensed as string) : null,
      uptime: r.updatime ?? null,
      downtime: r.downtime ?? null,
    }));

  const patientArr = displayRecords.map((r) => r.patient_count ?? 0);
  const consultArr = displayRecords.map((r) => r.consultantion ?? 0);
  const medArr = displayRecords.map((r) =>
    r.medicine_dispensed ? parseInt(r.medicine_dispensed) : 0
  );
  const uptimeArr = displayRecords.map((r) => r.updatime ?? 0);
  const downtimeArr = displayRecords.map((r) => r.downtime ?? 0);

  const half = Math.floor(patientArr.length / 2);
  const patientTrend =
    patientArr.length >= 2
      ? pct(avg(patientArr.slice(0, half)), avg(patientArr.slice(half)))
      : null;
  const consultTrend =
    consultArr.length >= 2
      ? pct(avg(consultArr.slice(0, half)), avg(consultArr.slice(half)))
      : null;

  const totalHours = sum(uptimeArr) + sum(downtimeArr);
  const uptimePct = totalHours > 0 ? ((sum(uptimeArr) / totalHours) * 100).toFixed(1) : "--";

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
              <Heart className="h-5 w-5 text-rose-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                Healthcare — MangalCare
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{entityName}</h1>
            {entityLocation && (
              <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {entityLocation}
              </p>
            )}
          </div>

          {/* Status + provider pill */}
          <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
            <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">Provider</p>
              <p className="text-sm font-semibold text-foreground">
                {historyData?.useCaseProvider ?? "MangalCare"}
              </p>
            </div>
            {latest?.status && (
              <>
                <div className="w-px h-8 bg-border mx-1" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none mb-0.5">Status</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {latest.status}
                    </p>
                  </div>
                </div>
              </>
            )}
            {latest?.ratio && (
              <>
                <div className="w-px h-8 bg-border mx-1" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none mb-0.5">M:F Ratio</p>
                  <p className="text-sm font-semibold text-foreground">{latest.ratio}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-rose-500" />
            <p className="text-sm">Loading healthcare data…</p>
          </div>
        ) : !hasData ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Heart className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">No data available for this period.</p>
              <p className="text-xs mt-1">Records will appear once the centre starts reporting.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Section 1: KPI Cards ── */}
            <div className="mb-8">
              <SectionDivider title="Key Metrics" />
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  label="Total Patients"
                  value={(latest?.patient_count ?? 0).toLocaleString()}
                  icon={Users}
                  borderColor="#f43f5e"
                />
                <StatCard
                  label="Male Patients"
                  value={(latest?.male_patient ?? 0).toLocaleString()}
                  icon={Users}
                  borderColor="#6366f1"
                />
                <StatCard
                  label="Female Patients"
                  value={(latest?.female_patient ?? 0).toLocaleString()}
                  icon={Users}
                  borderColor="#f59e0b"
                />
                <StatCard
                  label="Consultations"
                  value={(latest?.consultantion ?? 0).toLocaleString()}
                  icon={Stethoscope}
                  borderColor="#8b5cf6"
                />
                <StatCard
                  label="Medicine Dispensed"
                  value={latest?.medicine_dispensed ?? "--"}
                  unit="units"
                  icon={Pill}
                  borderColor="#10b981"
                />
              </div>
            </div>

            {/* ── Section 2: Charts ── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">Trends</h2>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Patient Count — Area */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
                        Patient Count
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">cumulative</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradPatient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="x" tickFormatter={(t) => formatDate(t, activeFilter)} fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                        <Tooltip content={<CustomTooltip filter={activeFilter} />} cursor={{ stroke: "#f43f5e", strokeWidth: 1, strokeDasharray: "4 4" }} />
                        <Area type="monotone" dataKey="patients" name="Patients" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradPatient)" connectNulls={false} dot={chartData.length <= 14 ? { r: 3, fill: "#f43f5e", strokeWidth: 0 } : false} activeDot={{ r: 5, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Male vs Female — Stacked Bar */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />
                      Male vs Female Patients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="x" tickFormatter={(t) => formatDate(t, activeFilter)} fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip filter={activeFilter} />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Bar dataKey="male" name="Male" stackId="a" fill="#6366f1" opacity={0.75} maxBarSize={28} />
                        <Bar dataKey="female" name="Female" stackId="a" fill="#f59e0b" opacity={0.75} radius={[3, 3, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Consultations — Area */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-violet-500 inline-block" />
                        Consultations
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">cumulative</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradConsult" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="x" tickFormatter={(t) => formatDate(t, activeFilter)} fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                        <Tooltip content={<CustomTooltip filter={activeFilter} />} cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }} />
                        <Area type="monotone" dataKey="consultations" name="Consultations" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradConsult)" connectNulls={false} dot={chartData.length <= 14 ? { r: 3, fill: "#8b5cf6", strokeWidth: 0 } : false} activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Medicine Dispensed + Consultations — Combined */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Medicine Dispensed vs Consultations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="x" tickFormatter={(t) => formatDate(t, activeFilter)} fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                        <YAxis yAxisId="right" orientation="right" fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={45} />
                        <Tooltip content={<CustomTooltip filter={activeFilter} />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Bar yAxisId="right" dataKey="medicine" name="Medicine (units)" fill="#10b981" opacity={0.35} radius={[3, 3, 0, 0]} maxBarSize={24} />
                        <Line yAxisId="left" type="monotone" dataKey="consultations" name="Consultations" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── Section 3: Uptime + Daily Log ── */}
            <div className="space-y-6">

              {/* Uptime summary */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    System Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="relative flex items-center justify-center h-28 w-28">
                      <svg className="absolute inset-0" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="#10b981" strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 42 * parseFloat(uptimePct) / 100} ${2 * Math.PI * 42}`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="text-center">
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                          {uptimePct}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Uptime</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap gap-4 w-full">
                    {[
                      { label: "Total Uptime", val: `${sum(uptimeArr)} hrs`, icon: ShieldCheck, color: "#10b981" },
                      { label: "Total Downtime", val: `${sum(downtimeArr)} hrs`, icon: Clock, color: "#f43f5e" },
                      { label: "Days Monitored", val: `${displayRecords.length} days`, icon: Activity, color: "#8b5cf6" },
                    ].map(({ label, val, icon: Icon, color }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 flex-1 min-w-[140px] bg-white/50 dark:bg-white/5 rounded-xl px-4 py-3 border border-emerald-100 dark:border-emerald-800"
                      >
                        <div
                          className="flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0"
                          style={{ background: `${color}22` }}
                        >
                          <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-semibold text-foreground">{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Daily log table */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Daily Records Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {["Date", "Patients", "Male", "Female", "Consults", "Medicine", "Uptime"].map((h) => (
                            <th key={h} className={`text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 ${h === "Date" ? "text-left" : "text-right"}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...displayRecords]
                          .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
                          .map((r, idx) => (
                            <tr key={idx} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">
                                {r.timestamp ? new Date(r.timestamp).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "--"}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                                {r.patient_count?.toLocaleString() ?? "--"}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-indigo-600 dark:text-indigo-400">
                                {r.male_patient?.toLocaleString() ?? "--"}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-amber-600 dark:text-amber-400">
                                {r.female_patient?.toLocaleString() ?? "--"}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-violet-600 dark:text-violet-400">
                                {r.consultantion?.toLocaleString() ?? "--"}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                                {r.medicine_dispensed ?? "--"}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums">
                                <span className={`font-semibold ${(r.downtime ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                  {r.updatime ?? "--"}h
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/40 border-t-2 border-border font-semibold">
                          <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                            Total ({displayRecords.length} days)
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-rose-600 dark:text-rose-400">—</td>
                          <td className="px-4 py-3 text-right tabular-nums text-indigo-600 dark:text-indigo-400">—</td>
                          <td className="px-4 py-3 text-right tabular-nums text-amber-600 dark:text-amber-400">—</td>
                          <td className="px-4 py-3 text-right tabular-nums text-violet-600 dark:text-violet-400">—</td>
                          <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {sum(medArr).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {sum(uptimeArr)}h
                          </td>
                        </tr>
                      </tfoot>
                    </table>
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

export default HealthcareDetails;