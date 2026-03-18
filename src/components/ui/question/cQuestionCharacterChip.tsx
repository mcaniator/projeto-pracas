import CIconChip from "@components/ui/cIconChip";
import { IconButtonOwnProps } from "@mui/material";
import { QuestionResponseCharacterTypes } from "@prisma/client";
import {
  IconLetterCase,
  IconNumber123,
  IconPercentage,
} from "@tabler/icons-react";

type QuestionCharacterTypeChipProps = {
  characterType: QuestionResponseCharacterTypes;
  sx?: IconButtonOwnProps["sx"];
};

const CQuestionCharacterTypeChip = ({
  characterType,
  sx,
}: QuestionCharacterTypeChipProps) => {
  let icon;
  let tooltip;

  if (characterType === "NUMBER") {
    icon = <IconNumber123 />;
    tooltip = "Resposta numérica";
  } else if (characterType === "PERCENTAGE") {
    icon = <IconPercentage />;
    tooltip = "Resposta em porcentagem";
  } else if (characterType === "TEXT") {
    icon = <IconLetterCase />;
    tooltip = "Resposta em texto";
  } else if (characterType === "BOOLEAN") {
    return null;
  }

  return <CIconChip icon={icon} tooltip={tooltip} sx={sx} />;
};

export default CQuestionCharacterTypeChip;
