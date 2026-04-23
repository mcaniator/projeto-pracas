type ShouldShowScaleOptionsSectionParams = {
  type: string;
  characterType: string | null;
  minValue: number | null;
  maxValue: number | null;
};

const shouldShowScaleOptionsSection = ({
  type,
  characterType,
  minValue,
  maxValue,
}: ShouldShowScaleOptionsSectionParams) => {
  if (!characterType || type !== "OPTIONS") {
    return false;
  }

  if (characterType !== "SCALE") {
    return true;
  }

  return minValue !== null && maxValue !== null;
};

export { shouldShowScaleOptionsSection };
