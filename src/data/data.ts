import { AccelData, GyroData } from "@/types/cattle";

export type TimeRange = '6h' | '12h' | '24h' | '7d' | '30d';

export interface AggregatedCowData {
  nodeId: string;
  status: string;
  lastSeen: string;
  avgTemp: number;
  avgBpm: number;
  avgActivity: number;
  temperatureHistory: Array<{ time: string; value: number }>;
  heartRateHistory: Array<{ time: string; value: number }>;
  activityHistory: Array<{ time: string; value: number }>;
}

export interface DetailRecord {
  accel: AccelData;
  gyro: GyroData;
  rssi: number;
  timestamp: number;
}

// Mock data - Replace with actual API calls as needed
const mockDetailRecords: DetailRecord[] = Array.from({ length: 100 }, (_, i) => ({
  accel: {
    x: Math.random() * 10,
    y: Math.random() * 10,
    z: Math.random() * 10,
  },
  gyro: {
    x: Math.random() * 360,
    y: Math.random() * 360,
    z: Math.random() * 360,
  },
  rssi: Math.floor(Math.random() * 50) - 100,
  timestamp: Date.now() - i * 60000,
}));

export function getAggregatedDataForCow(
  nodeId: string,
  timeRange: TimeRange
): AggregatedCowData {
  // Generate historical data based on time range
  const hoursBack = getHoursFromRange(timeRange);
  const historyData = generateHistoryData(hoursBack);

  return {
    nodeId,
    status: Math.random() > 0.1 ? "Active" : "Inactive",
    lastSeen: new Date(Date.now() - Math.random() * 3600000).toLocaleString(),
    avgTemp: 37 + Math.random() * 2,
    avgBpm: 60 + Math.random() * 40,
    avgActivity: Math.random() * 100,
    temperatureHistory: historyData.map((item) => ({
      ...item,
      value: 37 + Math.random() * 2,
    })),
    heartRateHistory: historyData.map((item) => ({
      ...item,
      value: 60 + Math.random() * 40,
    })),
    activityHistory: historyData.map((item) => ({
      ...item,
      value: Math.random() * 100,
    })),
  };
}

export function getPaginatedRecordsForCow(
  nodeId: string,
  page: number,
  pageSize: number
): { records: DetailRecord[]; total: number } {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const records = mockDetailRecords.slice(startIndex, endIndex);

  return {
    records,
    total: mockDetailRecords.length,
  };
}

function getHoursFromRange(timeRange: TimeRange): number {
  switch (timeRange) {
    case "6h":
      return 6;
    case "12h":
      return 12;
    case "24h":
      return 24;
    case "7d":
      return 7 * 24;
    case "30d":
      return 30 * 24;
    default:
      return 24;
  }
}

function generateHistoryData(
  hours: number
): Array<{ time: string; value: number }> {
  const data = [];
  const now = new Date();

  for (let i = hours; i > 0; i--) {
    const date = new Date(now.getTime() - i * 3600000);
    data.push({
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      value: 0, // Will be overwritten with actual values
    });
  }

  return data;
}
