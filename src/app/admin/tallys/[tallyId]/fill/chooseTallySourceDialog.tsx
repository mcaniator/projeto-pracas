import CRadioGroup from "@/components/ui/cRadioGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconCheck } from "@tabler/icons-react";
import { useMemo, useState } from "react";

const ChooseTallySourceDialog = ({
  serverSource,
  localSource,
  applyLocalTallyValues,
  applyServerTallyValues,
}: {
  serverSource: { username: string; updatedAt: Date };
  localSource: { username: string; updatedAt: Date };
  applyLocalTallyValues: () => void;
  applyServerTallyValues: () => void;
}) => {
  const options = useMemo(() => {
    return [
      {
        value: 0,
        label: `Contagem atualizada no servidor por ${serverSource.username} em ${serverSource.updatedAt.toLocaleString()}`,
      },
      {
        value: 1,
        label: `Contagem atualizada localmente por ${localSource.username} em ${localSource.updatedAt.toLocaleString()}`,
      },
    ];
  }, [serverSource, localSource]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const apply = () => {
    if (selectedOption === 0) {
      applyServerTallyValues();
    } else {
      applyLocalTallyValues();
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
      title="Contagem atualizada no servidor!"
    >
      <div className="flex flex-col gap-2">
        <p>
          Existem dados salvos neste dispositivo, mas a contagem foi atualizada
          no servidor depois desse salvamento local.
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

export default ChooseTallySourceDialog;
