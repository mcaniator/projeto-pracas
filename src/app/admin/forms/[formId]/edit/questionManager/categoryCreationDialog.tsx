import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import CTextField from "@components/ui/cTextField";
import CDialog from "@components/ui/dialog/cDialog";
import { _categorySubmit } from "@serverActions/categoryServerActions";

const CategoryCreationDialog = ({
  open,
  categoryId,
  categoryName,
  notes,
  onClose,
  reloadCategories,
  openCategoryDeletionDialog,
}: {
  open: boolean;
  categoryId?: number;
  categoryName?: string;
  notes?: string;
  onClose: () => void;
  reloadCategories: () => void;
  openCategoryDeletionDialog: () => void;
}) => {
  const [formAction, isPending] = useResettableActionState({
    action: _categorySubmit,
    callbacks: {
      onSuccess: () => {
        reloadCategories();
      },
    },
    options: {
      loadingMessage: "Salvando categoria...",
    },
  });
  return (
    <CDialog
      isForm
      action={formAction}
      title={categoryId ? "Editar categoria" : "Criar categoria"}
      open={open}
      onClose={onClose}
      onCancel={openCategoryDeletionDialog}
      confirmChildren={categoryId ? <>Editar</> : <>Criar</>}
      cancelChildren={categoryId ? <>Excluir</> : undefined}
      cancelColor="error"
      confirmLoading={isPending}
    >
      <div className="flex flex-col">
        {categoryId && (
          <>
            <div>
              Atenção: editar esta categoria acarretará mudanças em todos os
              formulários em que ela está presente!
            </div>
            <input
              type="hidden"
              name="categoryId"
              id="categoryId"
              value={categoryId}
            />
          </>
        )}

        <CTextField
          required
          resetOnFormSubmit
          defaultValue={categoryName}
          id="name"
          name="name"
          label="Nome"
        />
        <CTextField
          resetOnFormSubmit
          defaultValue={notes}
          id="notes"
          name="notes"
          label="Observações"
        />
      </div>
    </CDialog>
  );
};

export default CategoryCreationDialog;
