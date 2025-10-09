import CDialog from "@components/ui/dialog/cDialog";
import { useHelperCard } from "@context/helperCardContext";
import { useLoadingOverlay } from "@context/loadingContext";
import { _deleteSubcategory } from "@serverActions/categoryServerActions";
import { useActionState, useEffect, useState } from "react";

const SubcategoryDeletionDialog = ({
  subcategoryId,
  subcategoryName,
  open,
  onClose,
  reloadCategories,
}: {
  subcategoryId: number;
  subcategoryName: string;
  open: boolean;
  onClose: () => void;
  reloadCategories: () => void;
}) => {
  const [state, formAction, isPending] = useActionState(
    _deleteSubcategory,
    null,
  );
  const [showConflictInfo, setShowConflictInfo] = useState(false);
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();

  const handleClose = () => {
    setShowConflictInfo(false);
    onClose();
  };

  useEffect(() => {
    setShowConflictInfo(true);
    helperCardProcessResponse(state?.responseInfo);
    if (state?.responseInfo.statusCode === 200) {
      handleClose();
      reloadCategories();
    }
  }, [state]);

  useEffect(() => {
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Excluindo subcategoria..." });
    } else {
      setLoadingOverlay({ show: false });
    }
  }, [isPending, setLoadingOverlay]);
  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={handleClose}
      confirmChildren={<>Excluir</>}
      title="Excluir subcategoria"
      subtitle={subcategoryName}
    >
      <div className="flex flex-col gap-1">
        {(state?.responseInfo.statusCode !== 409 || !showConflictInfo) && (
          <h6 className="text-base font-semibold text-red-500">
            Aviso: Esta ação também excluirá questões associadas a esta
            subcategoria!
          </h6>
        )}

        <input
          type="hidden"
          id="subcategoryId"
          name="subcategoryId"
          value={subcategoryId}
        />
        {state?.responseInfo.statusCode === 409 && showConflictInfo && (
          <div className="flex flex-col gap-1">
            <h5 className="text-center text-xl font-semibold text-red-500">
              {`Esta subcategoria possui questões em ${state.formsWithQuestions.length} formulários:`}
            </h5>
            <ul className="list-inside list-decimal space-y-2 break-words pl-3 font-semibold">
              {state.formsWithQuestions.map((form, index) => {
                return (
                  <li
                    key={index}
                    className="px-2 outline outline-1 outline-black"
                  >
                    {form.name}
                    <ul className="list-inside list-disc pl-5 font-normal">
                      {form.formItems.map((fi, index) => {
                        return <li key={index}>{fi.question?.name}</li>;
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </CDialog>
  );
};

export default SubcategoryDeletionDialog;
