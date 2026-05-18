import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Car,
  MapPin,
  Route,
  School,
  TreePine,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────

interface EVRecord {
  useCaseId?: string;
  useCaseName?: string;
  useCaseProvider?: string;
  vehicle_deployed_count?: number;
  trip_count?: number;
  school_trip_count?: number;
  village_trip_count?: number;
  data?: {
    village_id?: string;
    vehicle_deployed_count?: number;
    trip_count?: number;
    school_trip_count?: number;
    village_trip_count?: number;
  }[];
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

// ─── Trip Breakdown Donut ─────────────────────────────────────────────────────

const TripBreakdownCard = ({
  totalTrips,
  schoolTrips,
  villageTrips,
  schoolPct,
  villagePct,
}: {
  totalTrips: number;
  schoolTrips: number;
  villageTrips: number;
  schoolPct: string;
  villagePct: string;
}) => {
  const radius = 72;
  const stroke = 14;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * radius;

  const schoolFrac  = totalTrips > 0 ? schoolTrips  / totalTrips : 0;
  const villageFrac = totalTrips > 0 ? villageTrips / totalTrips : 0;
  const otherFrac   = Math.max(0, 1 - schoolFrac - villageFrac);

  const schoolDash  = schoolFrac  * circumference;
  const villageDash = villageFrac * circumference;
  const otherDash   = otherFrac   * circumference;

  const gap           = 3;
  const schoolOffset  = circumference * 0.25;
  const villageOffset = schoolOffset  - schoolDash  - gap;
  const otherOffset   = villageOffset - villageDash - gap;

  const rows = [
    {
      label: "School Trips",
      value: schoolTrips,
      pct: schoolPct,
      color: "#8b5cf6",
      icon: School,
    },
    {
      label: "Village Trips",
      value: villageTrips,
      pct: villagePct,
      color: "#f59e0b",
      icon: TreePine,
    },
    {
      label: "Other",
      value: Math.max(0, totalTrips - schoolTrips - villageTrips),
      pct:
        totalTrips > 0
          ? (((totalTrips - schoolTrips - villageTrips) / totalTrips) * 100).toFixed(1)
          : "0",
      color: "#94a3b8",
      icon: Route,
    },
  ];

  return (
    <Card className="border-0 shadow-sm lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Route className="h-4 w-4" style={{ color: "#0ea5e9" }} />
          Trip Route Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <div className="flex flex-1 flex-col sm:flex-row items-center justify-center gap-10">

          {/* ── Donut Chart ── */}
          <div className="relative flex-shrink-0">
            <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`}>
              <circle
                cx={cx} cy={cy} r={radius}
                fill="none" stroke="currentColor"
                strokeOpacity={0.08} strokeWidth={stroke}
              />
              <circle
                cx={cx} cy={cy} r={radius}
                fill="none" stroke="#8b5cf6" strokeWidth={stroke}
                strokeDasharray={`${Math.max(0, schoolDash - gap)} ${circumference}`}
                strokeDashoffset={schoolOffset} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              <circle
                cx={cx} cy={cy} r={radius}
                fill="none" stroke="#f59e0b" strokeWidth={stroke}
                strokeDasharray={`${Math.max(0, villageDash - gap)} ${circumference}`}
                strokeDashoffset={villageOffset} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              {otherFrac > 0.01 && (
                <circle
                  cx={cx} cy={cy} r={radius}
                  fill="none" stroke="#94a3b8" strokeWidth={stroke}
                  strokeDasharray={`${Math.max(0, otherDash - gap)} ${circumference}`}
                  strokeDashoffset={otherOffset} strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
              )}
              <text
                x={cx} y={cy - 10}
                textAnchor="middle" dominantBaseline="middle"
                className="fill-foreground"
                style={{ fontSize: 30, fontWeight: 900, fontFamily: "inherit" }}
              >
                {totalTrips}
              </text>
              <text
                x={cx} y={cy + 16}
                textAnchor="middle" dominantBaseline="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, fontFamily: "inherit" }}
              >
                TOTAL TRIPS
              </text>
            </svg>
          </div>

          {/* ── Legend Rows — master format ── */}
          <div className="flex-1 w-full space-y-4">
            {rows.map(({ label, value, pct, color, icon: Icon }) => (
              <div key={label}>
                {/* Label row — master format icon + uppercase label */}
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} />
                  <span className="text-xs text-muted-foreground uppercase font-semibold flex-1">
                    {label}
                  </span>
                  <span className="text-sm font-bold text-green-600 tabular-nums">
                    {value}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({pct}%)
                    </span>
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EVAutoDetails = () => {
  const { evId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || evId;
  const entityName = state?.entityName || "EV Auto";
  const entityLocation = state?.entityLocation || "";

  const [data, setData] = useState<EVRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const res = await apiClient.get<any>(
          API_URLS.GET_KPI_HISTORY(entityId),
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY }
        );
        setData(res?.data || null);
      } catch (err) {
        console.error("EVAutoDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const totalTrips   = data?.trip_count          ?? 0;
  const schoolTrips  = data?.school_trip_count   ?? 0;
  const villageTrips = data?.village_trip_count  ?? 0;
  const schoolPct    = totalTrips > 0 ? ((schoolTrips  / totalTrips) * 100).toFixed(1) : "0";
  const villagePct   = totalTrips > 0 ? ((villageTrips / totalTrips) * 100).toFixed(1) : "0";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                EV Auto — Optimus Logic
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

          {/* Provider pill */}
          {data && (
            <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Car className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Provider</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.useCaseProvider ?? "Optimus Logic"}
                </p>
              </div>
              <div className="w-px h-8 bg-border mx-1" />
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Vehicles</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.vehicle_deployed_count ?? "--"}
                </p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
            <p className="text-sm">Loading EV data…</p>
          </div>
        ) : !data ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Car className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">No data available.</p>
              <p className="text-xs mt-1">Data will appear once the vehicle starts reporting.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Section 1: Fleet & Trip Overview ── */}
            <div className="mb-8">
              <SectionDivider title="Fleet & Trip Overview" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Vehicles Deployed"
                  value={data.vehicle_deployed_count ?? "--"}
                  icon={Car}
                  borderColor="#10b981"
                />
                <StatCard
                  label="Total Trips"
                  value={data.trip_count ?? "--"}
                  icon={Route}
                  borderColor="#0ea5e9"
                />
                <StatCard
                  label="School Trips"
                  value={data.school_trip_count ?? "--"}
                  icon={School}
                  borderColor="#8b5cf6"
                />
                <StatCard
                  label="Village Trips"
                  value={data.village_trip_count ?? "--"}
                  icon={TreePine}
                  borderColor="#f59e0b"
                />
              </div>
            </div>

            {/* ── Section 2: Trip Split + Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Fleet Summary */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Car className="h-4 w-4" style={{ color: "#10b981" }} />
                    Fleet Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {[
                    { label: "Provider",          val: data.useCaseProvider ?? "Optimus Logic",      icon: Zap,      color: "#10b981" },
                    { label: "Vehicles Deployed", val: String(data.vehicle_deployed_count ?? "--"),  icon: Car,      color: "#0ea5e9" },
                    { label: "Total Trips",       val: String(data.trip_count ?? "--"),              icon: Route,    color: "#6366f1" },
                    { label: "School Trips",      val: String(data.school_trip_count ?? "--"),       icon: School,   color: "#8b5cf6" },
                    { label: "Village Trips",     val: String(data.village_trip_count ?? "--"),      icon: TreePine, color: "#f59e0b" },
                  ].map(({ label, val, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 py-3 border-b border-emerald-100 dark:border-emerald-800 last:border-0"
                    >
                      {/* master format: flat tinted icon, no bubble */}
                      <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} />
                      <div className="text-xs text-muted-foreground uppercase font-semibold flex-1">
                        {label}
                      </div>
                      <p className="text-sm font-bold tabular-nums text-green-600">{val}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trip Breakdown Donut */}
              <TripBreakdownCard
                totalTrips={totalTrips}
                schoolTrips={schoolTrips}
                villageTrips={villageTrips}
                schoolPct={schoolPct}
                villagePct={villagePct}
              />

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EVAutoDetails;