import CIconChip from "@components/ui/cIconChip";
import { IconButtonOwnProps } from "@mui/material";
import { OptionTypes, QuestionTypes } from "@prisma/client";
import { FaKeyboard as IconKeyboard } from "react-icons/fa";
import { IoMdCheckbox, IoMdRadioButtonOn } from "react-icons/io";

type QuestionTypeChipProps = {
  questionType: QuestionTypes;
  optionType?: OptionTypes | null;
  sx?: IconButtonOwnProps["sx"];
  onClick?: () => void;
};

const CQuestionTypeChip = ({
  questionType,
  optionType,
  sx,
  onClick,
}: QuestionTypeChipProps) => {
  let icon;
  let tooltip;

  if (questionType === "OPTIONS") {
    if (optionType === "RADIO") {
      icon = <IoMdRadioButtonOn />;
      tooltip = "Questão de múltipla escolha (botão radial)";
    } else {
      icon = <IoMdCheckbox />;
      tooltip = "Questão de múltipla escolha (caixa de seleção)";
    }
  } else {
    icon = <IconKeyboard />;
    tooltip = "Questão escrita";
  }

  return <CIconChip icon={icon} tooltip={tooltip} onClick={onClick} sx={sx} />;
};

export default CQuestionTypeChip;
