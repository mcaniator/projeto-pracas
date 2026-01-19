import { Role } from "@prisma/client";

export type SystemSection = "PARK" | "FORM" | "ASSESSMENT" | "TALLY" | "USER";
export const rows: { title: string; section: SystemSection }[] = [
  {
    title: "Praças",
    section: "PARK",
  },
  {
    title: "Formulários",
    section: "FORM",
  },
  {
    title: "Avaliações físicas",
    section: "ASSESSMENT",
  },
  {
    title: "Contagens",
    section: "TALLY",
  },
  {
    title: "Usuários",
    section: "USER",
  },
];

export const warningColors = {
  none: "bg-gray-400 hover:bg-gray-500",
  level0: "bg-white hover:bg-gray-100",
  level1: "bg-yellow-500 hover:bg-yellow-600",
  level2: "bg-orange-600 hover:bg-orange-700",
  level3: "bg-red-500 hover:bg-red-600",
};

export const roles = [
  {
    section: "PARK",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "PARK",
    name: "Visualizador",
    value: "PARK_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "PARK",
    name: "Administrador",
    value: "PARK_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "FORM",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "FORM",
    name: "Visualizador",
    value: "FORM_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "FORM",
    name: "Administrador",
    value: "FORM_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "ASSESSMENT",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "ASSESSMENT",
    name: "Visualizador",
    value: "ASSESSMENT_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "ASSESSMENT",
    name: "Editor",
    value: "ASSESSMENT_EDITOR",
    color: warningColors.level2,
  },
  {
    section: "ASSESSMENT",
    name: "Administrador",
    value: "ASSESSMENT_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "TALLY",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "TALLY",
    name: "Visualizador",
    value: "TALLY_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "TALLY",
    name: "Editor",
    value: "TALLY_EDITOR",
    color: warningColors.level2,
  },
  {
    section: "TALLY",
    name: "Administrador",
    value: "TALLY_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "USER",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "USER",
    name: "Visualizador",
    value: "USER_VIEWER",
    color: warningColors.level2,
  },
  {
    section: "USER",
    name: "Administrador",
    value: "USER_MANAGER",
    color: warningColors.level3,
  },
] as {
  section: SystemSection;
  name: string;
  value: Role | null;
  color: string;
}[];
