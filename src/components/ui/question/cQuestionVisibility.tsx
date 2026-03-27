import CIconChip from "@components/ui/cIconChip";
import { IconWorld, IconWorldOff } from "@tabler/icons-react";

type QuestionVisibilityChipProps = {
  isPublic: boolean;
};

const CQuestionVisibilityChip = ({ isPublic }: QuestionVisibilityChipProps) => {
  let icon;
  let tooltip;

  const variant = isPublic ? "default" : "disabled";

  if (isPublic) {
    icon = <IconWorld />;
    tooltip = "Respostas a esta questão são visíveis publicamente";
  } else {
    icon = <IconWorldOff />;
    tooltip = "Respostas a esta questão não são visíveis publicamente";
  }

  return <CIconChip icon={icon} tooltip={tooltip} variant={variant} />;
};

export default CQuestionVisibilityChip;
