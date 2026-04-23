import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import CDialog from "@components/ui/dialog/cDialog";
import { _deleteCategory } from "@serverActions/categoryServerActions";
import { useState } from "react";

const CategoryDeletionDialog = ({
  categoryId,
  categoryName,
  open,
  onClose,
  reloadCategories,
}: {
  categoryId: number;
  categoryName: string;
  open: boolean;
  onClose: () => void;
  reloadCategories: () => void;
}) => {
  const [showConflictInfo, setShowConflictInfo] = useState(false);

  const handleClose = () => {
    setShowConflictInfo(false);
    onClose();
  };

  const [formAction, isPending, state] = useResettableActionState({
    action: _deleteCategory,
    callbacks: {
      onSuccess: () => {
        handleClose();
        reloadCategories();
      },
      onError: (state) => {
        if (!state) {
          setShowConflictInfo(false);
          return;
        }

        if (state.responseInfo.statusCode === 409) {
          setShowConflictInfo(true);
          return;
        }

        setShowConflictInfo(false);
      },
    },
    options: {
      loadingMessage: "Excluindo categoria...",
    },
  });
  const conflictForms = state?.data?.formsWithQuestions ?? [];

  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={handleClose}
      confirmChildren={<>Excluir</>}
      title="Excluir categoria"
      subtitle={categoryName}
      confirmLoading={isPending}
    >
      <div className="flex flex-col gap-1">
        {!showConflictInfo && (
          <h6 className="text-base font-semibold text-red-500">
            Aviso: Esta ação também excluirá subcategorias e questões
            associadas!
          </h6>
        )}

        <input
          type="hidden"
          id="categoryId"
          name="categoryId"
          value={categoryId}
        />
        {showConflictInfo && (
          <div className="flex flex-col gap-1">
            <h5 className="text-center text-xl font-semibold text-red-500">
              {`Esta categoria possui questões em ${conflictForms.length} formulários:`}
            </h5>
            <ul className="list-inside list-decimal space-y-2 break-words pl-3 font-semibold">
              {conflictForms.map((form, index) => {
                return (
                  <li
                    key={index}
                    className="px-2 outline outline-1 outline-black"
                  >
                    {form.name}
                    <ul className="list-inside list-disc pl-5 font-normal">
                      {form.formItems.map((fi, itemIndex) => {
                        return <li key={itemIndex}>{fi.question?.name}</li>;
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

export default CategoryDeletionDialog;
