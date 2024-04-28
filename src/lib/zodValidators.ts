import {
  Activity,
  AgeGroup,
  BrazilianStates,
  CategoryTypes,
  Gender,
  LocationTypes,
  NoiseTypes,
  UserTypes,
  WeatherConditions,
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

// #endregion

// #region Informações da Praça
//  ------------------------------------------------------------------------------------------------------------
//  Informações da Praça
//  ------------------------------------------------------------------------------------------------------------
const SortOrderSchema = z.array(z.enum(["id", "name", "date"])).length(3);
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
  narrowAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
  intermediateAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
  broadAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
});

type SortOrderType = z.infer<typeof SortOrderSchema>;
type locationType = z.infer<typeof locationSchema>;
type addressType = z.infer<typeof addressSchema>;
type cityType = z.infer<typeof citySchema>;
type administrativeUnitsType = z.infer<typeof administrativeUnitsSchema>;

export {
  SortOrderSchema,
  addressSchema,
  administrativeUnitsSchema,
  citySchema,
  locationSchema,
};
export type {
  SortOrderType,
  addressType,
  administrativeUnitsType,
  cityType,
  locationType,
};
// #endregion

// #region Informações das Avaliações
//  ------------------------------------------------------------------------------------------------------------
//  Informações das Avaliações
//  ------------------------------------------------------------------------------------------------------------

// #endregion

// #region Campos das Avaliações
//  ------------------------------------------------------------------------------------------------------------
//  Campos das Avaliações
//  ------------------------------------------------------------------------------------------------------------

// #endregion

// #region Campos das Avaliações Não Relacionados à Avaliação Física
//  ------------------------------------------------------------------------------------------------------------
//  Campos das Avaliações Não Relacionadas à Avaliação Física
//  ------------------------------------------------------------------------------------------------------------

const tallySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  observer: z.coerce
    .string()
    .trim()
    .refine((value) => !value.includes("\n")),
  tallyGroup: z.coerce.number().int().finite().nonnegative(),
  animalsAmount: z.coerce.number().int().finite().nonnegative().optional(),
  temperature: z.coerce.number().finite().optional(),
  weatherCondition: z.nativeEnum(WeatherConditions).optional(),
  groups: z.coerce.number().finite().optional(),
  commercialActivities: z.coerce
    .number()
    .int()
    .finite()
    .nonnegative()
    .optional(),
  commercialActivitiesDescription: z.coerce.string().trim().optional(),

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
  date: z.coerce.date(),
  noiseType: z.nativeEnum(NoiseTypes),
  description: z.string().trim().optional(),
  soundLevel: z.coerce.number().finite().nonnegative(),

  assessmentId: z.coerce.number().int().finite().nonnegative(),
});

const tallyDataToProcessSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  observer: z.coerce
    .string()
    .trim()
    .refine((value) => !value.includes("\n")),
  animalsAmount: z.coerce.number().int().finite().nonnegative().nullable(),
  groups: z.coerce.number().int().finite().nonnegative().nullable(),
  temperature: z.coerce.number().finite().nullable(),
  weatherCondition: z.nativeEnum(WeatherConditions).nullable(),
  commercialActivities: z.coerce
    .number()
    .int()
    .finite()
    .nonnegative()
    .nullable(),

  locationId: z.coerce.number().int().finite().nonnegative(),
  location: z.object({
    name: z.string().trim(),
  }),
  tallyPerson: z.array(
    z.object({
      person: personSchema,
      quantity: z.coerce.number().int().finite().nonnegative(),
    }),
  ),
});

type tallyType = z.infer<typeof tallySchema>;
type personType = z.infer<typeof personSchema>;
type noiseType = z.infer<typeof noiseSchema>;
type tallyDataToProcessType = z.infer<typeof tallyDataToProcessSchema>;

export { noiseSchema, personSchema, tallySchema, tallyDataToProcessSchema };
export type { noiseType, personType, tallyType, tallyDataToProcessType };
// #endregion
