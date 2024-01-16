import { LatLngExpression } from "leaflet";

interface localsResponse {
  id: number;
  name: string;
  common_name: string | null;
  type: number;
  free_space_category: number;
  comments: string | null;
  creation_year: number | null;
  reform_year: number | null;
  mayor_creation: null;
  legislation: null;
  useful_area: null;
  area_pjf: null;
  angle_inclination: null;
  urban_region: null;
  inactive_not_found: null;
  address_id: null;
  polygon: {
    crs: {
      type: string;
      properties: {
        name: string;
      };
    };
    type: string;
    coordinates: [value: LatLngExpression[]];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface addressResponse {
  id: number;
  UF: string;
  locals_id: number;
  city: string;
  neighborhood: string;
  street: string;
  number: number;
  planning_region_id: null;
  createdAt: string;
  updatedAt: string;
}

export type { localsResponse, addressResponse };
