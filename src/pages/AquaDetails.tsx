import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;

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

// Stat card with colored left border - same as old design
const StatCard = ({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: any;
  unit: string;
  color: string;
}) => (
  <Card className="p-4 border-l-4" style={{ borderLeftColor: color }}>
    <div className="text-xs text-muted-foreground uppercase font-bold">
      {label}
    </div>
    <div className="text-2xl font-bold mt-1 text-green-600">
      {value ?? "--"}{" "}
      <span className="text-sm font-normal text-muted-foreground">{unit}</span>
    </div>
  </Card>
);

const AquaDetails = () => {
  const { pondId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || pondId;
  const entityName = state?.entityName || "Smart Pond";
  const entityLocation = state?.entityLocation || "";

  const [historyData, setHistoryData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const [historyRes, graphRes] = await Promise.all([
          apiClient.get<any>(
            API_URLS.GET_KPI_HISTORY(entityId),
            ROOTS.SMIV_PLATFORM,
            { "x-api-key": SMIV_API_KEY }
          ),
          apiClient.get<any>(
            `${API_URLS.GET_GRAPHICAL_DATA(entityId)}?filter=week`,
            ROOTS.SMIV_PLATFORM,
            { "x-api-key": SMIV_API_KEY }
          ),
        ]);

        setHistoryData(historyRes?.data || null);

        const rawGraph = Array.isArray(graphRes?.data) ? graphRes.data : [];
        const cleaned = rawGraph.map((group: any) => ({
          ...group,
          data: group.data?.map((point: any) => {
            const p: any = { x: point.x };
            group.legends?.forEach((l: any) => {
              p[l.key] = toNumber(point[l.key]);
            });
            return p;
          }) || [],
        }));
        setGraphData(cleaned);
      } catch (err) {
        console.error("AquaDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  // Latest record from history for stat cards
  // History shape: { data: [{pond_id, record_date, avg_temp, avg_oxy, avg_aerator_hour}] }
  const records: any[] = Array.isArray(historyData?.data)
    ? historyData.data
    : [];
  const latest = records[0] || null;

  // Last updated from latest record
  const lastUpdated = latest?.record_date
    ? new Date(latest.record_date).toLocaleString()
    : "N/A";

  // Graph data - legends: y1=Avg Oxy, y2=Avg Aerator Hour (from API doc)
  const chartPoints = graphData[0]?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">

        {/* Header - same layout as old design */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Pond Analytics</h1>
            <p className="text-muted-foreground">
              {entityName}
              {entityLocation ? ` · ${entityLocation}` : ""}
            </p>
          </div>
          {/* Last Updated - top right as in old design */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="text-sm font-medium">{lastUpdated}</p>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-6 mb-6 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-3 w-3 rounded-full bg-green-500">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-[ping_0.5s_infinite]"></span>
            </span>
            Healthy
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-3 w-3 rounded-full bg-orange-400">
              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-[ping_0.5s_infinite]"></span>
            </span>
            Moderate
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-3 w-3 rounded-full bg-red-500">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-[ping_0.5s_infinite]"></span>
            </span>
            Critical
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <>
            {/* Stat Cards
                Old had: Dissolved Oxygen, Water Temp, Air Temp, Air Humidity
                New API has: avg_oxy, avg_temp, avg_aerator_hour
                - Air Temp → removed (no separate field in new API)
                - Air Humidity → removed (no data in new API)
                - Avg Aerator Hour → added (new field available)
            */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                label="Dissolved Oxygen"
                value={latest?.avg_oxy}
                unit="mg/L"
                color="#0ea5e9"
              />
              <StatCard
                label="Avg Temp"
                value={latest?.avg_temp}
                unit="°C"
                color="#f59e0b"
              />
              <StatCard
                label="Avg Aerator Hour"
                value={latest?.avg_aerator_hour}
                unit="hrs"
                color="#8b5cf6"
              />
            </div>

            {/* Tabs - kept Sensor Trends, removed Control Logs (no event data in new API) */}
            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="trends">Sensor Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Oxygen Levels - Area Chart with gradient (same as old) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">
                        Oxygen Levels (Water)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartPoints}>
                          <defs>
                            <linearGradient id="colorOxy" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis
                            dataKey="x"
                            tickFormatter={(t) => new Date(t).toLocaleDateString()}
                            fontSize={10}
                          />
                          <YAxis fontSize={10} domain={["auto", "auto"]} />
                          <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
                          {/* y1 = Avg Oxy */}
                          <Area
                            type="monotone"
                            dataKey="y1"
                            name="Dissolved Oxygen"
                            stroke="#0ea5e9"
                            fillOpacity={1}
                            fill="url(#colorOxy)"
                            connectNulls={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Aerator Hours - Line Chart
                      Old had water_temp + air_temp two lines.
                      New API has avg_aerator_hour (y2) - shown as single line
                      (no separate water/air temp in new pond API)
                  */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">
                        Aerator Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartPoints}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis
                            dataKey="x"
                            tickFormatter={(t) => new Date(t).toLocaleDateString()}
                            fontSize={10}
                          />
                          <YAxis fontSize={10} domain={["auto", "auto"]} />
                          <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
                          <Legend iconType="circle" />
                          {/* y2 = Avg Aerator Hour */}
                          <Line
                            type="monotone"
                            dataKey="y2"
                            name="Aerator Hours"
                            stroke="#8b5cf6"
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
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default AquaDetails;