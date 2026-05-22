import CIconChip from "@components/ui/cIconChip";
import { IconButtonOwnProps } from "@mui/material";
import { QuestionResponseCharacterTypes } from "@prisma/client";
import {
  IconArrowAutofitRight,
  IconCalendarClock,
  IconCalendarEvent,
  IconClock,
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

  switch (characterType) {
    case "NUMBER":
      icon = <IconNumber123 />;
      tooltip = "Resposta numérica";
      break;
    case "PERCENTAGE":
      icon = <IconPercentage />;
      tooltip = "Resposta em porcentagem";
      break;
    case "TEXT":
      icon = <IconLetterCase />;
      tooltip = "Resposta em texto";
      break;
    case "SCALE":
      icon = <IconArrowAutofitRight />;
      tooltip = "Resposta em escala";
      break;
    case "DATE":
      icon = <IconCalendarEvent />;
      tooltip = "Resposta em data";
      break;
    case "TIME":
      icon = <IconClock />;
      tooltip = "Resposta em hora";
      break;
    case "DATETIME":
      icon = <IconCalendarClock />;
      tooltip = "Resposta em data e hora";
      break;
    case "BOOLEAN":
      return null;
  }

  return <CIconChip icon={icon} tooltip={tooltip} sx={sx} />;
};

export default CQuestionCharacterTypeChip;
