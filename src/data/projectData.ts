import INVASLogo from "../../public/invaslogo.png";
import CoreDataLogo from "../../public/coredatalogo.png";
import CoralTelecomLogo from "../../public/coral_telecom.jpg";
import EarthTwinLogo from "../../public/EarthTwinLogo.jpeg";
import MangalCareLogo from "../../public/Mangalcare_Logo.jpg";
import EdufrontLogo from "../../public/edufront logo.png";
import EdufrontDash from "../../public/smart_school.jpeg";
import SparshLogo from "../../public/sparshLogo.png";
import OptimusLogo from "../../public/OptimusLogo.png";
import MatreCommLogo from "../../public/MatrecommLogo.png";
import SensoriseLogo from "../../public/Sensoriselogo.jpg";
import IndioNetworksLogo from "../../public/indiologo.png";
import SuperceuticalsLogo from "../../public/SC_logo.jpg";
import TerminateLogo from "../../public/terminate.png";
import InstaICTLogo from "../../public/instaictlogo.jpeg";
import SmartKhetiDash from "../../public/SmartkhetiPoster.jpeg";
import SmartPondDash from "../../public/smartpond.jpg";
import CoreDataDash from "../../public/coredata.webp";
import CoralWasteDash from "../../public/smart_bins.jpeg";
import EarthTwinDash from "../../public/climate.jpeg";
import MangalDash from "../../public/healthcase.jpeg";
import SparshDash from "../../public/sparshdash.png";
import OptimusDash from "../../public/evCharging.jpg";
import OptimusDash2 from "../../public/drone.jpg";
import MatreCommDash from "../../public/MatreCommdash.png";
import SensoriseDash from "../../public/sensorisedash.png";
import CoralPPDRDash from "../../public/coraldash.png";
import IndioDash from "../../public/indiodash.jpg";
import InstaICTDash from "../../public/smart_light.jpeg";
import CattleDash from "../../public/cattle_health.jpeg";
import ResoproDash from "../../public/resopro-dash.jpeg";
import ResoproLogo from "../../public/resopro.jpg";
import SuperceuticalsDash from "../../public/SC_dash.jpeg";
import PragmataLogo from "../../public/pragmatalogo.png";
import PragmataDash from "../../public/pragmatadash.png";

export interface ProjectStat {
  name: string;
  value: string | number;
}

export type Indicator = "green" | "coral" | "red";

export interface Project {
  project_name: string;   // must match API useCaseName exactly
  organization: string;
  url: string;            // internal route or external URL
  logoUrl?: string;
  imageUrl?: string;
  indicator?: Indicator;
  stats?: ProjectStat[];  // overwritten by API response at runtime
  assignmentId?: string;  // comes from API response
}

export const initialProjects: Project[] = [
  {
    project_name: "Smart Kheti",
    organization: "INVAS",
    url: "/projects/smart-kheti/farms",
    indicator: "green",
    logoUrl: INVASLogo,
    imageUrl: SmartKhetiDash,
  },
  {
    project_name: "Smart Pond",
    organization: "INVAS",
    url: "/projects/smart-pond/farms",
    indicator: "green",
    logoUrl: INVASLogo,
    imageUrl: SmartPondDash,
  },
  {
    project_name: "Smart Cattle Health Monitoring",
    organization: "Insta ICT Solutions",
    url: "/projects/smart-cattle/herd",
    indicator: "green",
    logoUrl: InstaICTLogo,
    imageUrl: CattleDash,
  },
  {
    project_name: "Smart Street Lights",
    organization: "Insta ICT Solutions",
    url: "/projects/smart-light/villages",
    indicator: "green",
    logoUrl: InstaICTLogo,
    imageUrl: InstaICTDash,
  },
  {
    project_name: "Water quantity and quality management system",
    organization: "Coredata",
    url: "/projects/water-management/sites",
    indicator: "green",
    logoUrl: CoreDataLogo,
    imageUrl: CoreDataDash,
  },
  {
    project_name: "Smart Waste Management System",
    organization: "Coral Telecom Limited",
    url: "/projects/smart-waste/bins",
    indicator: "green",
    logoUrl: CoralTelecomLogo,
    imageUrl: CoralWasteDash,
  },
  {
    // ✅ NOW INTERNAL — was external (https://app.earthtwin.eco/)
    project_name: "Climate Smart Agriculture",
    organization: "Idasu Labs",
    url: "/projects/climate-agri/sites",
    indicator: "green",
    logoUrl: EarthTwinLogo,
    imageUrl: EarthTwinDash,
  },
  {
    // ✅ NOW INTERNAL — was external (https://optimusrhino.com/satnavari)
    project_name: "Agriculture and Fire Safety Drone",
    organization: "Optimus Logic",
    url: "/projects/drone-ops/sites",
    indicator: "green",
    logoUrl: OptimusLogo,
    imageUrl: OptimusDash2,
  },
  {
     // ✅ NOW INTERNAL — was external ("https://public.tableau.com/app/profile/girish.jha/viz/SmartSchoolEdufront-Satnavari/SatnavariSchoolDashboard")
    project_name: "Smart Anganwadi",
    organization: "Edufront Technologies Pvt. Ltd",
    url: "/projects/smart-anganwadi/sites",
    indicator: "green",
    logoUrl: EdufrontLogo,
    imageUrl: EdufrontDash,
  },
  {
    // ✅ NOW INTERNAL — was external ("https://public.tableau.com/app/profile/girish.jha/viz/SmartSchoolEdufront-Satnavari/SatnavariSchoolDashboard")
    project_name: "Smart School",
    organization: "Edufront Technologies Pvt. Ltd",
    url: "/projects/smart-school/sites",
    indicator: "green",
    logoUrl: EdufrontLogo,
    imageUrl: EdufrontDash,
  },
  {
    // ✅ NOW INTERNAL — was external ("https://satnavari.mangalcare.com/")
    project_name: "One-Stop Destination for Healthcare Needs",
    organization: "MangalCare",
    url: "/projects/healthcare/sites",
    indicator: "green",
    logoUrl: MangalCareLogo,
    imageUrl: MangalDash,
  },
  {
    project_name: "Engineering Healthcare",
    organization: "Superceuticals",
    url: "/projects/engineering-healthcare/overview",
    indicator: "green",
    logoUrl: SuperceuticalsLogo,
    imageUrl: SuperceuticalsDash,
  },
  {
     // ✅ NOW INTERNAL — was external ("https://sparshsecuritech-my.sharepoint.com")
    project_name: "WiFi Enabled CCTV Cameras",
    organization: "Sparsh CCTV",
    url: "/projects/cctv/dashboard",
    indicator: "green",
    logoUrl: SparshLogo,
    imageUrl: SparshDash,
  },
  {
    // ✅ NOW INTERNAL — was external ("https://ppdr.coraltele.com")
    project_name: "Public Protection and Disaster Relief System",
    organization: "Coral Telecom Limited",
    url: "/projects/ppdr/sites",
    indicator: "green",
    logoUrl: CoralTelecomLogo,
    imageUrl: CoralPPDRDash,
  },
  {
    // ✅ NOW INTERNAL — was external ("https://terminatefire.com/index.html")
    project_name: "Automatic Fire Extinguisher Solution",
    organization: "Terminate Fire Safety",
    url: "/projects/fire-extinguisher/dashboard/1", 
    indicator: "green",
    logoUrl: TerminateLogo,
    imageUrl: TerminateLogo,
  },
  {
    // ✅ NOW INTERNAL — was external ("https://icloud.indionetworks.com/wifilan/cust/smiv-dashboard")
    project_name: "Wi-Fi Hotspots",
    organization: "Indio Networks",
    url: "/projects/wifi-hotspots/sites",
    indicator: "green",
    logoUrl: IndioNetworksLogo,
    imageUrl: IndioDash,
  },
  {
    // ✅ NOW INTERNAL — was external ("https://optimusrhino.com/satnavari")
    project_name: "EV Auto",
    organization: "Optimus Logic",
    url: "/projects/ev-auto/sites",
    indicator: "green",
    logoUrl: OptimusLogo,
    imageUrl: OptimusDash,
  },
  {
    // ✅ NOW INTERNAL — was external ("https://sensorise.net/")
    project_name: "eQoSim Proposal",
    organization: "Sensorise Pvt Ltd",
    url: "/projects/eqosim/dashboard",
    indicator: "green",
    logoUrl: SensoriseLogo,
    imageUrl: SensoriseDash,
  },
  {
     // ✅ NOW INTERNAL — was external ("https://sites.google.com/kotkar.com/pragmata-bizconserv-llp/innovation-and-technologies")
    project_name: "Control Center Infra",
    organization: "PRAGMATA BIZCONSERV LLP",
    url: "/projects/control-center/dashboard",
    indicator: "green",
    logoUrl: PragmataLogo,
    imageUrl: PragmataDash,
  },
  {
     // ✅ NOW INTERNAL — was external ("https://matrecomm.com/")
    project_name: "MatreComm CraftWANI",
    organization: "MatreComm",
    url: "/projects/matrecomm/dashboard",
    indicator: "green",
    logoUrl: MatreCommLogo,
    imageUrl: MatreCommDash,
  },
  {
     // ✅ NOW INTERNAL — was external ("https://resoprosolutions.com/")
    project_name: "Smart Intelligent Village - Central NOC",
    organization: "Resopro Solutions",
    url: "/projects/central-noc/dashboard",
    indicator: "green",
    logoUrl: ResoproLogo,
    imageUrl: ResoproDash,
  },
];