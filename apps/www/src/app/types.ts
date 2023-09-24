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

export type { JSONSchema, availableCategories, categoriesJSONSchema };
