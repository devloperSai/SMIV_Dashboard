import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Loader2, Trash2, Thermometer,
  Wind, AlertTriangle, Activity
} from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";

// Determine fill status from depth value
// Lower depth = more full (sensor measures distance from top)
const getFillStatus = (depth: number): { label: string; color: string; bg: string } => {
  if (depth <= 10) return { label: "Full", color: "text-red-600", bg: "bg-red-100 text-red-700 border-red-200" };
  if (depth <= 25) return { label: "High", color: "text-orange-600", bg: "bg-orange-100 text-orange-700 border-orange-200" };
  if (depth <= 40) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  return { label: "Normal", color: "text-green-600", bg: "bg-green-100 text-green-700 border-green-200" };
};

// Stat card with icon - same style as water management
const StatCard = ({
  title, value, unit, icon: Icon, colorClass, borderColor
}: {
  title: string; value: any; unit: string;
  icon: any; colorClass: string; borderColor: string;
}) => {
  if (value === null || value === undefined) return null;
  return (
    <Card className={`border-l-4`} style={{ borderLeftColor: borderColor }}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <div className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${borderColor}15` }}>
            <Icon className={`h-4 w-4 ${colorClass}`} />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-black text-foreground">{value}</p>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const WasteDetails = () => {
  const { binId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || binId;
  const entityName = state?.entityName || "Waste Bin";
  const entityLocation = state?.entityLocation || "";

  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const response = await apiClient.get<any>(
          API_URLS.GET_KPI_HISTORY(entityId),
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY }
        );
        setHistoryData(response?.data || null);
      } catch (err) {
        console.error("WasteDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  // Records from history API
  // Expected fields: bin_id/dustbin_id, depth/fill_level, temperature, gas_level, timestamp
  const records: any[] = Array.isArray(historyData?.data)
    ? historyData.data
    : [];

  const latest = records[0] || null;
  const hasData = records.length > 0;

  // Stat values from latest record
  const currentDepth = latest?.depth ?? latest?.fill_level ?? latest?.current_depth ?? null;
  const temperature = latest?.temperature ?? latest?.temp ?? null;
  const gasLevel = latest?.gas_level ?? latest?.gas ?? null;
  const fillStatus = currentDepth !== null ? getFillStatus(currentDepth) : null;

  // Chart data - depth over time (reversed Y - lower = more full)
  const chartData = [...records].reverse().map((r: any) => ({
    timestamp: r.timestamp || r.record_date,
    depth: r.depth ?? r.fill_level ?? r.current_depth,
    temperature: r.temperature ?? r.temp,
    gas_level: r.gas_level ?? r.gas,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Waste-bin Analytics</h1>
            <p className="text-muted-foreground">
              {entityName}{entityLocation ? ` · ${entityLocation}` : ""}
            </p>
          </div>
          {latest?.timestamp && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</p>
              <p className="text-sm font-semibold">
                {new Date(latest.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : !hasData ? (
          // No data state - backend hasn't pushed telemetry yet
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Trash2 className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-semibold">No telemetry data available yet</p>
            <p className="text-sm mt-1 text-center max-w-sm">
              Waste bin sensor data will appear here once the backend starts pushing records for this bin.
            </p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Current Depth"
                value={currentDepth}
                unit="cm"
                icon={Trash2}
                colorClass="text-emerald-600"
                borderColor="#10b981"
              />
              <StatCard
                title="Temperature"
                value={temperature}
                unit="°C"
                icon={Thermometer}
                colorClass="text-orange-500"
                borderColor="#f59e0b"
              />
              <StatCard
                title="Gas Level"
                value={gasLevel}
                unit="ppm"
                icon={Wind}
                colorClass="text-purple-500"
                borderColor="#8b5cf6"
              />
              {/* Fill status card */}
              {fillStatus && (
                <Card className="border-l-4" style={{ borderLeftColor: "#ef4444" }}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Fill Status
                      </p>
                      <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    <p className={`text-2xl font-black ${fillStatus.color}`}>
                      {fillStatus.label}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Fill Level History Chart - same as old design (area chart, reversed Y) */}
            {chartData.some((d) => d.depth !== undefined && d.depth !== null) && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Fill Level History</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(t) => new Date(t).toLocaleDateString()}
                        fontSize={10}
                      />
                      {/* Reversed Y axis - lower depth = more full */}
                      <YAxis fontSize={10} reversed domain={[0, "auto"]} />
                      <Tooltip
                        labelFormatter={(t) => new Date(t).toLocaleString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="depth"
                        stroke="#10b981"
                        fill="url(#colorDepth)"
                        name="Depth (cm)"
                        connectNulls={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Records Table */}
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="bg-white border-b border-border px-6 py-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Bin Records
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({records.length} entries)
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="pl-6 font-semibold text-foreground whitespace-nowrap">Timestamp</TableHead>
                      <TableHead className="font-semibold text-foreground">Bin ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Depth (cm)</TableHead>
                      <TableHead className="font-semibold text-foreground">Temp (°C)</TableHead>
                      <TableHead className="font-semibold text-foreground">Gas (ppm)</TableHead>
                      <TableHead className="font-semibold text-foreground pr-6">Fill Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record: any, i: number) => {
                      const depth = record.depth ?? record.fill_level ?? record.current_depth;
                      const status = depth !== null && depth !== undefined
                        ? getFillStatus(depth) : null;
                      return (
                        <TableRow
                          key={i}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                        >
                          <TableCell className="pl-6 text-xs text-muted-foreground font-mono whitespace-nowrap">
                            {record.timestamp || record.record_date
                              ? new Date(record.timestamp || record.record_date).toLocaleString()
                              : "--"}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-primary text-sm">
                            {record.bin_id || record.dustbin_id || "--"}
                          </TableCell>
                          <TableCell className="font-mono font-semibold">
                            {depth ?? "--"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {record.temperature ?? record.temp ?? "--"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {record.gas_level ?? record.gas ?? "--"}
                          </TableCell>
                          <TableCell className="pr-6">
                            {status ? (
                              <Badge className={`border ${status.bg} text-xs`}>
                                {status.label}
                              </Badge>
                            ) : "--"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default WasteDetails;