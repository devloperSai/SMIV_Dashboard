import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Wifi,
  Users,
  Activity,
  Database,
  MapPin,
  Signal,
  TrendingUp,
  Router,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HotspotLocation {
  name?: string | null;
  latitude?: string;
  longitude?: string;
}

interface HotspotRecord {
  hotspot_id?: string;
  locations?: HotspotLocation[];
  overall_uptime?: string;
  network_uptime?: string;
  unique_user_count?: number;
  bandwidth_consumed?: number;
  hotspot_status?: string;
  data_usage_per_user?: number;
}

interface WifiResponse {
  useCaseId?: string;
  useCaseName?: string;
  useCaseProvider?: string;
  hotspot_count?: number;
  data?: HotspotRecord[];
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

// ─── Metric Row — master format icon style ────────────────────────────────────

const MetricRow = ({
  label,
  val,
  icon: Icon,
  color,
  isLast,
}: {
  label: string;
  val: string;
  icon: any;
  color: string;
  isLast: boolean;
}) => (
  <div
    className={`flex items-center gap-3 px-5 py-3.5 ${
      !isLast ? "border-b border-border/40" : ""
    }`}
  >
    {/* master format: small icon tinted with borderColor, no bg bubble */}
    <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} />
    <div className="text-xs text-muted-foreground uppercase font-semibold flex-1">
      {label}
    </div>
    <div className="text-sm font-bold text-green-600 tabular-nums">{val}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const WifiHotspotDetails = () => {
  const { hotspotId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || hotspotId;
  const entityName = state?.entityName || "Wi-Fi Hotspot";
  const entityLocation = state?.entityLocation || "";

  const [wifiData, setWifiData] = useState<WifiResponse | null>(null);
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
        setWifiData(res?.data || null);
      } catch (err) {
        console.error("WifiHotspotDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const hotspots: HotspotRecord[] = wifiData?.data || [];
  const hasData = hotspots.length > 0;

  const totalUsers = hotspots.reduce((s, h) => s + (h.unique_user_count ?? 0), 0);
  const totalBandwidth = hotspots.reduce((s, h) => s + (h.bandwidth_consumed ?? 0), 0);
  const onlineCount = hotspots.filter((h) => h.hotspot_status === "Online").length;
  const avgDataPerUser = totalUsers > 0 ? (totalBandwidth / totalUsers).toFixed(2) : "--";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="h-5 w-5 text-sky-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Wi-Fi Hotspots — Indio Networks
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
          {wifiData && (
            <div className="flex items-center gap-2.5 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
              <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                <Wifi className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Provider</p>
                <p className="text-sm font-semibold text-foreground">
                  {wifiData.useCaseProvider ?? "Indio Networks"}
                </p>
              </div>
              <div className="w-px h-8 bg-border mx-1" />
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Total Hotspots</p>
                <p className="text-sm font-semibold text-foreground">
                  {wifiData.hotspot_count ?? hotspots.length}
                </p>
              </div>
              <div className="w-px h-8 bg-border mx-1" />
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {onlineCount} Online
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-sky-500" />
            <p className="text-sm">Loading hotspot data…</p>
          </div>
        ) : !hasData ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Wifi className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">No hotspot data available.</p>
              <p className="text-xs mt-1">Data will appear once access points start reporting.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Section 1: Network Summary ── */}
            <div className="mb-8">
              <SectionDivider title="Network Summary" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Hotspots"
                  value={wifiData?.hotspot_count ?? hotspots.length}
                  icon={Router}
                  borderColor="#0ea5e9"
                />
                <StatCard
                  label="Online Now"
                  value={onlineCount}
                  icon={Signal}
                  borderColor="#10b981"
                />
                <StatCard
                  label="Total Users"
                  value={totalUsers}
                  icon={Users}
                  borderColor="#8b5cf6"
                />
                <StatCard
                  label="Bandwidth Used"
                  value={totalBandwidth.toFixed(1)}
                  unit="GB"
                  icon={Database}
                  borderColor="#f59e0b"
                />
              </div>
            </div>

            {/* ── Section 2: Access Points + Network Summary ── */}
            <div className="mb-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">

                {/* LEFT: Access Points */}
                <div className="flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <Router className="h-4 w-4 text-sky-500" />
                    <h2 className="text-sm font-semibold text-foreground tracking-wide">
                      Access Points
                    </h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden h-full">
                    {hotspots.map((h, idx) => {
                      const isOnline = h.hotspot_status === "Online";
                      const loc = h.locations?.[0];
                      const metrics = [
                        { label: "Overall Uptime",  val: h.overall_uptime ?? "--",              icon: Activity,   color: "#10b981" },
                        { label: "Network Uptime",  val: h.network_uptime ?? "--",              icon: Signal,     color: "#0ea5e9" },
                        { label: "Users",           val: String(h.unique_user_count ?? "--"),   icon: Users,      color: "#8b5cf6" },
                        { label: "Bandwidth",       val: `${h.bandwidth_consumed ?? "--"} GB`,  icon: Database,   color: "#f59e0b" },
                        { label: "Avg Data / User", val: `${h.data_usage_per_user ?? "--"} GB`, icon: TrendingUp, color: "#6366f1" },
                      ];

                      return (
                        <div
                          key={h.hotspot_id ?? idx}
                          className={idx !== hotspots.length - 1 ? "border-b border-border/50" : ""}
                        >
                          {/* AP Header */}
                          <div className="flex items-center justify-between px-5 py-4 bg-muted/20">
                            <div className="flex items-center gap-2">
                              <Router className="h-4 w-4" style={{ color: "#0ea5e9" }} />
                              <div>
                                <p className="text-sm font-bold text-foreground">
                                  {h.hotspot_id ?? `AP-${idx + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase font-semibold">
                                  Access Point Node
                                </p>
                              </div>
                            </div>
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                isOnline
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                                }`}
                              />
                              {h.hotspot_status ?? "Unknown"}
                            </div>
                          </div>

                          {/* Metric Rows — master format */}
                          {metrics.map((m, i) => (
                            <MetricRow
                              key={m.label}
                              label={m.label}
                              val={m.val}
                              icon={m.icon}
                              color={m.color}
                              isLast={i === metrics.length - 1 && !loc?.latitude}
                            />
                          ))}

                          {/* Footer */}
                          {loc?.latitude && loc?.longitude && (
                            <div className="flex items-center gap-2 px-5 py-3 border-t border-border/40 bg-muted/10">
                              <MapPin className="h-3.5 w-3.5 text-sky-500" />
                              <a
                                href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                              >
                                {loc.name ?? "View Location"}
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT: Network Summary */}
                <div className="flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <Activity className="h-4 w-4 text-sky-500" />
                    <h2 className="text-sm font-semibold text-foreground tracking-wide">
                      Network Summary
                    </h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden h-full">
                    {[
                      { label: "Provider",        val: wifiData?.useCaseProvider ?? "Indio Networks",      icon: Wifi,       color: "#0ea5e9" },
                      { label: "Total Hotspots",  val: String(wifiData?.hotspot_count ?? hotspots.length), icon: Router,     color: "#6366f1" },
                      { label: "Online",          val: `${onlineCount} / ${hotspots.length}`,              icon: Signal,     color: "#10b981" },
                      { label: "Total Users",     val: String(totalUsers),                                 icon: Users,      color: "#8b5cf6" },
                      { label: "Total Bandwidth", val: `${totalBandwidth.toFixed(1)} GB`,                  icon: Database,   color: "#f59e0b" },
                      { label: "Avg Data / User", val: `${avgDataPerUser} GB`,                             icon: TrendingUp, color: "#f97316" },
                    ].map(({ label, val, icon, color }, i, arr) => (
                      <MetricRow
                        key={label}
                        label={label}
                        val={val}
                        icon={icon}
                        color={color}
                        isLast={i === arr.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 3: Uptime Overview ── */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" style={{ color: "#10b981" }} />
                  <span>Uptime Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {hotspots.map((h, idx) => {
                    const overallNum = parseFloat(h.overall_uptime ?? "0");
                    const networkNum = parseFloat(h.network_uptime ?? "0");

                    return (
                      <div key={h.hotspot_id ?? idx}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Router className="h-4 w-4" style={{ color: "#0ea5e9" }} />
                            <span className="text-xs text-muted-foreground uppercase font-semibold">
                              {h.hotspot_id ?? `AP-${idx + 1}`}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Overall {h.overall_uptime} · Network {h.network_uptime}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Signal className="h-3.5 w-3.5" style={{ color: "#0ea5e9" }} />
                              <div className="flex justify-between flex-1 text-xs text-muted-foreground">
                                <span className="uppercase font-semibold">Overall Uptime</span>
                                <span className="font-bold text-green-600">{h.overall_uptime}</span>
                              </div>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(overallNum, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Activity className="h-3.5 w-3.5" style={{ color: "#10b981" }} />
                              <div className="flex justify-between flex-1 text-xs text-muted-foreground">
                                <span className="uppercase font-semibold">Network Uptime</span>
                                <span className="font-bold text-green-600">{h.network_uptime}</span>
                              </div>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(networkNum, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default WifiHotspotDetails;