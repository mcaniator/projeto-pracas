import CIconChip from "@components/ui/cIconChip";
import { QuestionResponseCharacterTypes } from "@prisma/client";
import { IconLetterCase, IconNumber123 } from "@tabler/icons-react";

type QuestionCharacterTypeChipProps = {
  characterType: QuestionResponseCharacterTypes;
};

const CQuestionCharacterTypeChip = ({
  characterType,
}: QuestionCharacterTypeChipProps) => {
  let icon;
  let tooltip;

  if (characterType === "NUMBER") {
    icon = <IconNumber123 />;
    tooltip = "Resposta numérica";
  } else {
    icon = <IconLetterCase />;
    tooltip = "Resposta em texto";
  }

  return <CIconChip icon={icon} tooltip={tooltip} />;
};

export default CQuestionCharacterTypeChip;
