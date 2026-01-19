import CIconChip from "@components/ui/cIconChip";
import { IconButtonOwnProps } from "@mui/material";
import { OptionTypes, QuestionTypes } from "@prisma/client";
import { useState } from "react";
import { FaKeyboard as IconKeyboard } from "react-icons/fa";
import { IoMdCheckbox, IoMdRadioButtonOn } from "react-icons/io";

import CDialog from "../dialog/cDialog";

type QuestionTypeChipProps = {
  questionType: QuestionTypes;
  optionType?: OptionTypes | null;
  sx?: IconButtonOwnProps["sx"];
  options?: string[];
  name?: string;
};

const CQuestionTypeChip = ({
  questionType,
  optionType,
  sx,
  options,
  name,
}: QuestionTypeChipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  let icon;
  let tooltip;
  const clickable = questionType === "OPTIONS";

  if (questionType === "OPTIONS") {
    if (optionType === "RADIO") {
      icon = <IoMdRadioButtonOn />;
      tooltip =
        "Questão de múltipla escolha (botão radial). Clique para ver as opções";
    } else {
      icon = <IoMdCheckbox />;
      tooltip =
        "Questão de múltipla escolha (caixa de seleção). Clique para ver as opções";
    }
  } else {
    icon = <IconKeyboard />;
    tooltip = "Questão escrita";
  }

  const handleChipClick = () => {
    if (!clickable) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <CIconChip
        icon={icon}
        tooltip={tooltip}
        onClick={handleChipClick}
        sx={sx}
        clickable={clickable}
      />
      <CDialog
        title="Opções"
        subtitle={name}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        disableDialogActions
      >
        <>
          <div>
            {optionType === "RADIO" ?
              "Botão radial (apenas uma opção é permitida)"
            : "Múltiplas seleções permitidas"}
          </div>
          <ul className="list-disc px-6 py-3">
            {options?.map((o, index) => (
              <li key={index}>{o}</li>
            ))}
          </ul>
        </>
      </CDialog>
    </>
  );
};

export default CQuestionTypeChip;
