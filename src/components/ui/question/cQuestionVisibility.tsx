import CIconChip from "@components/ui/cIconChip";
import { IconWorld } from "@tabler/icons-react";

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
    return;
  }

  return <CIconChip icon={icon} tooltip={tooltip} variant={variant} />;
};

export default CQuestionVisibilityChip;
