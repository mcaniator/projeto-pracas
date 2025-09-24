"use client";

import CToggleButtonGroup from "@components/ui/cToggleButtonGroup";
import CDialog from "@components/ui/dialog/cDialog";
import { Dispatch, SetStateAction, useState } from "react";

import CalculationCreation from "./calculationCreation";
import Calculations from "./calculations";
import { FormEditorTree } from "./clientV2";

const CalculationDialog = ({
  formTree,
  openCalculationDialog,
  setOpenCalculationModal,
}: {
  formTree: FormEditorTree;
  openCalculationDialog: boolean;
  setOpenCalculationModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const [calculationsDialogState, setCalculationsDialogState] = useState(0);
  const [enableCalculationSave, setEnableCalculationSave] = useState(false);
  return (
    <CDialog
      title="Cálculos"
      subtitle="Cálculos preenchem automaticamente o valor de uma questão"
      open={openCalculationDialog}
      fullScreen
      onClose={() => {
        setOpenCalculationModal(false);
      }}
      confirmChildren={<>Criar</>}
      disableDialogActions={calculationsDialogState === 0}
      disableConfirmButton={!enableCalculationSave}
      onConfirm={() => {
        console.log("CONFIRM");
      }}
    >
      <CToggleButtonGroup
        className="mt-2"
        value={calculationsDialogState}
        getLabel={(a) => a.label}
        getValue={(a) => a.id}
        options={[
          { id: 0, label: "Criados" },
          { id: 1, label: "Criar" },
        ]}
        onChange={(e, val) => {
          setCalculationsDialogState(val.id);
        }}
      />
      {calculationsDialogState === 0 && <Calculations />}
      {calculationsDialogState === 1 && (
        <CalculationCreation
          formTree={formTree}
          setEnableCalculationSave={setEnableCalculationSave}
        />
      )}
    </CDialog>
  );
};

export default CalculationDialog;
