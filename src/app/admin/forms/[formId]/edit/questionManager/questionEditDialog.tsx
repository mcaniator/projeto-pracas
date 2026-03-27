import QuestionIconPicker from "@/app/admin/forms/[formId]/edit/questionManager/questionIconPicker";
import CIconChip from "@/components/ui/cIconChip";
import CSwitch from "@/components/ui/cSwtich";
import { useHelperCard } from "@components/context/helperCardContext";
import { useLoadingOverlay } from "@components/context/loadingContext";
import CTextField from "@components/ui/cTextField";
import CDialog from "@components/ui/dialog/cDialog";
import { _questionUpdate } from "@lib/serverFunctions/serverActions/questionUtil";
import { IconHelp } from "@tabler/icons-react";
import { useActionState, useEffect, useState } from "react";

const QuestionEditDialog = ({
  questionId,
  questionName,
  iconKey,
  isPublic,
  notes,
  categoryName,
  subcategoryName,
  open,
  onClose,
  reloadCategories,
}: {
  questionId: number;
  questionName: string;
  iconKey: string;
  isPublic: boolean;
  notes: string | null;
  categoryName: string;
  subcategoryName?: string | null;
  open: boolean;
  onClose: () => void;
  reloadCategories: () => void;
}) => {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const initialState = {
    responseInfo: { statusCode: 0 },
  };

  const [state, formAction, isPending] = useActionState(
    _questionUpdate,
    initialState,
  );

  const [isPublicState, setIsPublicState] = useState(isPublic);

  const [selectedIconKey, setSelectedIconKey] = useState<string>(iconKey);

  useEffect(() => {
    helperCardProcessResponse(state.responseInfo);
    if (state.responseInfo.statusCode === 200) {
      reloadCategories();
    }
  }, [state, helperCardProcessResponse]);

  useEffect(() => {
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Atualizando questão..." });
    } else {
      setLoadingOverlay({ show: false });
    }
  }, [isPending, setLoadingOverlay]);

  useEffect(() => {
    setSelectedIconKey(iconKey);
    setIsPublicState(isPublic);
  }, [questionId, iconKey, isPublic]);

  return (
    <CDialog
      isForm
      title="Editar questão"
      action={formAction}
      onClose={onClose}
      fullScreen
      open={open}
      confirmChildren={<>Editar</>}
    >
      <div className="flex flex-col">
        <div>{`Categoria: ${categoryName}`}</div>
        {subcategoryName && <div>{`Subcategoria: ${subcategoryName}`}</div>}

        <div>
          Atenção: editar esta questão acarretará mudanças em todos os
          formulários em que ela está presente!
        </div>
        <input
          type="hidden"
          name="questionId"
          id="questionId"
          value={questionId}
        />
        <input
          type="hidden"
          name="iconKey"
          id="iconKey"
          value={selectedIconKey}
        />
        <CTextField
          required
          defaultValue={questionName}
          maxCharacters={255}
          label="Nome"
          id="questionName"
          name="questionName"
        />
        <CTextField
          label="Observações"
          defaultValue={notes}
          maxCharacters={255}
          id="notes"
          name="notes"
        />
        <div className="flex items-center gap-1">
          <input
            type="hidden"
            id="isPublic"
            name="isPublic"
            value={isPublicState ? "true" : "false"}
          />
          <CSwitch
            checked={isPublicState}
            label="Respostas públicas"
            name="isPublic"
            id="isPublic"
            onChange={(e) => {
              setIsPublicState(e.target.checked);
            }}
          />
          <CIconChip
            icon={<IconHelp />}
            tooltip="Respostas dessa questão serão visíveis publicamente em avaliações também visíveis publicamente"
          />
        </div>
        <QuestionIconPicker
          selectedIconKey={selectedIconKey}
          onChange={setSelectedIconKey}
        />
      </div>
    </CDialog>
  );
};

export default QuestionEditDialog;
