export const ROOTS = {
  INVAS_AGRI: "/api-kheti",
  WASTE_MGMT: "https://wastemgmt.coraltele.com:3023",
  HEALTHCARE: "https://api.superceuticals.in",
  SMART_LIGHT: "https://api.smiv-si.instagrp.com/api/v1",
  COWFIT: "https://api.cowfit.in/api/v1",
  WATER_MGMT: "https://cd-satnavari-api.trackingcoredata.com",
  // New SMIV platform - single source for all use case stats and entity/KPI data
  SMIV_PLATFORM: "https://api.smiv-si.instagrp.com/api/v1",
};

export const API_URLS = {
  // Old endpoints - kept for non-replaced pages
  GET_AGRI_SESSION: "/session",
  GET_DUSTBINS: "/dustbins",
  GET_HEALTH_STATS: "/analytics",
  GET_LIGHT_OVERVIEW: (villageId: string) => `/smart-light/village/${villageId}/overview`,
  GET_VILLAGES: "/hierarchy/villages",
  GET_LIGHT_DETAILS: (villageId: string) => `/smart-light/village/${villageId}/detailed-report`,
  GENERATE_CATTLE_TOKEN: "/generate-token",
  GET_CATTLE_OVERVIEW: "/cattle-overview",
  GET_CATTLE_DETAILS: (id: string) => `/cattle-details/${id}`,
  GET_WATER_OVERVIEW: "/api/v1/overview/count",
  GET_WATER_SITES: "/api/v1/sites/details",
  GET_WATER_ANALYTICS: "/api/v1/sites/analytics",

  // NEW SMIV platform endpoints
  GET_USE_CASES_FOR_VILLAGE: (villageId: string) => `/use-case/village/${villageId}`,
  GET_ENTITIES_FOR_ASSIGNMENT: (assignmentId: string) => `/entity/assignment/${assignmentId}`,
  GET_KPI_HISTORY: (entityId: string) => `/telemetry/${entityId}/history`,
  GET_GRAPHICAL_DATA: (entityId: string) => `/telemetry/${entityId}/graphical-data`,
};