import EntityList from "./Entitylist";

const HealthDetails = () => (
  <EntityList
    title="Engineering Healthcare Analytics"
    subtitle="Select an entity to view detailed healthcare KPI data."
    useCaseName="Engineering Healthcare"
    detailRoute="/projects/engineering-healthcare/details"
  />
);

export default HealthDetails;