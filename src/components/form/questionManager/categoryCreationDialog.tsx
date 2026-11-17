import { useCategorySubmit } from "@/lib/serverFunctions/apiCalls/category";
import CTextField from "@components/ui/cTextField";
import CDialog from "@components/ui/dialog/cDialog";
import type { FormUse } from "@prisma/client";
import { FormEventHandler } from "react";

const CategoryCreationDialog = ({
  formUse,
  open,
  categoryId,
  cloneCategory,
  categoryName,
  notes,
  onClose,
  reloadCategories,
  openCategoryDeletionDialog,
}: {
  formUse: FormUse;
  open: boolean;
  categoryId?: number;
  cloneCategory?: { id: number; name: string; notes: string | null };
  categoryName?: string;
  notes?: string;
  onClose: () => void;
  reloadCategories: () => void;
  openCategoryDeletionDialog: () => void;
}) => {
  const [categorySubmit, isPending] = useCategorySubmit({
    callbacks: {
      onSuccess: () => {
        reloadCategories();
      },
    },
  });
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void categorySubmit({
      data: new FormData(event.currentTarget),
      projectOptions: { loadingMessage: "Salvando categoria..." },
    });
  };

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      title={
        cloneCategory ? "Clonar categoria"
        : categoryId ?
          "Editar categoria"
        : "Criar categoria"
      }
      subtitle={cloneCategory?.name}
      open={open}
      onClose={onClose}
      onCancel={openCategoryDeletionDialog}
      confirmChildren={categoryId && !cloneCategory ? <>Editar</> : <>Criar</>}
      cancelChildren={categoryId && !cloneCategory ? <>Excluir</> : undefined}
      cancelColor="error"
      confirmLoading={isPending}
    >
      <div className="flex flex-col">
        <input type="hidden" name="formUse" value={formUse} />
        {categoryId && !cloneCategory && (
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
          key={cloneCategory?.id ?? categoryId ?? "new-category"}
          defaultValue={
            cloneCategory ? `${cloneCategory.name} (cópia)` : categoryName
          }
          id="name"
          name="name"
          label="Nome"
        />
        <CTextField
          multiline
          resetOnFormSubmit
          key={`${cloneCategory?.id ?? categoryId ?? "new-category"}-notes`}
          defaultValue={cloneCategory?.notes ?? notes}
          id="notes"
          name="notes"
          label="Observações"
        />
      </div>
    </CDialog>
  );
};

export default CategoryCreationDialog;
