import EntityList from "./Entitylist";

const LightVillages = () => (
  <EntityList
    title="Smart Light Villages"
    subtitle="Select a location to view street light status and KPI data."
    useCaseName="Smart Street Lights"
    detailRoute="/projects/smart-light/dashboard"
  />
);

export default LightVillages;