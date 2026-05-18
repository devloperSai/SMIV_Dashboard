import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProjectCard from "./ProjectCard";
import { Project } from "../data/projectData";

interface ProjectsSectionProps {
  projects: Project[];
}

const ProjectsSection = ({ projects }: ProjectsSectionProps) => {
  const { t } = useTranslation();

  return (
      <section
          id="projects"
          className="py-20 mx-2 sm:mx-6 bg-background pattern-dots relative overflow-hidden"
      >
        {/* Header Section */}
        <div className="w-full max-w-full mx-auto flex flex-col items-center mb-24">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center w-full px-4"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 mb-8">
                <LayoutDashboard className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{t("dashboard")}</span>
              </div>

              <h2 className="section-title mb-6 text-4xl md:text-5xl font-bold">
                {t("unified_dashboard")}{" "}
                <span className="gradient-text">{t("village_title")}</span>
              </h2>

              <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                {t("real_time_desc")}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16">
                <div className="text-center p-8 sm:p-12 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="stat-number mb-2 text-5xl font-bold text-primary">
                    24
                  </div>
                  <p className="text-muted-foreground font-medium uppercase tracking-wider">
                    {t("organizations")}
                  </p>
                </div>

                <div className="text-center p-8 sm:p-12 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-center">
                  <div className="stat-number font-bold text-base sm:text-lg lg:text-xl mb-2 text-foreground">
                    {t("connectivity_providers")}
                  </div>
                  <p className="text-muted-foreground font-medium uppercase tracking-wider">
                    {t("connectivity")}
                  </p>
                </div>

                <div className="text-center p-8 sm:p-12 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="stat-number mb-2 text-5xl font-bold text-primary">
                    24/7
                  </div>
                  <p className="text-muted-foreground font-medium uppercase tracking-wider">
                    {t("monitoring")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Project Grid Section */}
        <div className="w-full max-w-full px-2 sm:px-6 mt-12">
          {/* Date + Status Legend Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-2 sm:px-6">

            {/* Left - Date */}
            <div className="text-sm font-semibold text-muted-foreground text-center sm:text-left">
              <h2 className="text-xs uppercase tracking-wide">Last Update</h2>
              <div>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Right - Status Legend */}
            <div className="grid grid-cols-3 sm:flex items-center gap-4 text-xs font-semibold text-muted-foreground text-center">

              <div className="flex items-center justify-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5 rounded-full bg-green-500">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
              </span>
                Healthy
              </div>

              <div className="flex items-center justify-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5 rounded-full bg-orange-400">
                <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
              </span>
                Moderate
              </div>

              <div className="flex items-center justify-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5 rounded-full bg-red-500">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
              </span>
                Critical
              </div>

            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10">
            {projects.map((project, index) => (
                <ProjectCard
                    key={project.project_name}
                    project={project}
                    index={index}
                />
            ))}
          </div>
        </div>
      </section>
  );
};

export default ProjectsSection;
