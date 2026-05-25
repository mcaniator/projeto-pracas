import type { QuestionResponseCharacterTypes } from "@prisma/client";
import type { Dayjs } from "dayjs";

export type OverridableOptionConfig = {
  isOverridable?: boolean;
};

export type OverridableOptionValue = string | number | boolean | Dayjs | null;

export type OverrideType = Extract<
  QuestionResponseCharacterTypes,
  "TEXT" | "NUMBER" | "BOOLEAN" | "DATE" | "TIME" | "DATETIME"
>;

export type OverrideValueByType = {
  TEXT: string | null;
  NUMBER: number | null;
  BOOLEAN: boolean | null;
  DATE: Dayjs | null;
  TIME: Dayjs | null;
  DATETIME: Dayjs | null;
};

export type OptionValueWithOverride<
  V extends string | number | boolean = string,
  O extends OverridableOptionValue = OverridableOptionValue,
> = {
  value: V;
  override: O;
};

export type AssessmentOptionValueWithOverride = {
  value: number;
  override: string | null;
};

export type CheckboxOverrideOption = OverridableOptionConfig;
export type CheckboxOverrideValue = OverridableOptionValue;
export type CheckboxValueWithOverride<
  V extends string | number | boolean = string,
  O extends CheckboxOverrideValue = CheckboxOverrideValue,
> = OptionValueWithOverride<V, O>;

export type RadioOverrideOption = OverridableOptionConfig;
export type RadioOverrideValue = OverridableOptionValue;
export type RadioValueWithOverride<
  V extends string | number | boolean = string,
  O extends RadioOverrideValue = RadioOverrideValue,
> = OptionValueWithOverride<V, O>;
