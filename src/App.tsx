import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgriFarms from "./pages/AgriFarms";
import AgriDetails from "./pages/AgriDetails";
import AquaFarms from "./pages/AquaFarm";
import WasteBins from "./pages/WasteBins";
import WasteDetails from "./pages/WasteDetails";
import AquaDetails from "./pages/AquaDetails";
import HealthDetails from "./pages/HealthDetails";
import HealthEntityDetails from "./pages/HealthEntityDetails";
import AboutUs from "./components/AboutUs.tsx";
import LightVillages from "./pages/LightVillages";
import LightDetails from "./pages/LightDetails";
import CattleHerd from "./pages/CattleHerd";
import CattleDetails from "./pages/CattleDetails";
import WaterSites from "./pages/WaterSites";
import WaterSiteDetails from "./pages/WaterSiteDetails";
import WifiScreen from "./pages/WifiScreen.tsx";
import ClimateAgriSites from "./pages/ClimateAgriSites";
import ClimateAgriDetails from "./pages/ClimateAgriDetails";
import DroneOperationsSites from "./pages/DroneOperationSites.tsx";
import DroneOperationsDetails from "./pages/DroneOperationsDetails.tsx";
import AnganwadiSites from "./pages/AnganwadiSites";
import AnganwadiDetails from "./pages/AnganwadiDetails";
import SmartSchoolSites from "./pages/SmartSchoolSites";
import SmartSchoolDetails from "./pages/SmartSchoolDetails";
import HealthcareSites from "./pages/HealthcareSites";
import HealthcareDetails from "./pages/HealthcareDetails";
import PPDRSites from "./pages/PPDRSites";
import PPDRDetails from "./pages/PPDRDetails";
import FireExtinguisherDetails from "./pages/FireExtinguisherDetails";
import WifiHotspotSites from "./pages/WifiHotspotSites";
import WifiHotspotDetails from "./pages/WifiHotspotDetails";
import EVAutoSites from "./pages/EVAutoSites";
import EVAutoDetails from "./pages/EVAutoDetails";
import Eqosimdashboard from "./pages/Eqosimdashboard.tsx";
import MatreCommDashboard from "./pages/MatreCommDashboard";
import ControlCenterDashboard from "./pages/ControlCenterDashboard";
import CentralNOCDashboard from "./pages/CentralNOCDashboard";
import CCTVDashboard from "./pages/CCTVDashboard";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Smart Kheti */}
          <Route path="/projects/smart-kheti/farms" element={<AgriFarms />} />
          <Route path="/projects/smart-kheti/dashboard/:farmId" element={<AgriDetails />} />

          {/* Smart Pond */}
          <Route path="/projects/smart-pond/farms" element={<AquaFarms />} />
          <Route path="/projects/smart-pond/dashboard/:pondId" element={<AquaDetails />} />

          {/* Smart Waste */}
          <Route path="/projects/smart-waste/bins" element={<WasteBins />} />
          <Route path="/projects/smart-waste/dashboard/:binId" element={<WasteDetails />} />

          {/* Engineering Healthcare */}
          <Route path="/projects/engineering-healthcare/overview" element={<HealthDetails />} />
          <Route path="/projects/engineering-healthcare/details/:entityId" element={<HealthEntityDetails />} />

          {/* Smart Street Lights */}
          <Route path="/projects/smart-light/villages" element={<LightVillages />} />
          <Route path="/projects/smart-light/dashboard/:villageId" element={<LightDetails />} />

          {/* Smart Cattle */}
          <Route path="/projects/smart-cattle/herd" element={<CattleHerd />} />
          <Route path="/projects/smart-cattle/details/:id" element={<CattleDetails />} />

          {/* Water Management */}
          <Route path="/projects/water-management/sites" element={<WaterSites />} />
          <Route path="/projects/water-management/dashboard/:siteId" element={<WaterSiteDetails />} />

          {/* Wi-Fi Hotspots (iframe) */}
          <Route path="/projects/wifi/dashboard" element={<WifiScreen />} />

          {/* Climate Smart Agriculture ← NEW */}
          <Route path="/projects/climate-agri/sites" element={<ClimateAgriSites />} />
          <Route path="/projects/climate-agri/dashboard/:siteId" element={<ClimateAgriDetails />} />

          {/* Agriculture & Fire Safety Drone ← NEW */}
          <Route path="/projects/drone-ops/sites" element={<DroneOperationsSites />} />
          <Route path="/projects/drone-ops/dashboard/:droneId" element={<DroneOperationsDetails />} />

          {/* Smart Anganwadi ← NEW */}
          <Route path="/projects/smart-anganwadi/sites" element={<AnganwadiSites />} />
          <Route path="/projects/smart-anganwadi/dashboard/:anganwadiId" element={<AnganwadiDetails />} />

          {/* Smart School ← NEW*/}
          <Route path="/projects/smart-school/sites" element={<SmartSchoolSites />} />
          <Route path="/projects/smart-school/dashboard/:schoolId" element={<SmartSchoolDetails />} />

          {/* Healthcare  ← NEW*/}
          <Route path="/projects/healthcare/sites" element={<HealthcareSites />} />
          <Route path="/projects/healthcare/dashboard/:healthId" element={<HealthcareDetails />} />

          {/* PPDR ← NEW*/}
          <Route path="/projects/ppdr/sites" element={<PPDRSites />} />
          <Route path="/projects/ppdr/dashboard/:ppdrid" element={<PPDRDetails />} />

          {/* Fire Extinguisher ← NEW */}
          <Route path="/projects/fire-extinguisher/dashboard/:extinguisherId" element={<FireExtinguisherDetails />} />

          {/* Wi-Fi Hotspots ← NEW */}
          <Route path="/projects/wifi-hotspots/sites" element={<WifiHotspotSites />} />
          <Route path="/projects/wifi-hotspots/dashboard/:hotspotId" element={<WifiHotspotDetails />} />

          {/* EV Auto ← NEW */}
          <Route path="/projects/ev-auto/sites" element={<EVAutoSites />} />
          <Route path="/projects/ev-auto/dashboard/:evId" element={<EVAutoDetails />} />

          {/* eQoSim Proposal ← NEW */}
          <Route path="/projects/eqosim/dashboard" element={<Eqosimdashboard />} />

          {/* MatreComm CraftWANI ← NEW */}
          <Route path="/projects/matrecomm/dashboard" element={<MatreCommDashboard />} />

          {/* Control Center Infra ← NEW */}
          <Route path="/projects/control-center/dashboard" element={<ControlCenterDashboard />} />

          {/* Central NOC Dashboard ← NEW */}
          <Route path="/projects/central-noc/dashboard" element={<CentralNOCDashboard />} />

            {/* Wifi Enabled CCTV Dashboard ← NEW */}
          <Route path="/projects/cctv/dashboard" element={<CCTVDashboard />} />

          {/* About */}
          <Route path="/about-us" element={<AboutUs />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;