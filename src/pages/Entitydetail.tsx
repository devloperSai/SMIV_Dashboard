import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;
type FilterType = "today" | "week" | "month";
const LINE_COLORS = ["#0ea5e9", "#f59e0b", "#22c55e", "#ec4899", "#8b5cf6"];
const SKIP_KEYS = ["sensor_locations", "light_id", "pond_id"];
const DATE_KEYS = ["timestamp", "record_date", "time", "date"];

// Converts string numbers like "41.6°C" to actual numbers for Recharts
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

const EntityDetail = () => {
  const { state } = useLocation();
  const params = useParams();

  // entityId from router state (primary) or URL params (fallback)
  const entityId =
    state?.entityId ||
    params?.id ||
    params?.farmId ||
    params?.pondId ||
    params?.binId ||
    params?.siteId ||
    params?.villageId;

  const entityName = state?.entityName || "Entity Details";
  const entityLocation = state?.entityLocation || "";
  const useCaseName = state?.useCaseName || "";

  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);

  const [graphData, setGraphData] = useState<any[]>([]);
  const [graphLoading, setGraphLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("week");

  // Fetch history once on load
  useEffect(() => {
    const fetchHistory = async () => {
      if (!entityId) {
        setHistoryError(true);
        setHistoryLoading(false);
        return;
      }
      setHistoryLoading(true);
      try {
        const response = await apiClient.get<any>(
          API_URLS.GET_KPI_HISTORY(entityId),
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY }
        );
        setHistoryData(response?.data || null);
      } catch (err) {
        console.error("History fetch failed:", err);
        setHistoryError(true);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [entityId]);

  // Fetch graph data on load and filter change
  useEffect(() => {
    const fetchGraphData = async () => {
      if (!entityId) return;
      setGraphLoading(true);
      try {
        const response = await apiClient.get<any>(
          `${API_URLS.GET_GRAPHICAL_DATA(entityId)}?filter=${activeFilter}`,
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY }
        );

        const rawGraphData = Array.isArray(response?.data) ? response.data : [];

        // Clean graph data - convert string numbers like "41.6°C" to actual numbers
        const cleanedGraphData = rawGraphData.map((chartGroup: any) => ({
          ...chartGroup,
          data: chartGroup.data?.map((point: any) => {
            const cleanPoint: any = { x: point.x };
            chartGroup.legends?.forEach((legend: any) => {
              cleanPoint[legend.key] = toNumber(point[legend.key]);
            });
            return cleanPoint;
          }) || [],
        }));

        setGraphData(cleanedGraphData);

      } catch (err) {
        console.error("Graph fetch failed:", err);
        setGraphData([]);
      } finally {
        setGraphLoading(false);
      }
    };
    fetchGraphData();
  }, [entityId, activeFilter]);

  // Get records array from history
  const getRecords = (): any[] => {
    if (!historyData) return [];
    if (Array.isArray(historyData.data)) return historyData.data;
    if (Array.isArray(historyData.data_list)) return historyData.data_list;
    return [];
  };

  // Get numeric stat fields from top level of history data
  const getStatFields = (): [string, any][] => {
    if (!historyData) return [];
    return Object.entries(historyData).filter(
      ([key, val]) =>
        typeof val === "number" &&
        !key.toLowerCase().includes("id") &&
        key !== "code"
    );
  };

  const records = getRecords();
  const statFields = getStatFields();

  // Check if graph data has actual non-null values to display
  const hasGraphData = graphData.some(
    (g: any) =>
      g.legends?.length > 0 &&
      g.data?.length > 0 &&
      g.data.some((point: any) =>
        g.legends.some((l: any) => point[l.key] !== null)
      )
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{entityName}</h1>
          <div className="flex flex-wrap gap-4 mt-1">
            {useCaseName && (
              <p className="text-sm text-muted-foreground">
                Use Case: {useCaseName}
              </p>
            )}
            {entityLocation && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {entityLocation}
              </p>
            )}
          </div>
        </div>

        {/* History Section */}
        {historyLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
          </div>
        ) : historyError ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Could not load KPI history data.
          </div>
        ) : historyData ? (
          <div className="mb-8">

            {/* Top level numeric stat cards */}
            {statFields.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statFields.map(([key, val]: [string, any]) => (
                  <Card key={key} className="p-4 text-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold">
                      {key.replace(/_/g, " ")}
                    </div>
                    <div className="text-2xl font-bold text-primary mt-1">{val}</div>
                  </Card>
                ))}
              </div>
            )}

            {/* Records Table */}
            {records.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>KPI Records ({records.length} entries)</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(records[0])
                          .filter((k) => !SKIP_KEYS.includes(k))
                          .map((key) => (
                            <TableHead
                              key={key}
                              className="font-semibold capitalize pl-6 whitespace-nowrap"
                            >
                              {key.replace(/_/g, " ")}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record: any, i: number) => (
                        <TableRow key={i}>
                          {Object.entries(record)
                            .filter(([k]) => !SKIP_KEYS.includes(k))
                            .map(([key, val]: [string, any]) => (
                              <TableCell
                                key={key}
                                className="pl-6 font-mono text-sm whitespace-nowrap"
                              >
                                {DATE_KEYS.includes(key)
                                  ? new Date(val).toLocaleString()
                                  : typeof val === "number"
                                  ? parseFloat(val.toFixed(2))
                                  : String(val ?? "--")}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Graph Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Trend Analysis</CardTitle>
              <div className="flex gap-2">
                {(["today", "week", "month"] as FilterType[]).map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={activeFilter === filter ? "default" : "outline"}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter === "today"
                      ? "Today"
                      : filter === "week"
                      ? "This Week"
                      : "This Month"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {graphLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
              </div>
            ) : !hasGraphData ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium">No graphical data available for this period.</p>
                <p className="text-xs mt-1">
                  Aggregated graph data has not been recorded for this entity yet.
                </p>
              </div>
            ) : (
              graphData.map((chartGroup: any, groupIndex: number) => (
                <div key={groupIndex} className="mb-8">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartGroup.data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="x"
                          tickFormatter={(val) =>
                            new Date(val).toLocaleDateString()
                          }
                          fontSize={11}
                        />
                        <YAxis fontSize={11} />
                        <Tooltip
                          labelFormatter={(val) =>
                            new Date(val).toLocaleString()
                          }
                        />
                        <Legend />
                        {chartGroup.legends?.map((legend: any, i: number) => (
                          <Line
                            key={legend.key}
                            type="monotone"
                            dataKey={legend.key}
                            name={legend.label}
                            stroke={LINE_COLORS[i % LINE_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default EntityDetail;