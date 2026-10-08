import CRadioGroup from "@/components/ui/cRadioGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconCheck } from "@tabler/icons-react";
import { useMemo, useState } from "react";

const ChooseModularTallySourceDialog = ({
  savedSource,
  draftSource,
  applyDraftModularTallyValues,
  applySavedModularTallyValues,
}: {
  savedSource: { username: string; updatedAt: Date };
  draftSource: { username: string; updatedAt: Date };
  applyDraftModularTallyValues: () => void;
  applySavedModularTallyValues: () => void;
}) => {
  const options = useMemo(
    () => [
      {
        value: 0,
        label: `Contagem salva por ${savedSource.username} em ${savedSource.updatedAt.toLocaleString()}`,
      },
      {
        value: 1,
        label: `Rascunho de ${draftSource.username} atualizado em ${draftSource.updatedAt.toLocaleString()}`,
      },
    ],
    [draftSource, savedSource],
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const apply = () => {
    if (selectedOption === 0) {
      applySavedModularTallyValues();
    } else {
      applyDraftModularTallyValues();
    }
  };

  return (
    <CDialog
      open
      removeCloseButton
      disableBackdropClose
      onConfirm={apply}
      disableConfirmButton={selectedOption === null}
      confirmChildren={<IconCheck />}
      title="A contagem salva foi atualizada!"
    >
      <div className="flex flex-col gap-2">
        <p>
          Existe um rascunho da contagem, mas a versão salva foi atualizada
          depois desse rascunho.
        </p>
        <CRadioGroup
          label="Escolha qual versão deseja usar"
          options={options}
          value={selectedOption}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          onChange={(value) => setSelectedOption(value)}
        />
      </div>
    </CDialog>
  );
};

export default ChooseModularTallySourceDialog;
