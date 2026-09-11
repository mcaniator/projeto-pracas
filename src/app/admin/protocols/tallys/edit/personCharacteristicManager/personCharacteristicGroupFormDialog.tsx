"use client";

import CSwitch from "@/components/ui/cSwtich";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { useSavePersonCharacteristicGroup } from "@/lib/serverFunctions/apiCalls/personCharacteristic";
import { Chip, Step, StepLabel, Stepper } from "@mui/material";
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import type { PersonCharacteristicGroup } from "./types";

const steps = ["Configuração", "Prévia"];

const PersonCharacteristicGroupFormDialog = ({
  group,
  open,
  onClose,
  onSaved,
  onRequestDelete,
}: {
  group: PersonCharacteristicGroup | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onRequestDelete: () => void;
}) => {
  const isEditing = !!group;
  const [title, setTitle] = useState("");
  const [isTagGroup, setIsTagGroup] = useState(false);
  const [step, setStep] = useState(0);

  const [savePersonCharacteristicGroup, isSaving] =
    useSavePersonCharacteristicGroup({
      callbacks: {
        onSuccess: () => {
          onSaved();
          onClose();
        },
      },
    });

  useEffect(() => {
    if (!open) return;
    setTitle(group?.title ?? "");
    setIsTagGroup(group?.isTagGroup ?? false);
    setStep(0);
  }, [group, open]);

  const handleCancel = () => {
    if (step === 1) {
      setStep(0);
      return;
    }

    if (isEditing) {
      onClose();
      onRequestDelete();
      return;
    }

    onClose();
  };

  return (
    <CDialog
      open={open}
      onClose={onClose}
      fullScreen
      title={isEditing ? "Editar grupo" : "Criar grupo"}
      confirmChildren={step === 0 ? <IconArrowForwardUp /> : <IconCheck />}
      cancelChildren={
        isEditing && step === 0 ? <IconTrash /> : <IconArrowBackUp />
      }
      cancelColor={isEditing && step === 0 ? "error" : "primary"}
      disableCancelButton={step === 0}
      disableConfirmButton={!title.trim() || isSaving}
      confirmLoading={isSaving}
      onCancel={handleCancel}
      onConfirm={() => {
        if (step === 0) {
          setStep(1);
          return;
        }

        void savePersonCharacteristicGroup({
          data: {
            personCharacteristicGroupId: group?.id,
            title,
            isTagGroup,
          },
          projectOptions: { loadingMessage: "Salvando grupo..." },
        });
      }}
    >
      <div className="flex h-full flex-col gap-4">
        <Stepper activeStep={step}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {step === 0 ?
          <div className="flex flex-col gap-4">
            {isEditing && (
              <p className="text-sm text-gray-700">
                Alterações no nome serão refletidas nos protocolos que usam
                este grupo.
              </p>
            )}
            <CTextField
              label="Título"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <CSwitch
              checked={isTagGroup}
              label="Grupo de tags"
              onChange={(_, checked) => setIsTagGroup(checked)}
            />
            <p className="text-sm text-gray-700">
              Desativado: cada pessoa recebe uma única característica. Ativado:
              pode receber nenhuma, uma ou várias tags.
            </p>
          </div>
        : <Chip
            color="error"
            icon={<IconAlertTriangle />}
            label="Não implementado"
          />}
      </div>
    </CDialog>
  );
};

export default PersonCharacteristicGroupFormDialog;
