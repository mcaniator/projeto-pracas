import {
  Activity,
  AgeGroup,
  CategoryTypes,
  Gender,
  LocationTypes,
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
  UserTypes,
  WeatherConditions,
} from "@prisma/client";
import { ZodType, z } from "zod";

type zodErrorType<Type extends ZodType> = {
  [Property in keyof z.infer<Type>]?: string[] | undefined;
};

export type { zodErrorType };

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
  notes: z.string().trim().min(1).max(255).optional().nullable(),
  optional: z.boolean().optional(),
  active: z.boolean().optional(),
  type: z.nativeEnum(QuestionTypes),
  characterType: z.nativeEnum(QuestionResponseCharacterTypes),
  minValue: z.coerce.number().finite().optional(),
  maxValue: z.coerce.number().finite().optional(),
  optionType: z.nativeEnum(OptionTypes).optional(),
  maximumSelections: z.coerce.number().int().finite().nonnegative().optional(),
  geometryTypes: z.array(z.nativeEnum(QuestionGeometryTypes)).optional(),

  categoryId: z.coerce.number().int().finite().nonnegative(),
  subcategoryId: z.coerce.number().int().finite().nonnegative().optional(),
});

const questionsOnFormsSchema = z.object({
  formId: z.coerce.number().int().finite().nonnegative(),
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

    questionId: z.coerce.number().int().finite().nonnegative(),
  })
  .array()
  .nonempty();

const formSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

type categoryType = z.infer<typeof categorySchema>;
type questionType = z.infer<typeof questionSchema>;
type formType = z.infer<typeof formSchema>;

export {
  categorySchema,
  formSchema,
  numericQuestionSchema,
  optionSchema,
  optionsQuestionSchema,
  questionSchema,
  // textQuestionSchema,
};
export type { categoryType, formType, questionType };
// #endregion

// #region Informações da Praça
//  ------------------------------------------------------------------------------------------------------------
//  Informações da Praça
//  ------------------------------------------------------------------------------------------------------------
const locationSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    firstStreet: z.string().trim().min(1).max(255),
    secondStreet: z.string().trim().min(1).max(255),
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
      value.creationYear !== undefined &&
      value.lastMaintenanceYear !== undefined
    )
      return value.lastMaintenanceYear >= value.creationYear;
    return true;
  });

const citySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

const BrazilianStatesEnum = z.enum([
  "ACRE",
  "ALAGOAS",
  "AMAPA",
  "AMAZONAS",
  "BAHIA",
  "CEARA",
  "DISTRITO_FEDERAL",
  "ESPIRITO_SANTO",
  "GOIAS",
  "MARANHAO",
  "MATO_GROSSO",
  "MATO_GROSSO_DO_SUL",
  "MINAS_GERAIS",
  "PARA",
  "PARAIBA",
  "PARANA",
  "PERNAMBUCO",
  "PIAUI",
  "RIO_DE_JANEIRO",
  "RIO_GRANDE_DO_NORTE",
  "RIO_GRANDE_DO_SUL",
  "RONDONIA",
  "RORAIMA",
  "SANTA_CATARINA",
  "SAO_PAULO",
  "SERGIPE",
  "TOCANTINS",
]);

const administrativeUnitsSchema = z.object({
  narrowAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
  intermediateAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
  broadAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
});

type locationType = z.infer<typeof locationSchema>;
type cityType = z.infer<typeof citySchema>;
type administrativeUnitsType = z.infer<typeof administrativeUnitsSchema>;
type BrazilianStatesEnum = z.infer<typeof BrazilianStatesEnum>;

export {
  administrativeUnitsSchema,
  citySchema,
  locationSchema,
  BrazilianStatesEnum,
};
export type { administrativeUnitsType, cityType, locationType };
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
  date: z.coerce.date().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  observer: z.coerce.string().trim().min(1).max(255),

  animalsAmount: z.coerce.number().int().finite().nonnegative().optional(),
  temperature: z.coerce.number().finite().optional(),
  weatherCondition: z.nativeEnum(WeatherConditions),

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

type tallyType = z.infer<typeof tallySchema>;
type personType = z.infer<typeof personSchema>;

export { personSchema, tallySchema, questionsOnFormsSchema };
export type { personType, tallyType };
// #endregion
