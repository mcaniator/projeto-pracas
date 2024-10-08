import { z } from "zod";

const basicAnswerSchema = z.object({
  name: z
    .string({ required_error: "Esse campo é obrigatório" })
    .min(1, { message: "Esse campo é obrigatório" })
    .max(255, { message: "Valor excedou o limite de caracteres" }),
  firstStreet: z
    .string({ required_error: "Esse campo é obrigatório" })
    .min(1, { message: "Esse campo é obrigatório" })
    .max(255, { message: "Valor excedou o limite de caracteres" }),
  secondStreet: z
    .string({ required_error: "Esse campo é obrigatório" })
    .min(1, { message: "Esse campo é obrigatório" })
    .max(255, { message: "Valor excedou o limite de caracteres" }),
});
const basicAnswerLabels = ["Nome", "Primeira Rua", "Segunda Rua"] as const;
const basicAnswerDescriptions = [
  undefined,
  "Uma das ruas da interseção",
  "A outra rua da interseção",
] as const;
const basicAnswerMap: {
  [Property in (typeof basicAnswerLabels)[number]]: {
    label: keyof z.infer<typeof basicAnswerSchema>;
    description: (typeof basicAnswerDescriptions)[number];
  };
} = {
  Nome: { label: "name", description: undefined },
  "Primeira Rua": {
    label: "firstStreet",
    description: "Uma das ruas da interseção",
  },
  "Segunda Rua": {
    label: "secondStreet",
    description: "A outra rua da interseção",
  },
};

const extraAnswerSchema = z.object({
  creationYear: z
    .string() // the date method requires day and month and these aren't needed so using string is a better solution
    .min(4, { message: "Esse valor não é um ano válido" })
    .max(4, { message: "Esse valor não é um ano válido" })
    .optional()
    .refine(
      (val) => {
        if (val === undefined) return true;

        // this checks if the value is a number, it is necessary because if we typed this
        // value as a number textual inputs would show up as NaN which is weird for the user
        return parseInt(val) + "" === val;
      },
      { message: "Esse valor não é um ano válido" },
    ),
  lastMaintenanceYear: z
    .string() // same issue as the above value
    .min(4, { message: "Esse valor não é um ano válido" })
    .max(4, { message: "Esse valor não é um ano válido" })
    .optional()
    .refine(
      (val) => {
        if (val === undefined) return true;

        return parseInt(val) + "" === val;
      },
      { message: "Esse valor não é um ano válido" },
    ),
  overseeingMayor: z
    .string()
    .max(255, { message: "Valor excedou o limite de caracteres" })
    .optional(),
  legislation: z
    .string()
    .max(255, { message: "Valor excedou o limite de caracteres" })
    .optional(),
  legalArea: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined) return true;

        return parseInt(val) + "" === val;
      },
      { message: "Esse valor não é um número válido" },
    ),
  incline: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined) return true;

        return parseInt(val) + "" === val;
      },
      { message: "Esse valor não é um número válido" },
    ),
});
const extraAnswerLabels = [
  "Ano de Criação",
  "Último Ano de Manutenção",
  "Prefeito Criador",
  "Legislação",
  "Área Registrada na Prefeitura",
  "Inclinação",
] as const;
const extraAnswerDescriptions = [
  undefined,
  undefined,
  undefined,
  undefined,
  'Digite apenas os números do valor em m² e use "." como separador decimal',
  'Digite apenas os números do valor em º e use "." como separador decimal',
] as const;
const extraAnswerMap: {
  [Property in (typeof extraAnswerLabels)[number]]: {
    label: keyof z.infer<typeof extraAnswerSchema>;
    description: (typeof extraAnswerDescriptions)[number];
  };
} = {
  "Ano de Criação": {
    label: "creationYear",
    description: undefined,
  },
  "Último Ano de Manutenção": {
    label: "lastMaintenanceYear",
    description: undefined,
  },
  "Prefeito Criador": {
    label: "overseeingMayor",
    description: undefined,
  },
  Legislação: {
    label: "legislation",
    description: undefined,
  },
  "Área Registrada na Prefeitura": {
    label: "legalArea",
    description:
      'Digite apenas os números do valor em m² e use "." como separador decimal',
  },
  Inclinação: {
    label: "incline",
    description:
      'Digite apenas os números do valor em º e use "." como separador decimal',
  },
};

export {
  basicAnswerSchema,
  basicAnswerLabels,
  basicAnswerDescriptions,
  basicAnswerMap,
  extraAnswerSchema,
  extraAnswerLabels,
  extraAnswerDescriptions,
  extraAnswerMap,
};
