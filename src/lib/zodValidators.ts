import {
  Activity,
  AgeGroup,
  BrazilianStates,
  CategoryTypes,
  Condition,
  Gender,
  Interference,
  LocationTypes,
  NoiseLocation,
  OptionTypes,
  QuestionTypes,
  UserTypes,
  Visibility,
} from "@prisma/client";
import { z } from "zod";

// #region Auth
//  ------------------------------------------------------------------------------------------------------------
//  Auth
//  ------------------------------------------------------------------------------------------------------------

const userSchema = z.object({
  email: z.string().trim().email().optional(),
  username: z.string().trim().toLowerCase().min(1).max(255),
  type: z.nativeEnum(UserTypes),
});

type userType = z.infer<typeof userSchema>;

export { userSchema };
export type { userType };

// #endregion

// #region Fomulários
//  ------------------------------------------------------------------------------------------------------------
//  Formulários
//  ------------------------------------------------------------------------------------------------------------

const categorySchema = z.object({
  name: z.string().trim().min(1).max(255),
  optional: z.boolean().optional(),
  active: z.boolean().optional(),
});

const questionSchema = z.object({
  name: z.string().trim().min(1).max(255),
  optional: z.boolean().optional(),
  active: z.boolean().optional(),
  type: z.nativeEnum(QuestionTypes),

  categoryId: z.coerce.number().int().finite().nonnegative(),
});

const textQuestionSchema = z.object({
  charLimit: z.coerce.number().int().finite().nonnegative().optional(),

  questionId: z.coerce.number().int().finite().nonnegative(),
});

const numericQuestionSchema = z
  .object({
    min: z.coerce.number().finite().optional(),
    max: z.coerce.number().finite().optional(),

    questionId: z.coerce.number().int().finite().nonnegative(),
  })
  .refine((value) => {
    if (value.min == undefined || value.max == undefined) return true;
    return value.min < value.max;
  });

const optionsQuestionSchema = z
  .object({
    optionType: z.nativeEnum(OptionTypes),
    maximumSelections: z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .optional(),

    questionId: z.coerce.number().int().finite().nonnegative(),
  })
  .refine((value) => {
    if (value.optionType == "CHECKBOX" && value.maximumSelections == undefined)
      return false;
    if (value.optionType != "CHECKBOX" && value.maximumSelections != undefined)
      return false;
    return true;
  });

const optionSchema = z
  .object({
    text: z.string().trim().min(1).max(255),

    optionsQuestionId: z.coerce.number().int().finite().nonnegative(),
  })
  .array()
  .nonempty();

const formSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

type categoryType = z.infer<typeof categorySchema>;
type questionType = z.infer<typeof questionSchema>;
type textQuestionType = z.infer<typeof textQuestionSchema>;
type numericQuestionType = z.infer<typeof numericQuestionSchema>;
type optionsQuestionType = z.infer<typeof optionsQuestionSchema>;
type formType = z.infer<typeof formSchema>;

export {
  categorySchema,
  formSchema,
  numericQuestionSchema,
  optionSchema,
  optionsQuestionSchema,
  questionSchema,
  textQuestionSchema,
};
export type {
  categoryType,
  formType,
  numericQuestionType,
  optionsQuestionType,
  questionType,
  textQuestionType,
};
// #endregion

// #region Informações da Praça
//  ------------------------------------------------------------------------------------------------------------
//  Informações da Praça
//  ------------------------------------------------------------------------------------------------------------

const locationSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    isPark: z.boolean().optional(),
    notes: z.string().trim().min(1).optional(),
    creationYear: z.coerce.date().optional(),
    lastMaintenanceYear: z.coerce.date().optional(),
    overseeingMayor: z.string().trim().min(1).max(255).optional(),
    legislation: z.string().trim().min(1).max(255).optional(),
    usableArea: z.coerce.number().finite().nonnegative().optional(),
    legalArea: z.coerce.number().finite().nonnegative().optional(),
    incline: z.coerce.number().finite().nonnegative().optional(),
    inactiveNotFound: z.boolean().optional(),
    polygonArea: z.coerce.number().finite().nonnegative().optional(),

    type: z.nativeEnum(LocationTypes).optional(),
    category: z.nativeEnum(CategoryTypes).optional(),

    narrowAdministrativeUnitId: z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .optional(),
    intermediateAdministrativeUnitId: z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .optional(),
    broadAdministrativeUnitId: z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .optional(),
  })
  .refine((value) => {
    if (
      value.creationYear != undefined &&
      value.lastMaintenanceYear != undefined
    )
      return value.lastMaintenanceYear >= value.creationYear;
    return true;
  });

const addressSchema = z.object({
  neighborhood: z.string().trim().min(1).max(255),
  street: z.string().trim().min(1).max(255),
  postalCode: z.string().trim().min(1).max(255),
  identifier: z.coerce.number().int().finite().nonnegative(),
  state: z.nativeEnum(BrazilianStates),

  locationId: z.coerce.number().int().finite().nonnegative(),
  cityId: z.coerce.number().int().finite().nonnegative(),
});

const citySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

const administrativeUnitsSchema = z.object({
  name: z.string().trim().min(1).max(255),
  cityId: z.coerce.number().int().finite().nonnegative(),
});

const locationDataToCreateSchema = z.object({
  narrowAdministrativeUnit: z
    .object({
      connectOrCreate: z.object({
        where: z.object({
          cityId_narrowUnitName: z.object({
            name: z.string().trim().min(1).max(255),
            cityId: z.coerce.number().int().finite().nonnegative(),
          }),
        }),
        create: z.object({
          name: z.string().trim().min(1).max(255),
          cityId: z.coerce.number().int().finite().nonnegative(),
        }),
      }),
    })
    .optional(),
  intermediateAdministrativeUnit: z
    .object({
      connectOrCreate: z.object({
        where: z.object({
          cityId_intermediateUnitName: z.object({
            name: z.string().trim().min(1).max(255),
            cityId: z.coerce.number().int().finite().nonnegative(),
          }),
        }),
        create: z.object({
          name: z.string().trim().min(1).max(255),
          cityId: z.coerce.number().int().finite().nonnegative(),
        }),
      }),
    })
    .optional(),
  broadAdministrativeUnit: z
    .object({
      connectOrCreate: z.object({
        where: z.object({
          cityId_broadUnitName: z.object({
            name: z.string().trim().min(1).max(255),
            cityId: z.coerce.number().int().finite().nonnegative(),
          }),
        }),
        create: z.object({
          name: z.string().trim().min(1).max(255),
          cityId: z.coerce.number().int().finite().nonnegative(),
        }),
      }),
    })
    .optional(),
  name: z.string().trim().min(1).max(255),
  isPark: z.boolean().optional(),
  notes: z.string().trim().min(1).optional(),
  creationYear: z.coerce.date().optional(),
  lastMaintenanceYear: z.coerce.date().optional(),
  overseeingMayor: z.string().trim().min(1).max(255).optional(),
  legislation: z.string().trim().min(1).max(255).optional(),
  usableArea: z.coerce.number().finite().nonnegative().optional(),
  legalArea: z.coerce.number().finite().nonnegative().optional(),
  incline: z.coerce.number().finite().nonnegative().optional(),
  inactiveNotFound: z.boolean().optional(),
  polygonArea: z.coerce.number().finite().nonnegative().optional(),

  type: z.nativeEnum(LocationTypes).optional(),
  category: z.nativeEnum(CategoryTypes).optional(),
});

const coordinatesArraySchema = z.array(z.number()).length(2);
const coordinatesRingSchema = z.array(coordinatesArraySchema);
const coordinatesPolygonSchema = z.object({
  bbox: z.array(z.number()).length(4),
  type: z.string(),
  coordinates: z.array(coordinatesRingSchema),
});

const geoJSONFromShpSchema = z.array(coordinatesPolygonSchema);

type locationType = z.infer<typeof locationSchema>;
type addressType = z.infer<typeof addressSchema>;
type cityType = z.infer<typeof citySchema>;
type administrativeUnitsType = z.infer<typeof administrativeUnitsSchema>;
type locationDataToCreateType = z.infer<typeof locationDataToCreateSchema>;
type coordinatesArrayType = z.infer<typeof coordinatesArraySchema>;
type coordinatesRingType = z.infer<typeof coordinatesRingSchema>;
type coordinatesPolygonType = z.infer<typeof coordinatesPolygonSchema>;
type geoJSONFromShpType = z.infer<typeof geoJSONFromShpSchema>;

export {
  addressSchema,
  administrativeUnitsSchema,
  citySchema,
  locationSchema,
  locationDataToCreateSchema,
  coordinatesArraySchema,
  coordinatesRingSchema,
  coordinatesPolygonSchema,
  geoJSONFromShpSchema,
};
export type {
  addressType,
  administrativeUnitsType,
  cityType,
  locationType,
  locationDataToCreateType,
  coordinatesArrayType,
  coordinatesRingType,
  coordinatesPolygonType,
  geoJSONFromShpType,
};
// #endregion

// #region Informações das Avaliações
//  ------------------------------------------------------------------------------------------------------------
//  Informações das Avaliações
//  ------------------------------------------------------------------------------------------------------------

const assessmentSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
    changedDelimitation: z.boolean().optional(),
    hasWifi: z.boolean(),

    pavedSidewalk: z.boolean(),
    trashCanAmount: z.coerce.number().int().finite().nonnegative(),
    bathroomAmount: z.coerce.number().int().finite().nonnegative(),
    payphoneAmount: z.coerce.number().int().finite().nonnegative(),
    drinkingFountainAmount: z.coerce.number().int().finite().nonnegative(),
    artworkAmount: z.coerce.number().int().finite().nonnegative(),
    plannedLandscapingAmount: z.coerce.number().int().finite().nonnegative(),
    movableSeatsAmount: z.coerce.number().int().finite().nonnegative(),

    sidewalkCondition: z.nativeEnum(Condition),
    trashCanCondition: z.nativeEnum(Condition),
    bathroomCondition: z.nativeEnum(Condition),
    payphoneCondition: z.nativeEnum(Condition),
    drinkingFountainCondition: z.nativeEnum(Condition),
    artworkCondition: z.nativeEnum(Condition),
    plannedLandscapingCondition: z.nativeEnum(Condition),
    movableSeatsCondition: z.nativeEnum(Condition),

    locationId: z.coerce.number().int().finite().nonnegative(),
  })
  .refine((value) => value.endDate >= value.startDate);

type assessmentType = z.infer<typeof assessmentSchema>;

export { assessmentSchema };
export type { assessmentType };
// #endregion

// #region Campos das Avaliações
//  ------------------------------------------------------------------------------------------------------------
//  Campos das Avaliações
//  ------------------------------------------------------------------------------------------------------------

const accessibilitySchema = z.object({
  surroundingSidewalkUnrestrictedLane: z.boolean(),
  surroundingSidewalkServiceLane: z.boolean(),
  ampleHeight: z.boolean(),
  signaledCrosswalk: z.boolean(),
  clearPaths: z.boolean(),
  maximumIncline: z.boolean(),
  longitudinalIncline: z.boolean(),
  tactileSignage: z.boolean(),
  safetyCoatedFlooring: z.boolean(),
  impairedParkingAmount: z.coerce.number().int().finite().nonnegative(),
  elderlyParkingAmount: z.coerce.number().int().finite().nonnegative(),
  accessibleRoute: z.boolean(),
  accessibleEquipment: z.boolean(),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const surroundingAreaSchema = z.object({
  fencedWithOperatingHours: z.boolean(),
  nameplate: z.boolean(),
  busStandsAmount: z.coerce.number().int().finite().nonnegative(),
  taxiParkingAmount: z.coerce.number().int().finite().nonnegative(),
  carParkingAmount: z.coerce.number().int().finite().nonnegative(),
  motorcycleParkingAmount: z.coerce.number().int().finite().nonnegative(),
  bikeLane: z.boolean(),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const activitiesAreaSchema = z.object({
  category: z.coerce.number().int().finite().nonnegative(),
  requiredShade: z.boolean(),
  lighting: z.boolean(),
  fencing: z.boolean(),
  benches: z.boolean(),
  condition: z.nativeEnum(Condition),
  report: z.string().trim().min(1).optional(),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const destructionSchema = z.object({
  graffitiInterferenceLevel: z.nativeEnum(Interference),
  neglectInterferenceLevel: z.nativeEnum(Interference),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const landscapingSchema = z.object({
  category: z.coerce.number().int().finite().nonnegative(),
  requiredShade: z.boolean(),
  lighting: z.boolean(),
  fencing: z.boolean(),
  benches: z.boolean(),
  condition: z.boolean(),
  report: z.string().trim().min(1).optional(),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const seatingSchema = z.object({
  category: z.coerce.number().int().finite().nonnegative(),
  requiredShade: z.boolean(),
  lighting: z.boolean(),
  fencing: z.boolean(),
  benches: z.boolean(),
  condition: z.boolean(),
  report: z.string().trim().min(1).optional(),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const eventsSchema = z.object({
  yearlyIncidence: z.coerce.number().int().finite().nonnegative(),
  category: z.coerce.number().int().finite().nonnegative(),
  maintainer: z.string().trim().min(1).max(255),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const trafficSafetySchema = z.object({
  crosswalk: z.boolean(),
  trafficLight: z.boolean(),
  speedSignage: z.boolean(),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const surroundingActivitySchema = z.object({
  surroundingEstablishments: z.string().trim().min(1),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const securitySchema = z.object({
  cameras: z.boolean(),
  policeStation: z.boolean(),
  visibilityLevel: z.nativeEnum(Visibility),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

type accessibilityType = z.infer<typeof accessibilitySchema>;
type surroundingAreaType = z.infer<typeof surroundingAreaSchema>;
type activitiesAreaType = z.infer<typeof activitiesAreaSchema>;
type destructionType = z.infer<typeof destructionSchema>;
type landscapingType = z.infer<typeof landscapingSchema>;
type seatingType = z.infer<typeof seatingSchema>;
type eventsType = z.infer<typeof eventsSchema>;
type trafficSafetyType = z.infer<typeof trafficSafetySchema>;
type surroundingActivityType = z.infer<typeof surroundingActivitySchema>;
type securityType = z.infer<typeof securitySchema>;

export {
  accessibilitySchema,
  activitiesAreaSchema,
  destructionSchema,
  eventsSchema,
  landscapingSchema,
  seatingSchema,
  securitySchema,
  surroundingActivitySchema,
  surroundingAreaSchema,
  trafficSafetySchema,
};
export type {
  accessibilityType,
  activitiesAreaType,
  destructionType,
  eventsType,
  landscapingType,
  seatingType,
  securityType,
  surroundingActivityType,
  surroundingAreaType,
  trafficSafetyType,
};
// #endregion

// #region Campos das Avaliações Não Relacionados à Avaliação Física
//  ------------------------------------------------------------------------------------------------------------
//  Campos das Avaliações Não Relacionadas à Avaliação Física
//  ------------------------------------------------------------------------------------------------------------

const tallySchema = z.object({
  date: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  animalsAmount: z.coerce.number().int().finite().nonnegative().optional(),
  temperature: z.coerce.number().finite().optional(),
  weatherCondition: z.string().trim().min(1).max(255).optional(),

  locationId: z.coerce.number().int().finite().nonnegative(),
});

const personSchema = z.object({
  ageGroup: z.nativeEnum(AgeGroup),
  gender: z.nativeEnum(Gender),
  activity: z.nativeEnum(Activity),
  isTraversing: z.boolean(),
  isPersonWithImpairment: z.boolean(),
  isInApparentIllicitActivity: z.boolean(),
  isPersonWithoutHousing: z.boolean(),
});

const noiseSchema = z.object({
  location: z.nativeEnum(NoiseLocation),
  soundLevel: z.coerce.number().finite().nonnegative(),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

type tallyType = z.infer<typeof tallySchema>;
type personType = z.infer<typeof personSchema>;
type noiseType = z.infer<typeof noiseSchema>;

export { noiseSchema, personSchema, tallySchema };
export type { noiseType, personType, tallyType };
// #endregion
