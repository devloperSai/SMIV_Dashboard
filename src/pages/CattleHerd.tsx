import EntityList from "./Entitylist";

const CattleHerd = () => (
  <EntityList
    title="Smart Cattle Health Monitoring"
    subtitle="Select a cattle entity to view health and activity details."
    useCaseName="Smart Cattle Health Monitoring"
    detailRoute="/projects/smart-cattle/details"
    cardLabel="COW ID"
  />
);

export default CattleHerd;