import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import { initialProjects, Project } from "../data/projectData";
import apiClient from "../api/apiClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ROOTS, API_URLS } from "../api/apiUrls";
import EventSection from "@/components/EventSection";
import ProjectsSection from "@/components/ProjectsSection";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

// UPDATED IMPORT
import MahaAIButton from "@/features/maha-ai/components/MahaAIButton";

const SATNAVARI_VILLAGE_ID =
  import.meta.env.VITE_SATNAVARI_VILLAGE_ID ||
  "a5fc0498-d3e7-492e-a104-b97635af4503";
const SMIV_API_KEY =
  import.meta.env.VITE_SMIV_API_KEY || "SMIV-V1-7xR2p9Qz4L8mN5vW";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useEffect(() => {
    const fetchProjectStats = async () => {
      setLoading(true);

      try {
        const response = await apiClient.get<any>(
          API_URLS.GET_USE_CASES_FOR_VILLAGE(SATNAVARI_VILLAGE_ID),
          ROOTS.SMIV_PLATFORM,
          { "x-api-key": SMIV_API_KEY },
        );

        const apiUseCases: any[] = response?.data || [];

        // Store full use case list in localStorage
        localStorage.setItem("smiv_use_cases", JSON.stringify(apiUseCases));

        const mergedProjects = initialProjects.map((localProject) => {
          const matchedUseCase = apiUseCases.find(
            (apiItem) =>
              apiItem.useCaseName?.trim().toLowerCase() ===
              localProject.project_name?.trim().toLowerCase(),
          );

          if (matchedUseCase) {
            return {
              ...localProject,

              assignmentId: matchedUseCase.assignmentId,

              stats:
                matchedUseCase.stats?.map((s: any) => ({
                  name: s.name,
                  value: s.unit ? `${s.value} ${s.unit}` : s.value,
                })) || localProject.stats,
            };
          }

          return localProject;
        });

        setProjects(mergedProjects);
      } catch (error) {
        console.error("Failed to fetch use cases from SMIV platform:", error);

        setProjects(initialProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStats();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Spinner className="size-12 text-primary mb-4" />

        <p className="text-muted-foreground animate-pulse text-lg font-medium">
          {t("loading_village")}
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main>
        <HeroSection />

        <EventSection />

        <section id="projects-section">
          <ProjectsSection projects={projects} />
        </section>
      </main>

      <Footer />

      <MahaAIButton />
    </>
  );
};

export default Index;
