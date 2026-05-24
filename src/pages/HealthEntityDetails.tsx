import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, Activity, CheckCircle, Clock, Wifi } from "lucide-react";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";

// Confirmed fields from API response:
// female_patients, male_patients, patient_footfall,
// status, system_downtime, tests_completed, total_tests_offered

// Stat card component
const StatCard = ({
  title, value, unit, icon: Icon, colorClass, borderColor
}: {
  title: string; value: any; unit?: string;
  icon: any; colorClass: string; borderColor: string;
}) => {
  if (value === null || value === undefined) return null;
  return (
    <Card className="border-l-4" style={{ borderLeftColor: borderColor }}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <div className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${borderColor}18` }}>
            <Icon className={`h-4 w-4 ${colorClass}`} />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-black text-foreground">{value}</p>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

const HealthEntityDetails = () => {
  const { entityId: entityIdParam } = useParams();
  const { state } = useLocation();

  const entityId = state?.entityId || entityIdParam;
  const entityName = state?.entityName || "Healthcare";

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
        console.error("HealthEntityDetails fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId]);

  // All fields confirmed from console log - all at top level of historyData
  const malePatients = historyData?.male_patients;
  const femalePatients = historyData?.female_patients;
  const patientFootfall = historyData?.patient_footfall;
  const testsCompleted = historyData?.tests_completed;
  const totalTestsOffered = historyData?.total_tests_offered;
  const systemDowntime = historyData?.system_downtime;
  const status = historyData?.status;

  // Total patients derived from male + female
  const totalPatients =
    malePatients !== null && malePatients !== undefined &&
    femalePatients !== null && femalePatients !== undefined
      ? malePatients + femalePatients
      : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Engineering Healthcare Analytics</h1>
          <p className="text-muted-foreground mt-1">{entityName}</p>
          {status && (
            <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-1 rounded-full
              ${status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              {status}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <>
            {/* Row 1 - Patient Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard
                title="Total Patients"
                value={totalPatients}
                icon={Users}
                colorClass="text-blue-600"
                borderColor="#3b82f6"
              />
              <StatCard
                title="Male Patients"
                value={malePatients}
                icon={Users}
                colorClass="text-sky-500"
                borderColor="#0ea5e9"
              />
              <StatCard
                title="Female Patients"
                value={femalePatients}
                icon={Users}
                colorClass="text-pink-500"
                borderColor="#ec4899"
              />
              <StatCard
                title="Patient Footfall"
                value={patientFootfall}
                icon={Activity}
                colorClass="text-purple-500"
                borderColor="#8b5cf6"
              />
            </div>

            {/* Row 2 - Test Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard
                title="Tests Completed"
                value={testsCompleted}
                icon={CheckCircle}
                colorClass="text-green-600"
                borderColor="#22c55e"
              />
              <StatCard
                title="Total Tests Offered"
                value={totalTestsOffered}
                icon={Activity}
                colorClass="text-orange-500"
                borderColor="#f59e0b"
              />
              <StatCard
                title="System Downtime"
                value={systemDowntime}
                unit="hrs"
                icon={Clock}
                colorClass="text-red-500"
                borderColor="#ef4444"
              />
            </div>

            {/* No data message if all zeros */}
            {totalPatients === 0 && testsCompleted === 0 && patientFootfall === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                All values are currently zero. Data will populate as healthcare records are updated.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HealthEntityDetails;