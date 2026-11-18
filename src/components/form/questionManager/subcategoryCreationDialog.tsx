import { useSubcategorySubmit } from "@/lib/serverFunctions/apiCalls/category";
import CTextField from "@components/ui/cTextField";
import CDialog from "@components/ui/dialog/cDialog";
import type { FormUse } from "@prisma/client";
import { FormEventHandler } from "react";

const SubcategoryCreationDialog = ({
  formUse,
  categoryId,
  categoryName,
  subcategoryId,
  cloneSubcategory,
  subcategoryName,
  notes,
  open,
  onClose,
  reloadCategories,
  openSubcategoryDeletionDialog,
}: {
  formUse: FormUse;
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  cloneSubcategory?: { id: number; name: string; notes: string | null };
  subcategoryName?: string;
  notes?: string;
  open: boolean;
  onClose: () => void;
  reloadCategories: () => void;
  openSubcategoryDeletionDialog: () => void;
}) => {
  const [subcategorySubmit, isPending] = useSubcategorySubmit({
    callbacks: {
      onSuccess: () => {
        reloadCategories();
      },
    },
  });
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void subcategorySubmit({
      data: new FormData(event.currentTarget),
      projectOptions: { loadingMessage: "Salvando subcategoria..." },
    });
  };

  return (
    <CDialog
      title={
        cloneSubcategory ? "Clonar subcategoria"
        : subcategoryId ?
          "Editar subcategoria"
        : "Criar subcategoria"
      }
      subtitle={cloneSubcategory?.name}
      open={open}
      onClose={onClose}
      isForm
      onSubmit={handleSubmit}
      onCancel={openSubcategoryDeletionDialog}
      confirmChildren={
        subcategoryId && !cloneSubcategory ? <>Editar</> : <>Criar</>
      }
      cancelChildren={
        subcategoryId && !cloneSubcategory ? <>Excluir</> : undefined
      }
      cancelColor="error"
      confirmLoading={isPending}
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="formUse" value={formUse} />
        {cloneSubcategory && (
          <input
            type="hidden"
            name="cloneSubcategoryId"
            value={cloneSubcategory.id}
          />
        )}
        <h6 className="text-base font-semibold">
          Categoria pai: {categoryName}
        </h6>
        {subcategoryId && !cloneSubcategory && (
          <>
            <div>
              Atenção: editar esta subcategoria acarretará mudanças em todos os
              formulários em que ela está presente!
            </div>
            <input
              type="hidden"
              name="subcategoryId"
              id="subcategoryId"
              value={subcategoryId}
            />
          </>
        )}
        <input
          type="hidden"
          id="category-id"
          name="category-id"
          value={categoryId}
        />
        <CTextField
          required
          resetOnFormSubmit
          key={cloneSubcategory?.id ?? subcategoryId ?? "new-subcategory"}
          defaultValue={
            cloneSubcategory ?
              `${cloneSubcategory.name} (cópia)`
            : subcategoryName
          }
          id="subcategory-name"
          name="subcategory-name"
          label="Nome"
        />
        <CTextField
          resetOnFormSubmit
          multiline
          key={`${cloneSubcategory?.id ?? subcategoryId ?? "new-subcategory"}-notes`}
          defaultValue={cloneSubcategory?.notes ?? notes}
          id="notes"
          name="notes"
          label="Observações"
        />
      </div>
    </CDialog>
  );
};

export default SubcategoryCreationDialog;
