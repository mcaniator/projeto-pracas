import CRadioGroup from "@/components/ui/cRadioGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconCheck } from "@tabler/icons-react";
import { useMemo, useState } from "react";

const ChooseResponsesSourceDialog = ({
  savedSource,
  draftSource,
  applyDraftAssessmentValues,
  applySavedAssessmentValues,
}: {
  savedSource: { username: string; updatedAt: Date };
  draftSource: { username: string; updatedAt: Date };
  applyDraftAssessmentValues: () => void;
  applySavedAssessmentValues: () => void;
}) => {
  const options = useMemo(() => {
    return [
      {
        value: 0,
        label: `Avaliação salva por ${savedSource.username} em ${savedSource.updatedAt.toLocaleString()}`,
      },
      {
        value: 1,
        label: `Rascunho de ${draftSource.username} atualizado em ${draftSource.updatedAt.toLocaleString()}`,
      },
    ];
  }, [draftSource, savedSource]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const apply = () => {
    if (selectedOption === 0) {
      applySavedAssessmentValues();
    } else {
      applyDraftAssessmentValues();
    }
  };
  return (
    <CDialog
      open={true}
      removeCloseButton
      disableBackdropClose
      onConfirm={apply}
      disableConfirmButton={selectedOption === null}
      confirmChildren={<IconCheck />}
      title="A avaliação salva foi atualizada!"
    >
      <div className="flex flex-col gap-2">
        <p>
          Existe um rascunho de respostas, mas a avaliação salva foi atualizada
          depois desse rascunho.
        </p>
        <CRadioGroup
          label="Escolha qual versão deseja usar"
          options={options}
          value={selectedOption}
          getOptionLabel={(o) => o.label}
          getOptionValue={(o) => o.value}
          onChange={(v) => {
            setSelectedOption(v);
          }}
        />
      </div>
    </CDialog>
  );
};

export default ChooseResponsesSourceDialog;
