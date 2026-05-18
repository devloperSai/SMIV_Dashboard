import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import apiClient from "../api/apiClient";
import { ROOTS, API_URLS } from "../api/apiUrls";

const SMIV_API_KEY = import.meta.env.VITE_SMIV_API_KEY;
const SATNAVARI_VILLAGE_ID = import.meta.env.VITE_SATNAVARI_VILLAGE_ID;

interface EntityListProps {
  title: string;
  subtitle: string;
  useCaseName: string;
  detailRoute: string;
  cardLabel?: string; // optional label shown above entity name in card e.g. "COW ID"
}

const EntityList = ({
  title,
  subtitle,
  useCaseName,
  detailRoute,
  cardLabel,
}: EntityListProps) => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<any[]>([]);
  const [pageTitle, setPageTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      setError(false);

      try {
        // Step 1: Get assignmentId from localStorage
        let assignmentId: string | null = null;

        const stored = localStorage.getItem("smiv_use_cases");
        if (stored) {
          const useCases: any[] = JSON.parse(stored);
          const matched = useCases.find(
            (uc) =>
              uc.useCaseName?.trim().toLowerCase() ===
              useCaseName?.trim().toLowerCase(),
          );
          assignmentId = matched?.assignmentId || null;
        }

        // Step 2: Fallback - fetch fresh if localStorage missing
        if (!assignmentId) {
          const useCaseResponse = await apiClient.get<any>(
            API_URLS.GET_USE_CASES_FOR_VILLAGE(SATNAVARI_VILLAGE_ID),
            ROOTS.SMIV_PLATFORM,
            { "x-api-key": SMIV_API_KEY },
          );
          const freshUseCases: any[] = useCaseResponse?.data || [];
          localStorage.setItem("smiv_use_cases", JSON.stringify(freshUseCases));

          const matched = freshUseCases.find(
            (uc) =>
              uc.useCaseName?.trim().toLowerCase() ===
              useCaseName?.trim().toLowerCase(),
          );
          assignmentId = matched?.assignmentId || null;
        }

        if (!assignmentId) {
          setError(true);
          setLoading(false);
          return;
        }

        // Step 3: Fetch entities
        const response = await apiClient.get<any>(
          API_URLS.GET_ENTITIES_FOR_ASSIGNMENT(assignmentId),
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY },
        );

        // CONFIRMED response shape from console:
        // response = { message, code, data: { useCaseId, useCaseName, pageTitle, assignmentId, data_list: [...] } }
        // So the entity array is at response.data.data_list
        const entityData = response?.data;
        const entityArray: any[] = Array.isArray(entityData?.data_list)
          ? entityData.data_list
          : [];

        // pageTitle comes from API - use it as subtitle if available
        if (entityData?.pageTitle) {
          setPageTitle(entityData.pageTitle);
        }

        setEntities(entityArray);
      } catch (err) {
        console.error("Failed to fetch entities:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [useCaseName]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          {/* Use pageTitle from API if available, else fallback to subtitle prop */}
          <p className="text-muted-foreground">{pageTitle || subtitle}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">Could not load entities.</p>
            <p className="text-sm mt-2">
              Please go back to homepage and try again.
            </p>
          </div>
        ) : entities.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">
              No entities found for this use case.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity: any) => (
              <Card
                key={entity.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    {/* Show optional label above name e.g. "COW ID" */}
                    {cardLabel && (
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        {cardLabel}
                      </p>
                    )}
                    <CardTitle className="text-xl font-bold">
                      {entity.name}
                    </CardTitle>
                  </div>
                  <MapPin className="h-5 w-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-1">
                    📍 {entity.location || "Location not specified"}
                  </p>
                  {entity.latitude && entity.longitude && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {parseFloat(entity.latitude).toFixed(4)},{" "}
                      {parseFloat(entity.longitude).toFixed(4)}
                    </p>
                  )}
                  <Button
                    className="w-full mt-2"
                    onClick={() =>
                      navigate(`${detailRoute}/${entity.id}`, {
                        state: {
                          entityId: entity.id,
                          entityName: entity.name,
                          entityLocation: entity.location,
                          useCaseName: useCaseName,
                        },
                      })
                    }
                  >
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityList;
