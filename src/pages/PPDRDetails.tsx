import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  ShieldAlert,
  Megaphone,
  Siren,
  Radio,
  Server,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PPDRRecord {
  useCaseId?: string;
  useCaseName?: string;
  useCaseProvider?: string;
  latitude?: string;
  longitude?: string;
  system_deployed_count?: number;
  announcement_count?: number;
  sos_trigger_count?: number;
  ptt_pressed_count?: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  borderColor,
  unit,
}: {
  label: string;
  value: string | number;
  icon: any;
  borderColor: string;
  unit?: string;
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

const PPDRDetails = () => {
  const { ppdrid } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || ppdrid;
  const entityName = state?.entityName || "PPDR Unit";
  const entityLocation = state?.entityLocation || "";

  const [data, setData] = useState<PPDRRecord | null>(null);
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
        console.error("PPDRDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400">
                Public Protection & Disaster Relief
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
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">
                  Provider
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {data.useCaseProvider ?? "Coral Telecom Limited"}
                </p>
              </div>
              <div className="w-px h-8 bg-border mx-1" />
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">
                  Systems Deployed
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {data.system_deployed_count ?? "--"}
                </p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-red-500" />
            <p className="text-sm">Loading PPDR data…</p>
          </div>
        ) : !data ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">No data available.</p>
              <p className="text-xs mt-1">
                Data will appear once the system starts reporting.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Section 1: Infrastructure & Activities ── */}
            <div className="mb-8">
              <SectionDivider title="Infrastructure & Activities" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Systems Deployed"
                  value={data.system_deployed_count ?? "--"}
                  icon={Server}
                  borderColor="#6366f1"
                />
                <StatCard
                  label="Public Announcements"
                  value={data.announcement_count ?? "--"}
                  icon={Megaphone}
                  borderColor="#f59e0b"
                />
                <StatCard
                  label="SOS Triggers"
                  value={data.sos_trigger_count ?? "--"}
                  icon={Siren}
                  borderColor="#ef4444"
                />
                <StatCard
                  label="PTT Activations"
                  value={data.ptt_pressed_count ?? "--"}
                  icon={Radio}
                  borderColor="#0ea5e9"
                />
              </div>
            </div>

            {/* ── Section 2: Summary + Location ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">
                    System Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {[
                    {
                      label: "Systems Deployed",
                      val: String(data.system_deployed_count ?? "--"),
                      icon: Server,
                      color: "#6366f1",
                    },
                    {
                      label: "Announcements Made",
                      val: String(data.announcement_count ?? "--"),
                      icon: Megaphone,
                      color: "#f59e0b",
                    },
                    {
                      label: "SOS Triggers",
                      val: String(data.sos_trigger_count ?? "--"),
                      icon: Siren,
                      color: "#ef4444",
                    },
                    {
                      label: "PTT Activations",
                      val: String(data.ptt_pressed_count ?? "--"),
                      icon: Radio,
                      color: "#0ea5e9",
                    },
                  ].map(({ label, val, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 py-3 border-b border-red-100 dark:border-red-800 last:border-0"
                    >
                      <div
                        className="flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0"
                        style={{ background: `${color}22` }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                      <p className="text-sm font-bold tabular-nums text-foreground">
                        {val}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Location card */}
              <Card className="overflow-hidden border border-border shadow-sm lg:col-span-2">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Deployment Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.latitude && data.longitude ? (
                    <>
                      {/* Embedded Map */}
                      <div className="w-full h-[200px] relative">
                        <iframe
                          title="Deployment Location Map"
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
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse inline-block" />
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
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg px-3 py-1.5 transition-colors"
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

export default PPDRDetails;
