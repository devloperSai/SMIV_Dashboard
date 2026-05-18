import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Project } from "../data/projectData";
import clsx from "clsx";

interface ProjectCardProps {
  project: Project;
  index: number;
}

// Map indicator to fill color
const colorMap: Record<string, string> = {
  green: "bg-green-500 border-green-500",
  coral: "bg-orange-500 border-orange-500",
  red: "bg-red-500 border-red-500",
};

// Map indicator to outline color (inactive)
const outlineColorMap: Record<string, string> = {
  green: "border-green-500",
  coral: "border-orange-300",
  red: "border-red-300",
};

// Component to show each indicator
const StatusIndicator = ({
  indicator,
  active = false,
}: {
  indicator?: "green" | "coral" | "red";
  active?: boolean;
}) => {
  const isValid = ["green", "coral", "red"].includes(indicator || "");

  return (
    <span
      className={clsx(
        "w-3 h-3 rounded-full border-2 inline-block",
        isValid
          ? active
            ? colorMap[indicator!]
            : outlineColorMap[indicator!]
          : "border-gray-400",
        active && isValid && "animate-[pulse_0.8s_infinite]"
      )}
    />
  );
};

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const navigate = useNavigate();
  const name = project.project_name;

  const handleInteraction = () => {
    // ── Already-migrated internal routes ──────────────────────────────
    if (name === "Smart Cattle Health Monitoring") {
      navigate("/projects/smart-cattle/herd");
    } else if (name === "Smart Kheti") {
      navigate("/projects/smart-kheti/farms");
    } else if (name === "Smart Pond") {
      navigate("/projects/smart-pond/farms");
    } else if (name === "Smart Waste Management System") {
      navigate("/projects/smart-waste/bins");
    } else if (name === "Engineering Healthcare") {
      navigate("/projects/engineering-healthcare/overview");
    } else if (name === "Water quantity and quality management system") {
      navigate("/projects/water-management/sites");
    } else if (name === "Smart Street Lights") {
      navigate("/projects/smart-light/villages");

    // ── Newly migrated: Climate Smart Agriculture ─────────────────────
    } else if (name === "Climate Smart Agriculture") {
      navigate("/projects/climate-agri/sites");

    // ── Still external (not yet migrated) ────────────────────────────
    } else {
      window.open(project.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      onClick={handleInteraction}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="project-card group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-full hover:shadow-xl transition-all"
    >
      {/* Visual Header */}
      <div className="h-44 relative bg-muted overflow-hidden">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.project_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Left Logo */}
        {project.logoUrl && (
          <div className="absolute top-3 left-3 w-10 h-10 bg-white rounded-lg shadow-md p-1.5">
            <img src={project.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-foreground leading-none mb-1">
          {project.project_name}
        </h3>

        <p className="text-xs text-muted-foreground uppercase font-semibold">
          {project.organization}
        </p>

        {/* Indicators below organization */}
        <div className="flex gap-1 mt-2 mb-4">
          {["green", "coral", "red"].map((status) => (
            <StatusIndicator
              key={status}
              indicator={status as "green" | "coral" | "red"}
              active={project.indicator === status}
            />
          ))}
        </div>

        {/* Live Stats Grid */}
        {project.stats && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-auto pt-4 border-t border-border/50">
            {project.stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                  {stat.name}
                </span>
                <span className="text-xs font-black text-foreground">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;