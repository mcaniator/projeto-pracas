import { Activity, AgeGroup, Gender } from "@enums/personCharacteristics";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
  Role,
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

const userRegisterSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Não é um e-mail válido" }),
    name: z
      .string()
      .trim()
      .min(1, { message: "O nome de deve conter pelo menos 1 caractere." })
      .max(255, { message: "O nome deve conter no máximo 255 caracteres" }),
    password: z
      .string()
      .min(8, { message: "A senha deve conter pelo menos 8 caracteres" })
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
      .regex(/[\W_]/, "A senha deve conter pelo menos um caractere especial."),
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas não coincidem.",
      });
    }
  });

const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "A senha deve conter pelo menos 8 caracteres" })
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
      .regex(/[\W_]/, "A senha deve conter pelo menos um caractere especial."),
    confirmPassword: z.string(),
    token: z.string({ message: "Token não enviado!" }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas não coincidem.",
      });
    }
  });

const userUpdateUsernameSchema = z.object({
  userId: z.string(),
  username: z
    .string()
    .trim()
    .min(1, {
      message: "O nome de usuário deve conter pelo menos 1 caractere.",
    })
    .max(255, {
      message: "O nome de usuário deve conter no máximo 255 caracteres",
    })
    .regex(/^[a-z0-9.]+$/, {
      message: "O nome de usuário pode conter apenas letras minúsculas e '.'",
    }),
});

const userLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

type userRegisterType = z.infer<typeof userRegisterSchema>;
type userUpdateUsernameType = z.infer<typeof userUpdateUsernameSchema>;
type userLoginType = z.infer<typeof userLoginSchema>;

export {
  userRegisterSchema,
  userLoginSchema,
  userUpdateUsernameSchema,
  passwordResetSchema,
};
export type { userRegisterType, userUpdateUsernameType, userLoginType };

// #endregion

// #region Fomulários
//  ------------------------------------------------------------------------------------------------------------
//  Formulários
//  ------------------------------------------------------------------------------------------------------------

const categoryInfoToCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  notes: z.string().trim().optional().nullish(),
  categoryId: z.coerce.number().int().finite().nonnegative().optional(),
});

const subcategoryInfoToCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  categoryId: z.coerce.number().int().finite().nonnegative(),
  notes: z.string().trim().optional().nullish(),
  subcategoryId: z.coerce.number().int().finite().nonnegative().optional(),
});

const questionSchema = z.object({
  name: z.string().trim().min(1).max(255),
  notes: z.string().trim().optional().nullish(),
  optional: z.boolean().optional(),
  active: z.boolean().optional(),
  questionType: z.nativeEnum(QuestionTypes),
  characterType: z.nativeEnum(QuestionResponseCharacterTypes),
  optionType: z.nativeEnum(OptionTypes).optional(),
  geometryTypes: z.array(z.nativeEnum(QuestionGeometryTypes)).optional(),

  categoryId: z.coerce.number().int().finite().nonnegative(),
  subcategoryId: z.coerce.number().int().finite().nonnegative().optional(),
});

const questionEditDataSchema = z.object({
  questionId: z.coerce.number(),
  questionName: z.string().trim().min(1).max(255),
  notes: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() === "") return null;
    return val;
  }, z.string().trim().max(255).nullable()),
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
  cloneFormId: z.coerce.number(),
});

type questionType = z.infer<typeof questionSchema>;
type formType = z.infer<typeof formSchema>;

export {
  categoryInfoToCreateSchema,
  subcategoryInfoToCreateSchema,
  formSchema,
  numericQuestionSchema,
  optionSchema,
  optionsQuestionSchema,
  questionSchema,
  questionEditDataSchema,
  // textQuestionSchema,
};
export type { formType, questionType };
// #endregion

// #region Informações da Praça
//  ------------------------------------------------------------------------------------------------------------
//  Informações da Praça
//  ------------------------------------------------------------------------------------------------------------
const locationSchema = z.object({
  name: z.string().trim().min(1).max(255),
  popularName: z.string().trim().nullish(),
  firstStreet: z.string().trim().min(1).max(255),
  secondStreet: z.string().trim().min(1).max(255).nullish(),
  thirdStreet: z.string().trim().min(1).max(255).nullish(),
  fourthStreet: z.string().trim().min(1).max(255).nullish(),
  isPark: z.coerce.boolean(),
  inactiveNotFound: z.coerce.boolean(),
  creationYear: z.coerce.number().int().finite().nonnegative().nullish(),
  cityId: z.coerce.number().int().finite().nonnegative(),
  notes: z.string().trim().min(1).max(1024).nullish(),
  lastMaintenanceYear: z.coerce.number().int().finite().nonnegative().nullish(),
  overseeingMayor: z.string().trim().min(1).max(255).nullish(),
  legislation: z.string().trim().min(1).max(255).nullish(),
  usableArea: z.coerce.number().finite().nonnegative().nullish(),
  legalArea: z.coerce.number().finite().nonnegative().nullish(),
  incline: z.coerce.number().finite().nonnegative().nullish(),
  categoryId: z.coerce.number().int().finite().nonnegative().nullish(),
  typeId: z.coerce.number().int().finite().nonnegative().nullish(),
  narrowAdministrativeUnitId: z.coerce
    .number()
    .int()
    .finite()
    .nonnegative()
    .nullish(),
  intermediateAdministrativeUnitId: z.coerce
    .number()
    .int()
    .finite()
    .nonnegative()
    .nullish(),
  broadAdministrativeUnitId: z.coerce
    .number()
    .int()
    .finite()
    .nonnegative()
    .nullish(),
  polygonArea: z.coerce.number().finite().nonnegative().nullish(),
});

const featuresGeoJsonSchema = z.object({
  type: z.union([z.literal("Polygon"), z.literal("MultiPolygon")]),
  coordinates: z.array(z.array(z.array(z.number()))),
});

const citySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

const BrazilianStatesEnum = z.enum([
  "Acre",
  "Alagoas",
  "Amapá",
  "Amazonas",
  "Bahia",
  "Ceará",
  "Distrito Federal",
  "Espirito Santo",
  "Goiás",
  "Maranhão",
  "Mato Grosso",
  "Mato Grosso do Sul",
  "Minas Gerais",
  "Pará",
  "Paraíba",
  "Parná",
  "Pernambuco",
  "Piauí",
  "Rio de Janeiro",
  "Rio Grande do Norte",
  "Rio Grande do Sul",
  "Rondônia",
  "Roraima",
  "Santa Catarina",
  "São Paulo",
  "Sergipe",
  "Tocantins",
]);

const administrativeUnitsSchema = z.object({
  narrowAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
  intermediateAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
  broadAdministrativeUnit: z.string().trim().min(1).max(255).optional(),
});

type locationType = z.infer<typeof locationSchema>;
type cityType = z.infer<typeof citySchema>;
type administrativeUnitsType = z.infer<typeof administrativeUnitsSchema>;
type featuresGeoJsonType = z.infer<typeof featuresGeoJsonSchema>;
type BrazilianStatesEnum = z.infer<typeof BrazilianStatesEnum>;

export {
  administrativeUnitsSchema,
  citySchema,
  locationSchema,
  featuresGeoJsonSchema,
  BrazilianStatesEnum,
};
export type {
  administrativeUnitsType,
  cityType,
  featuresGeoJsonType,
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

const personSchema = z.object({
  ageGroup: z.nativeEnum(AgeGroup),
  gender: z.nativeEnum(Gender),
  activity: z.nativeEnum(Activity),
  isTraversing: z.boolean(),
  isPersonWithImpairment: z.boolean(),
  isInApparentIllicitActivity: z.boolean(),
  isPersonWithoutHousing: z.boolean(),
});

const tallyPersonSchema = z.object({
  person: personSchema,
  quantity: z.coerce.number().int().finite().nonnegative(),
});

const tallyPersonArraySchema = z.array(tallyPersonSchema);

const commercialActivitySchema = z.record(
  z.coerce.number().finite().nonnegative(),
);

const ongoingTallySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  animalsAmount: z.coerce.number().int().finite().nonnegative().nullable(),
  temperature: z.coerce.number().finite().nullable(),
  weatherCondition: z.nativeEnum(WeatherConditions).nullable(),
  groups: z.coerce.number().int().finite().nonnegative().nullable(),
  user: z.object({
    username: z.coerce.string().nullable(),
    id: z.string(),
  }),
  location: z.object({
    name: z.coerce.string(),
  }),
  tallyPerson: tallyPersonArraySchema.nullable(),
  commercialActivities: commercialActivitySchema.nullable(),
});

const tallySchema = z.object({
  id: z.coerce.number().int().nonnegative().finite(),
  locationId: z.coerce.number().int().nonnegative().finite(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  animalsAmount: z.coerce.number().int().finite().nonnegative().nullable(),
  temperature: z.coerce.number().finite().nullable(),
  weatherCondition: z.nativeEnum(WeatherConditions).nullable(),
  groups: z.coerce.number().int().finite().nonnegative().nullable(),
  user: z.object({
    username: z.coerce.string().nullable(),
  }),
  location: z.object({
    name: z.coerce.string(),
  }),
  tallyPerson: tallyPersonArraySchema.nullable(),
  commercialActivities: commercialActivitySchema.nullable(),
});

const finalizedTallySchema = tallySchema.omit({ location: true });

const finalizedTallyArraySchema = z.array(finalizedTallySchema);

const tallyArraySchema = z.array(tallySchema);

const locationExportDailyTallysSchema = z.object({
  id: z.coerce.number().int(),
  name: z.coerce.string(),
  createdAt: z.coerce.date(),
  tally: tallyArraySchema,
});

const tallysExportIndividualTallysSchema = z.array(
  z.object({
    id: z.coerce.number().int().nonnegative().finite(),
    locationId: z.coerce.number().int().nonnegative().finite(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable(),
    animalsAmount: z.coerce.number().int().finite().nonnegative().nullable(),
    temperature: z.coerce.number().finite().nullable(),
    weatherCondition: z.nativeEnum(WeatherConditions).nullable(),
    groups: z.coerce.number().int().finite().nonnegative().nullable(),
    user: z.object({
      username: z.coerce.string().nullable(),
      id: z.string().optional(),
    }),
    location: z.object({
      name: z.coerce.string(),
    }),
    tallyPerson: tallyPersonArraySchema.nullable(),
    commercialActivities: commercialActivitySchema.nullable(),
  }),
);

const locationArrayExportDailyTallysSchema = z.array(
  locationExportDailyTallysSchema,
);

const ongoingTallyArraySchema = z.array(ongoingTallySchema);

type Tally = z.infer<typeof tallySchema>;
type personType = z.infer<typeof personSchema>;
type TallyPerson = z.infer<typeof tallyPersonSchema>;
type OngoingTally = z.infer<typeof ongoingTallySchema>;
type CommercialActivity = z.infer<typeof commercialActivitySchema>;
type FinalizedTally = z.infer<typeof finalizedTallySchema>;

export {
  personSchema,
  tallySchema,
  tallyArraySchema,
  questionsOnFormsSchema,
  tallyPersonSchema,
  tallyPersonArraySchema,
  ongoingTallySchema,
  ongoingTallyArraySchema,
  commercialActivitySchema,
  locationArrayExportDailyTallysSchema,
  tallysExportIndividualTallysSchema,
  finalizedTallyArraySchema,
};
export type {
  personType,
  Tally,
  TallyPerson,
  OngoingTally,
  CommercialActivity,
  FinalizedTally,
};
// #endregion
// #region Users
//  ------------------------------------------------------------------------------------------------------------
//  Users
//  ------------------------------------------------------------------------------------------------------------
const tableUserSchema = z.object({
  id: z.coerce.string(),
  image: z.coerce.string().nullable(),
  username: z.coerce.string().nullable(),
  email: z.coerce.string(),
  name: z.coerce.string().nullable(),
  active: z.coerce.boolean(),
  createdAt: z.coerce.date(),
  roles: z.array(z.nativeEnum(Role)),
});

export { tableUserSchema };
// #endregion
