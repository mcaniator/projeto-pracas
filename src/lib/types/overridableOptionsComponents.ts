import type { Dayjs } from "dayjs";

export type OverridableOptionConfig = {
  isOverridable?: boolean;
};

export type OverridableOptionValue = string | number | boolean | Dayjs | null;

export type OptionValueWithOverride<
  V extends string | number | boolean = string,
> = {
  value: V;
  override: OverridableOptionValue;
};

export type AssessmentOptionValueWithOverride = {
  value: number;
  override: string | null;
};

export type CheckboxOverrideOption = OverridableOptionConfig;
export type CheckboxOverrideValue = OverridableOptionValue;
export type CheckboxValueWithOverride<
  V extends string | number | boolean = string,
> = OptionValueWithOverride<V>;

export type RadioOverrideOption = OverridableOptionConfig;
export type RadioOverrideValue = OverridableOptionValue;
export type RadioValueWithOverride<
  V extends string | number | boolean = string,
> = OptionValueWithOverride<V>;
