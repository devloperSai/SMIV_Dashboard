import EntityList from "./Entitylist";

const WaterSites = () => (
  <EntityList
    title="Water Management Systems"
    subtitle="Select a site to view real-time water quality and supply analytics."
    useCaseName="Water quantity and quality management system"
    detailRoute="/projects/water-management/dashboard"
  />
);

export default WaterSites;