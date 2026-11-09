"use client";

import CRadioGroup from "@/components/ui/cRadioGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";

const ChooseBehavioralMapSourceDialog = ({
  savedSource,
  draftSource,
  onChooseDraft,
  onChooseSaved,
}: {
  savedSource: { username: string; updatedAt: Date };
  draftSource: { username: string; updatedAt: Date };
  onChooseDraft: () => void;
  onChooseSaved: () => void;
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const options = [
    {
      value: 0,
      label: `Mapa salvo por ${savedSource.username} em ${savedSource.updatedAt.toLocaleString()}`,
    },
    {
      value: 1,
      label: `Rascunho de ${draftSource.username} atualizado em ${draftSource.updatedAt.toLocaleString()}`,
    },
  ];

  return (
    <CDialog
      open
      removeCloseButton
      disableBackdropClose
      onConfirm={() => {
        if (selectedOption === 0) onChooseSaved();
        if (selectedOption === 1) onChooseDraft();
      }}
      disableConfirmButton={selectedOption === null}
      confirmChildren={<IconCheck />}
      title="O mapa comportamental salvo foi atualizado!"
    >
      <div className="flex flex-col gap-2">
        <p>Existe um rascunho local e a versão salva foi atualizada depois dele.</p>
        <CRadioGroup
          label="Escolha qual versão deseja usar"
          options={options}
          value={selectedOption}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          onChange={setSelectedOption}
        />
      </div>
    </CDialog>
  );
};

export default ChooseBehavioralMapSourceDialog;
