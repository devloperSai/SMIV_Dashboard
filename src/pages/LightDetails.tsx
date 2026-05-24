import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Lightbulb, LightbulbOff, Battery, Activity, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";

const getBatteryColor = (val: number) => "text-orange-500";

const getBatteryWidth = (val: number) => {
  const pct = Math.min(100, Math.max(0, ((val - 11) / 4) * 100));
  return `${pct}%`;
};

const getBatteryBarColor = (val: number) => "bg-orange-400";

const LightDetails = () => {
  const { villageId } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || villageId;
  const entityName = state?.entityName || "Smart Lights";
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
        console.error("LightDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  const records: any[] = Array.isArray(historyData?.data) ? historyData.data : [];

  const totalRecords = records.length;
  const onCount = records.filter((r) => r.status === "ON").length;
  const offCount = records.filter((r) => r.status === "OFF").length;
  const autoCount = records.filter((r) => r.mode === "AUTO").length;
  const avgBattery =
    records.length > 0
      ? (records.reduce((sum, r) => sum + (r.battery || 0), 0) / records.length).toFixed(2)
      : "--";
  const latestRecord = records[0] || null;
  const lastUpdated = latestRecord?.timestamp
    ? new Date(latestRecord.timestamp).toLocaleString()
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 pb-8 px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Smart Light Report</h1>
            <p className="text-muted-foreground mt-1">
              {entityName}{entityLocation ? ` · ${entityLocation}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</p>
            <p className="text-sm font-semibold text-foreground">{lastUpdated}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <>
            {/* ── Summary Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

              {/* Lights ON */}
              <Card className="p-4 border-l-4" style={{ borderLeftColor: "#22c55e" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4" style={{ color: "#22c55e" }} />
                  <div className="text-xs text-muted-foreground uppercase font-semibold">
                    Lights ON
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {onCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    of {totalRecords}
                  </span>
                </div>
              </Card>

              {/* Lights OFF */}
              <Card className="p-4 border-l-4" style={{ borderLeftColor: "#9ca3af" }}>
                <div className="flex items-center gap-2 mb-2">
                  <LightbulbOff className="h-4 w-4" style={{ color: "#9ca3af" }} />
                  <div className="text-xs text-muted-foreground uppercase font-semibold">
                    Lights OFF
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-500">
                  {offCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    of {totalRecords}
                  </span>
                </div>
              </Card>

              {/* Auto Mode */}
              <Card className="p-4 border-l-4" style={{ borderLeftColor: "#0ea5e9" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" style={{ color: "#0ea5e9" }} />
                  <div className="text-xs text-muted-foreground uppercase font-semibold">
                    Auto Mode
                  </div>
                </div>
                <div className="text-2xl font-bold text-sky-500">
                  {autoCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    of {totalRecords}
                  </span>
                </div>
              </Card>

              {/* Avg Battery */}
              <Card className="p-4 border-l-4" style={{ borderLeftColor: "#f97316" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Battery className="h-4 w-4" style={{ color: "#f97316" }} />
                  <div className="text-xs text-muted-foreground uppercase font-semibold">
                    Avg Battery
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-500">
                  {avgBattery}
                  <span className="text-sm font-normal text-muted-foreground ml-1">V</span>
                </div>
              </Card>

            </div>

            {/* Enhanced Table */}
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="bg-white border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Light Records
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({totalRecords} entries)
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="pl-6 font-semibold text-foreground w-[180px]">
                        Timestamp
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">Light ID</TableHead>
                      <TableHead className="font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-foreground">Mode</TableHead>
                      <TableHead className="font-semibold text-foreground">Battery (V)</TableHead>
                      <TableHead className="font-semibold text-foreground pr-6">Battery Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No light records available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      records.map((record: any, i: number) => (
                        <TableRow
                          key={i}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                        >
                          <TableCell className="pl-6 text-xs text-muted-foreground font-mono whitespace-nowrap">
                            {record.timestamp
                              ? new Date(record.timestamp).toLocaleString()
                              : "--"}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-primary text-sm">
                            {record.light_id || "--"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                record.status === "ON"
                                  ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-100"
                              }
                            >
                              {record.status === "ON" ? (
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                  ON
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                                  OFF
                                </span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                              {record.mode || "--"}
                            </span>
                          </TableCell>
                          <TableCell
                            className={`font-mono font-bold text-sm ${getBatteryColor(record.battery)}`}
                          >
                            {record.battery ? record.battery.toFixed(2) : "--"}
                          </TableCell>
                          <TableCell className="pr-6">
                            {record.battery ? (
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${getBatteryBarColor(record.battery)}`}
                                    style={{ width: getBatteryWidth(record.battery) }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(((record.battery - 11) / 4) * 100)}%
                                </span>
                              </div>
                            ) : "--"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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

export default LightDetails;