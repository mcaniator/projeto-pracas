import { useCategorySubmit } from "@/lib/serverFunctions/apiCalls/category";
import CCheckboxGroup from "@components/ui/cCheckboxGroup";
import CSwitch from "@components/ui/cSwtich";
import CTextField from "@components/ui/cTextField";
import CDialog from "@components/ui/dialog/cDialog";
import type { FormUse, QuestionGeometryTypes } from "@prisma/client";
import { FormEventHandler, useState } from "react";

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
  const [allowGeometryAssociation, setAllowGeometryAssociation] =
    useState(false);
  const [geometryTypes, setGeometryTypes] = useState<string[]>([]);
  const [categorySubmit, isPending] = useCategorySubmit({
    callbacks: {
      onSuccess: () => {
        reloadCategories();
      },
    },
  });
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void categorySubmit({
      data: formData,
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
      disableConfirmButton={
        isPending || (allowGeometryAssociation && geometryTypes.length === 0)
      }
    >
      <div className="flex flex-col">
        <input type="hidden" name="formUse" value={formUse} />
        {cloneCategory && (
          <input
            type="hidden"
            name="cloneCategoryId"
            value={cloneCategory.id}
          />
        )}
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
        <CSwitch
          label="Permite associar geometrias no mapa"
          name="allowGeometryAssociation"
          id="allowGeometryAssociation"
          checked={allowGeometryAssociation}
          value={allowGeometryAssociation}
          onChange={(event) => {
            const checked = event.target.checked;
            setAllowGeometryAssociation(checked);
            if (!checked) setGeometryTypes([]);
          }}
        />
        {allowGeometryAssociation && (
          <CCheckboxGroup
            label="Tipos de geometria aceitos"
            name="geometryTypes"
            value={geometryTypes}
            options={[
              { value: "POINT", label: "Pontos" },
              { value: "POLYGON", label: "Polígonos" },
            ]}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
            onChange={(values) => {
              setGeometryTypes(values as QuestionGeometryTypes[]);
            }}
          />
        )}
      </div>
    </CDialog>
  );
};

export default CategoryCreationDialog;
