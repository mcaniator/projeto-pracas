import { LatLngExpression } from "leaflet";

interface categoriesJSONSchema {
  id: number;
  name: string;
  optional: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JSONSchema {
  id: number;
  name: string;
  FormsFields: [
    {
      id: number;
      name: string;
      optional: boolean;
      NumericField: null | {
        min: number;
        max: number;
      };
      TextField: null | {
        id: number;
      };
      OptionField: null | {
        id: number;
        total_options: number;
        option_limit: number;
        visual_preference: number;
        Options: [
          {
            id: number;
            name: string;
          },
        ];
      };
    },
  ];
}

interface availableCategories {
  id: number;
  label: string;
}

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

export type {
  JSONSchema,
  availableCategories,
  categoriesJSONSchema,
  localsResponse,
};
