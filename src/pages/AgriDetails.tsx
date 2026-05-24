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
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Sprout,
  MapPin,
  Droplets,
  Thermometer,
  FlaskConical,
  Leaf,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";

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

const getLatestValue = (points: any[], key: string): number | null => {
  for (const point of points) {
    const val = toNumber(point[key]);
    if (val !== null) return val;
  }
  return null;
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

const chartTooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AgriDetails = () => {
  const { farmId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || farmId;
  const entityName = state?.entityName || "Farm Analytics";
  const entityLocation = state?.entityLocation || "";

  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const graphRes = await apiClient.get<any>(
          `${API_URLS.GET_GRAPHICAL_DATA(entityId)}?filter=week`,
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY },
        );
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
        console.error("AgriDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  const chartPoints = graphData[0]?.data || [];

  const nitrogen = getLatestValue(chartPoints, "y3");
  const phosphorus = getLatestValue(chartPoints, "y5");
  const potassium = getLatestValue(chartPoints, "y4");
  const moisture = getLatestValue(chartPoints, "y2");

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sprout className="h-5 w-5 text-green-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-400">
                Smart Agriculture
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Farm Analytics
            </h1>
            <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              {entityLocation && <MapPin className="h-3.5 w-3.5" />}
              {entityName}
              {entityLocation ? ` · ${entityLocation}` : ""}
            </p>
          </div>

          {/* Status legend pill */}
          <div className="flex items-center gap-4 bg-muted/60 border border-border rounded-xl px-4 py-2.5 self-start">
            {[
              { label: "Healthy", color: "bg-green-500" },
              { label: "Moderate", color: "bg-orange-400" },
              { label: "Critical", color: "bg-red-500" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className={`relative flex h-2.5 w-2.5 rounded-full ${color}`}
                >
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`}
                  />
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-green-500" />
            <p className="text-sm">Loading farm data…</p>
          </div>
        ) : (
          <>
            {/* ── Section 1: Latest Readings ── */}
            <div className="mb-8">
              <SectionDivider title="Latest Readings" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Nitrogen (N)"
                  value={nitrogen}
                  unit="mg/kg"
                  icon={Leaf}
                  borderColor="#22c55e"
                />
                <StatCard
                  label="Phosphorus (P)"
                  value={phosphorus}
                  unit="mg/kg"
                  icon={FlaskConical}
                  borderColor="#eab308"
                />
                <StatCard
                  label="Potassium (K)"
                  value={potassium}
                  unit="mg/kg"
                  icon={FlaskConical}
                  borderColor="#ec4899"
                />
                <StatCard
                  label="Soil Moisture"
                  value={moisture}
                  unit="%"
                  icon={Droplets}
                  borderColor="#0ea5e9"
                />
              </div>
            </div>

            {/* ── Section 2: Charts ── */}
            <div className="mb-8">
              <SectionDivider title="Weekly Trends" />
              <Tabs defaultValue="sensors" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="sensors">
                    Soil &amp; Environment
                  </TabsTrigger>
                  <TabsTrigger value="npk">NPK Levels</TabsTrigger>
                </TabsList>

                {/* ── Tab 1: Soil & Environment ── */}
                <TabsContent value="sensors" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Soil Moisture */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Droplets
                            className="h-4 w-4"
                            style={{ color: "#0ea5e9" }}
                          />
                          Soil Moisture (%)
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Weekly soil humidity trend
                        </p>
                      </CardHeader>
                      <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={chartPoints}
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
                              labelFormatter={(t) =>
                                new Date(t).toLocaleString()
                              }
                            />
                            <Area
                              type="monotone"
                              dataKey="y2"
                              name="Soil Moisture"
                              stroke="#0ea5e9"
                              fill="#0ea5e9"
                              fillOpacity={0.08}
                              strokeWidth={2}
                              connectNulls={false}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Temperature */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Thermometer
                            className="h-4 w-4"
                            style={{ color: "#f59e0b" }}
                          />
                          Temperature (°C)
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Weekly average temperature trend
                        </p>
                      </CardHeader>
                      <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartPoints}
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
                              labelFormatter={(t) =>
                                new Date(t).toLocaleString()
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="y6"
                              name="Avg Temp"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              dot={false}
                              connectNulls={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* ── Tab 2: NPK Levels ── */}
                <TabsContent value="npk">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Sprout
                          className="h-4 w-4"
                          style={{ color: "#22c55e" }}
                        />
                        Soil Nutrients (mg/kg)
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Weekly nitrogen, phosphorus and potassium levels
                      </p>
                    </CardHeader>
                    <CardContent className="h-[380px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartPoints}
                          margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
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
                          <Line
                            type="step"
                            dataKey="y3"
                            name="Nitrogen (N)"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                          />
                          <Line
                            type="step"
                            dataKey="y5"
                            name="Phosphorus (P)"
                            stroke="#eab308"
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                          />
                          <Line
                            type="step"
                            dataKey="y4"
                            name="Potassium (K)"
                            stroke="#ec4899"
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgriDetails;
