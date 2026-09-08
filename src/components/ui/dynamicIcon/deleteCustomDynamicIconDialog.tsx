"use client";

import CCircularProgress from "@/components/ui/CCircularProgress";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import type { FetchCustomDynamicIconDetailsResponse } from "@/lib/serverFunctions/queries/questionIcon";
import {
  useDeleteCustomDynamicIcon,
  useFetchCustomDynamicIconDetails,
} from "@apiCalls/questionIcon";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type DeleteCustomDynamicIconDialogProps = {
  open: boolean;
  iconId?: number;
  onClose: () => void;
  reload: () => void;
};

type CustomDynamicIcon =
  NonNullable<FetchCustomDynamicIconDetailsResponse>["customDynamicIcon"];

const DeleteCustomDynamicIconDialog = ({
  open,
  iconId,
  onClose,
  reload,
}: DeleteCustomDynamicIconDialogProps) => {
  const [customDynamicIcon, setCustomDynamicIcon] =
    useState<CustomDynamicIcon | null>(null);
  const [questionNames, setQuestionNames] = useState<string[]>([]);

  const [fetchCustomDynamicIconDetails, isLoadingCustomDynamicIconDetails] =
    useFetchCustomDynamicIconDetails({
      callbacks: {
        onSuccess: (response) => {
          setCustomDynamicIcon(response.data?.customDynamicIcon ?? null);
        },
        onError: () => {
          setCustomDynamicIcon(null);
        },
      },
    });

  const [deleteCustomDynamicIcon, isDeletingCustomDynamicIcon] =
    useDeleteCustomDynamicIcon({
      callbacks: {
        onSuccess: () => {
          reload();
          onClose();
        },
        onError: (response) => {
          setQuestionNames(response.data?.questionNames ?? []);
        },
      },
    });

  useEffect(() => {
    if (!open) return;

    setCustomDynamicIcon(null);
    setQuestionNames([]);
    if (!iconId) return;

    void fetchCustomDynamicIconDetails({ params: { iconId } });
  }, [fetchCustomDynamicIconDetails, iconId, open]);

  const handleConfirm = () => {
    if (!iconId) return;

    setQuestionNames([]);
    void deleteCustomDynamicIcon({ data: { iconId } });
  };

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Excluir ícone personalizado"
      confirmChildren={<IconTrash />}
      confirmColor="error"
      onConfirm={handleConfirm}
      confirmLoading={isDeletingCustomDynamicIcon}
      disableConfirmButton={
        isLoadingCustomDynamicIconDetails || !customDynamicIcon
      }
    >
      {isLoadingCustomDynamicIconDetails ?
        <div className="flex min-h-72 items-center justify-center">
          <CCircularProgress label="Carregando ícone..." />
        </div>
      : customDynamicIcon ?
        <div className="flex flex-col gap-2">
          <div className="flex justify-center rounded border border-gray-200 p-4">
            <CDynamicIcon iconKey={`custom:${customDynamicIcon.name}`} />
          </div>
          <CTextField label="Nome" value={customDynamicIcon.name} readOnly />
          {customDynamicIcon.aliases.length > 0 ?
            customDynamicIcon.aliases.map((alias, index) => (
              <CTextField
                key={alias}
                label={`Nome alternativo ${index + 1}`}
                value={alias}
                readOnly
              />
            ))
          : <CTextField label="Nomes alternativos" value="Nenhum" readOnly />}

          {questionNames.length > 0 && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              <p>
                Este ícone não pode ser excluído porque é usado pelas questões:
              </p>
              <ul className="list-disc pl-5">
                {questionNames.map((questionName, index) => (
                  <li key={`${questionName}-${index}`}>{questionName}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      : <div className="py-6 text-center text-sm text-gray-600">
          Ícone personalizado não encontrado.
        </div>
      }
    </CDialog>
  );
};

export default DeleteCustomDynamicIconDialog;
