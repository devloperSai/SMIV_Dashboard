import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  School,
  Users,
  GraduationCap,
  PlayCircle,
  Clock,
  Monitor,
  BookOpen,
  CalendarCheck,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SmartSchoolRecord {
  useCaseId?: string;
  useCaseName?: string;
  useCaseProvider?: string;
  school_count?: number;
  cbse_video_lesson_count?: number;
  mah_video_lesson_count?: number;
  cbse_video_lesson_hour?: number;
  mah_video_lesson_hour?: number;
  student_count?: number;
  staff_count?: number;
  school_id?: string | null;
  record_date?: string;
  latitude?: string;
  longitude?: string;
  school_student_count?: number;
  school_staff_count?: number;
  total_video_lesson_count?: number;
  total_video_lesson_hour?: number;
  online_classroom_count?: number;
  planned_lesson_week_count?: number;
  played_lesson_week_count?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number | null) =>
  n != null ? n.toLocaleString() : "--";

const formatDate = (ts?: string) => {
  if (!ts) return "N/A";
  return new Date(ts).toLocaleString();
};

const pct = (a?: number, b?: number): number => {
  if (!a || !b || b === 0) return 0;
  return Math.min((a / b) * 100, 100);
};

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

// ─── Main Component ───────────────────────────────────────────────────────────

const SmartSchoolDetails = () => {
  const { schoolId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || schoolId;
  const entityName = state?.entityName || "Smart School";
  const entityLocation = state?.entityLocation || "";

  const [data, setData] = useState<SmartSchoolRecord | null>(null);
  const [loading, setLoading] = useState(true);

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
        console.error("SmartSchoolDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  // Derived
  const completionPct = pct(data?.played_lesson_week_count, data?.planned_lesson_week_count);
  const totalCount = (data?.cbse_video_lesson_count ?? 0) + (data?.mah_video_lesson_count ?? 0);
  const cbsePct   = totalCount > 0 ? ((data?.cbse_video_lesson_count ?? 0) / totalCount) * 100 : 50;
  const totalHrs  = (data?.cbse_video_lesson_hour ?? 0) + (data?.mah_video_lesson_hour ?? 0);
  const cbseHrPct = totalHrs > 0 ? ((data?.cbse_video_lesson_hour ?? 0) / totalHrs) * 100 : 50;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <School className="h-5 w-5 text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Smart School
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
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Provider</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.useCaseProvider ?? "Edufront Technologies"}
                </p>
              </div>
              {data.record_date && (
                <>
                  <div className="w-px h-8 bg-border mx-1" />
                  <div>
                    <p className="text-xs text-muted-foreground leading-none mb-0.5">Last Updated</p>
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
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : !data ? (
          <div className="flex justify-center py-20 text-muted-foreground text-sm">
            No data available.
          </div>
        ) : (
          <>
            {/* ── Section 1: School overview stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Schools"
                value={fmt(data.school_count)}
                icon={School}
                borderColor="#2563eb"
              />
              <StatCard
                label="Students"
                value={fmt(data.school_student_count ?? data.student_count)}
                icon={GraduationCap}
                borderColor="#7c3aed"
              />
              <StatCard
                label="Staff"
                value={fmt(data.school_staff_count ?? data.staff_count)}
                icon={Users}
                borderColor="#0891b2"
              />
              <StatCard
                label="Online Classrooms"
                value={fmt(data.online_classroom_count)}
                icon={Monitor}
                borderColor="#059669"
              />
            </div>

            {/* ── Section 2: Video library stat cards ── */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatCard
                label="Total Video Lessons"
                value={fmt(data.total_video_lesson_count)}
                icon={PlayCircle}
                borderColor="#6366f1"
              />
              <StatCard
                label="Total Video Hours"
                value={fmt(data.total_video_lesson_hour)}
                unit="hrs"
                icon={Clock}
                borderColor="#db2777"
              />
            </div>

            {/* ── Section 3: Curriculum split + Weekly activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Curriculum Board Split */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Curriculum Board Split
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Lessons split */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>CBSE — {fmt(data.cbse_video_lesson_count)} lessons</span>
                      <span>Maharashtra — {fmt(data.mah_video_lesson_count)} lessons</span>
                    </div>
                    <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-0.5">
                      <div
                        className="rounded-l-full transition-all"
                        style={{ width: `${cbsePct}%`, background: "#2563eb" }}
                      />
                      <div
                        className="flex-1 rounded-r-full"
                        style={{ background: "#7c3aed" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 font-semibold">
                      <span style={{ color: "#2563eb" }}>{cbsePct.toFixed(1)}%</span>
                      <span style={{ color: "#7c3aed" }}>{(100 - cbsePct).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Hours split */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>CBSE — {fmt(data.cbse_video_lesson_hour)} hrs</span>
                      <span>Maharashtra — {fmt(data.mah_video_lesson_hour)} hrs</span>
                    </div>
                    <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-0.5">
                      <div
                        className="rounded-l-full transition-all"
                        style={{ width: `${cbseHrPct}%`, background: "#2563eb" }}
                      />
                      <div
                        className="flex-1 rounded-r-full"
                        style={{ background: "#7c3aed" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 font-semibold">
                      <span style={{ color: "#2563eb" }}>{cbseHrPct.toFixed(1)}%</span>
                      <span style={{ color: "#7c3aed" }}>{(100 - cbseHrPct).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-6 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: "#2563eb" }} />
                      <span className="text-xs text-muted-foreground">CBSE Board</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: "#7c3aed" }} />
                      <span className="text-xs text-muted-foreground">Maharashtra Board</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Lesson Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    Weekly Lesson Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">

                  {/* Planned vs Played numbers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                        Planned
                      </p>
                      <p className="text-2xl font-bold text-foreground tabular-nums">
                        {fmt(data.planned_lesson_week_count)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                        Played
                      </p>
                      <p className="text-2xl font-bold text-green-600 tabular-nums">
                        {fmt(data.played_lesson_week_count)}
                      </p>
                    </div>
                  </div>

                  {/* Completion bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Completion rate this week</span>
                      <span className="font-semibold text-foreground">
                        {completionPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${completionPct}%`, background: "#2563eb" }}
                      />
                    </div>
                  </div>

                  {/* Board detail rows */}
                  <div className="border-t border-border pt-4 space-y-3">
                    {[
                      {
                        label: "CBSE",
                        val: `${fmt(data.cbse_video_lesson_count)} lessons · ${fmt(data.cbse_video_lesson_hour)} hrs`,
                      },
                      {
                        label: "Maharashtra",
                        val: `${fmt(data.mah_video_lesson_count)} lessons · ${fmt(data.mah_video_lesson_hour)} hrs`,
                      },
                      {
                        label: "School ID",
                        val: data.school_id ?? "--",
                      },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold text-foreground tabular-nums">{val}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Section 4: Record info + Location ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Record info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Record Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Provider",         val: data.useCaseProvider ?? "Edufront Technologies" },
                    { label: "School ID",         val: data.school_id ?? "--" },
                    { label: "Last Updated",      val: formatDate(data.record_date) },
                    { label: "Total Lessons",     val: fmt(data.total_video_lesson_count) },
                    { label: "Total Hours",       val: `${fmt(data.total_video_lesson_hour)} hrs` },
                    { label: "Online Classrooms", val: fmt(data.online_classroom_count) },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{val}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

             {/* Location */}
             <Card className="overflow-hidden border border-border shadow-sm">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    School Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
            {data.latitude && data.longitude ? (
      <>
        {/* Embedded Map */}
        <div className="w-full h-[200px] relative">
          <iframe
            title="School Location Map"
            width="100%"
            height="100%"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${data.latitude},${data.longitude}&z=14&output=embed`}
          />
          {/* subtle overlay pin badge */}
          <div className="absolute top-2 left-2 bg-white dark:bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 shadow-md flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse inline-block" />
            <span className="text-xs font-semibold text-foreground">Live Pin</span>
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5 transition-colors"
          >
            <MapPin className="h-3.5 w-3.5" />
            Open Maps
          </a>
        </div>
      </>
    ) : (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-muted-foreground">
        <MapPin className="h-8 w-8 opacity-30" />
        <p className="text-sm">Location coordinates not available.</p>
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

export default SmartSchoolDetails;