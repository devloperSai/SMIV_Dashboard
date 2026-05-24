import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  School,
  Users,
  GraduationCap,
  Tv,
  PlayCircle,
  Clock,
  CalendarCheck,
  MapPin,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnganwadiRecord {
  useCaseId?: string;
  useCaseName?: string;
  useCaseProvider?: string;
  anganwadi_count?: number;
  projector_count?: number;
  video_lesson_count?: number;
  video_lesson_hour?: number;
  student_count?: number;
  staff_count?: number;
  anganwadi_id?: string | null;
  record_date?: string;
  latitude?: string;
  longitude?: string;
  anganwadi_student_count?: number;
  anganwadi_staff_count?: number;
  anganwadi_video_lesson_count?: number;
  anganwadi_video_lesson_hour?: number;
  log_available_day_count?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (ts?: string) => {
  if (!ts) return "--";
  return new Date(ts).toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const pct = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

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

const AnganwadiDetails = () => {
  const { anganwadiId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || anganwadiId;
  const entityName = state?.entityName || "Smart Anganwadi";
  const entityLocation = state?.entityLocation || "";

  const [data, setData] = useState<AnganwadiRecord | null>(null);
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
          { "x-api-key": SMIV_API_KEY },
        );
        setData(res?.data || null);
      } catch (err) {
        console.error("AnganwadiDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const contributionBars = data
    ? [
        {
          metric: "Students",
          value: pct(
            data.anganwadi_student_count ?? 0,
            data.student_count ?? 0,
          ),
          centre: data.anganwadi_student_count ?? 0,
          total: data.student_count ?? 0,
          color: "#8b5cf6",
        },
        {
          metric: "Staff",
          value: pct(data.anganwadi_staff_count ?? 0, data.staff_count ?? 0),
          centre: data.anganwadi_staff_count ?? 0,
          total: data.staff_count ?? 0,
          color: "#0ea5e9",
        },
        {
          metric: "Video Lessons",
          value: pct(
            data.anganwadi_video_lesson_count ?? 0,
            data.video_lesson_count ?? 0,
          ),
          centre: data.anganwadi_video_lesson_count ?? 0,
          total: data.video_lesson_count ?? 0,
          color: "#6366f1",
        },
        {
          metric: "Video Hours",
          value: pct(
            data.anganwadi_video_lesson_hour ?? 0,
            data.video_lesson_hour ?? 0,
          ),
          centre: data.anganwadi_video_lesson_hour ?? 0,
          total: data.video_lesson_hour ?? 0,
          color: "#ec4899",
        },
      ]
    : [];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <School className="h-5 w-5 text-orange-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                Smart Anganwadi
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
          {data && (
            <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <School className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">
                  Provider
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {data.useCaseProvider ?? "Edufront Technologies"}
                </p>
              </div>
              {data.record_date && (
                <>
                  <div className="w-px h-8 bg-border mx-1" />
                  <div>
                    <p className="text-xs text-muted-foreground leading-none mb-0.5">
                      Last Updated
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(data.record_date).toLocaleDateString([], {
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
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
            <p className="text-sm">Loading Anganwadi data…</p>
          </div>
        ) : !data ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <School className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">No data available.</p>
              <p className="text-xs mt-1">
                Data will appear once the centre starts reporting.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Section 1: Network Overview — cards ── */}
            <div className="mb-8">
              <SectionDivider title="Network Overview" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Anganwadi Centres"
                  value={data.anganwadi_count ?? "--"}
                  icon={School}
                  borderColor="#f97316"
                />
                <StatCard
                  label="Total Students"
                  value={data.student_count ?? "--"}
                  icon={GraduationCap}
                  borderColor="#8b5cf6"
                />
                <StatCard
                  label="Total Staff"
                  value={data.staff_count ?? "--"}
                  icon={Users}
                  borderColor="#0ea5e9"
                />
                <StatCard
                  label="Projectors Deployed"
                  value={data.projector_count ?? "--"}
                  icon={Tv}
                  borderColor="#10b981"
                />
              </div>
            </div>

            {/* ── Section 2: Video Learning — cards (2 numbers, no chart appropriate) ── */}
            <div className="mb-8">
              <SectionDivider title="Video Learning — Network Total" />
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Video Lessons Available"
                  value={data.video_lesson_count ?? "--"}
                  icon={PlayCircle}
                  borderColor="#6366f1"
                />
                <StatCard
                  label="Total Video Hours"
                  value={data.video_lesson_hour ?? "--"}
                  unit="hrs"
                  icon={Clock}
                  borderColor="#ec4899"
                />
              </div>
            </div>

            {/* ── Section 3: This Centre — contribution bars replace stat cards ── */}
            <div className="mb-8">
              <SectionDivider title="This Centre — Contribution to Network" />
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <GraduationCap
                      className="h-4 w-4"
                      style={{ color: "#8b5cf6" }}
                    />
                    Centre Share of Network
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    How much this centre contributes to the overall network
                  </p>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-5">
                    {contributionBars.map((item) => (
                      <div key={item.metric}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">
                            {item.metric}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span
                              className="text-sm font-bold"
                              style={{ color: item.color }}
                            >
                              {item.centre}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              / {item.total} total
                            </span>
                            <span
                              className="text-xs font-semibold ml-1 px-1.5 py-0.5 rounded-md"
                              style={{
                                background: `${item.color}18`,
                                color: item.color,
                              }}
                            >
                              {item.value}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.value}%`,
                              background: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Section 4: Activity & Location ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity card */}
              <Card className="border-0 shadow-sm lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CalendarCheck
                      className="h-4 w-4"
                      style={{ color: "#10b981" }}
                    />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {[
                    {
                      label: "Log Available Days",
                      val:
                        data.log_available_day_count != null
                          ? `${data.log_available_day_count} days`
                          : "--",
                      icon: CalendarCheck,
                      color: "#10b981",
                    },
                    {
                      label: "Last Record Date",
                      val: formatDate(data.record_date),
                      icon: Clock,
                      color: "#f97316",
                    },
                  ].map(({ label, val, icon: Icon, color }) => (
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

              {/* Location card */}
              <Card className="overflow-hidden border border-border shadow-sm lg:col-span-2">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Centre Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.latitude && data.longitude ? (
                    <>
                      {/* Embedded Map */}
                      <div className="w-full h-[200px] relative">
                        <iframe
                          title="Centre Location Map"
                          width="100%"
                          height="100%"
                          style={{ border: 0, display: "block" }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${data.latitude},${data.longitude}&z=14&output=embed`}
                        />
                        {/* Live pin badge */}
                        <div className="absolute top-2 left-2 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 shadow-md flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse inline-block" />
                          <span className="text-xs font-semibold text-foreground">
                            Live Pin
                          </span>
                        </div>
                      </div>

                      {/* Coordinates + CTA row */}
                      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-t border-border">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
                              Latitude
                            </p>
                            <p className="text-sm font-bold tabular-nums text-foreground">
                              {parseFloat(data.latitude).toFixed(6)}°
                            </p>
                          </div>
                          <div className="w-px h-8 bg-border" />
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
                              Longitude
                            </p>
                            <p className="text-sm font-bold tabular-nums text-foreground">
                              {parseFloat(data.longitude).toFixed(6)}°
                            </p>
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Open Maps
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-muted-foreground">
                      <MapPin className="h-8 w-8 opacity-30" />
                      <p className="text-sm">
                        Location coordinates not available.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnganwadiDetails;
