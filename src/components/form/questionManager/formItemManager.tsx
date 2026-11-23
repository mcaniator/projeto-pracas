import CMenu from "@/components/ui/menu/cMenu";
import { FetchCategoriesWithSubcategoriesReponse } from "@/lib/serverFunctions/queries/category";
import CAutocomplete from "@components/ui/cAutoComplete";
import CButton from "@components/ui/cButton";
import type { FormUse, QuestionGeometryTypes } from "@prisma/client";
import { IconCopy, IconPencil, IconPlus } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import CategoryCreationDialog from "./categoryCreationDialog";
import CategoryDeletionDialog from "./categoryDeletionDialog";
import QuestionCreation from "./questionCreation";
import SubcategoryCreationDialog from "./subcategoryCreationDialog";
import SubcategoryDeletionDialog from "./subcategoryDeletionDialog";

const FormItemManager = ({
  formUse,
  categories,
  selectedCategoryAndSubcategoryId,
  formCategoriesAndSubcategoriesIds,
  reloadCategories,
  setSelectedCategoryAndSubcategoryId,
}: {
  formUse: FormUse;
  categories: FetchCategoriesWithSubcategoriesReponse["categories"];
  selectedCategoryAndSubcategoryId: {
    categoryId: number | undefined;
    subcategoryId: number | null;
    verifySubcategoryNullness: boolean;
  };
  formCategoriesAndSubcategoriesIds: {
    categoriesIds: number[];
    subcategoriesIds: number[];
  };
  reloadCategories: () => void;
  setSelectedCategoryAndSubcategoryId: React.Dispatch<
    React.SetStateAction<{
      categoryId: number | undefined;
      subcategoryId: number | null;
      verifySubcategoryNullness: boolean;
    }>
  >;
}) => {
  const [isEdition, setIsEdition] = useState(false);
  const [openCategoryCreationDialog, setOpenCategoryCreationDialog] =
    useState(false);
  const [openCategoryDeletionDialog, setOpenCategoryDeletionDialog] =
    useState(false);
  const [openSubcategoryCreationDialog, setOpenSubcategoryCreationDialog] =
    useState(false);
  const [openSubcategoryDeletionDialog, setOpenSubcategoryDeletionDialog] =
    useState(false);
  const [openQuestionCreationDialog, setOpenQuestionCreationDialog] =
    useState(false);
  const [cloneCategory, setCloneCategory] = useState<
    | {
        id: number;
        name: string;
        notes: string | null;
        allowGeometryAssociation?: boolean;
        geometryTypes?: QuestionGeometryTypes[];
      }
    | undefined
  >();
  const [cloneSubcategory, setCloneSubcategory] = useState<
    | {
        id: number;
        name: string;
        notes: string | null;
        allowGeometryAssociation?: boolean;
        geometryTypes?: QuestionGeometryTypes[];
      }
    | undefined
  >();
  const subcategoriesOptions =
    categories.find(
      (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
    )?.subcategory || [];
  const fullSubcategoriesOptions = [
    { id: 0, name: "TODAS" },
    { id: -1, name: "NENHUMA" },
    ...subcategoriesOptions,
  ];

  const [selectedCategory, setSelectedCategory] = useState<
    | {
        subcategory: {
          id: number;
          name: string;
          notes: string | null;
          allowGeometryAssociation?: boolean;
          geometryTypes?: QuestionGeometryTypes[];
        }[];
        id: number;
        name: string;
        notes: string | null;
        allowGeometryAssociation?: boolean;
        geometryTypes?: QuestionGeometryTypes[];
      }
    | undefined
  >(
    categories.find(
      (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
    ),
  );

  const [selectedSubcategory, setSelectedSubcategory] = useState<
    | {
        id: number;
        name: string;
        notes: string | null;
        allowGeometryAssociation?: boolean;
        geometryTypes?: QuestionGeometryTypes[];
      }
    | undefined
  >(
    categories
      .find((cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId)
      ?.subcategory.find(
        (sub) => sub.id === selectedCategoryAndSubcategoryId.subcategoryId,
      ),
  );

  const selectedCategoryAndSubcategoryInForm = useMemo(() => {
    const result = {
      selectedCategoryInForm: false,
      selectedSubcategoryInForm: false,
    };
    if (selectedCategoryAndSubcategoryId.categoryId) {
      result.selectedCategoryInForm =
        formCategoriesAndSubcategoriesIds.categoriesIds.includes(
          selectedCategoryAndSubcategoryId.categoryId,
        );
    }
    if (
      !!selectedCategoryAndSubcategoryId.subcategoryId &&
      selectedCategoryAndSubcategoryId.subcategoryId > 0
    ) {
      result.selectedSubcategoryInForm =
        formCategoriesAndSubcategoriesIds.subcategoriesIds.includes(
          selectedCategoryAndSubcategoryId.subcategoryId,
        );
    }
    return result;
  }, [selectedCategoryAndSubcategoryId, formCategoriesAndSubcategoriesIds]);

  const handleReloadCategories = (params?: {
    resetSelectedCategory?: boolean;
    resetSelectedSubcategory?: boolean;
  }) => {
    if (params?.resetSelectedCategory) {
      setSelectedCategoryAndSubcategoryId({
        categoryId: undefined,
        subcategoryId: null,
        verifySubcategoryNullness: false,
      });
    } else if (params?.resetSelectedSubcategory) {
      setSelectedCategoryAndSubcategoryId((prev) => ({
        ...prev,
        subcategoryId: null,
      }));
    }

    reloadCategories();
    setOpenCategoryCreationDialog(false);
    setOpenCategoryDeletionDialog(false);
    setOpenSubcategoryCreationDialog(false);
    setOpenSubcategoryDeletionDialog(false);
    setCloneCategory(undefined);
    setCloneSubcategory(undefined);
  };

  useEffect(() => {
    setSelectedCategory(
      categories.find(
        (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
      ),
    );
    setSelectedSubcategory(
      categories
        .find((cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId)
        ?.subcategory.find(
          (sub) => sub.id === selectedCategoryAndSubcategoryId.subcategoryId,
        ),
    );
  }, [categories, selectedCategoryAndSubcategoryId]);
  return (
    <div className="flex flex-col gap-2 overflow-auto">
      <h4>Cadastro de categorias, subcategorias e questões: </h4>
      <div className="text-red-500">
        Atenção: Antes de criar uma nova questão, verifique se já não existe uma
        que aborde o mesmo assunto, a fim de evitar duplicidade.
      </div>
      <div>
        Questões são reutilizáveis entre formulários, para garantir a comparação
        correta entre avaliações.
      </div>
      <div className="flex flex-col gap-2 overflow-auto">
        <div className="flex items-center justify-center gap-1">
          <CAutocomplete
            options={categories}
            label="Categoria"
            className="w-full"
            value={categories.find(
              (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
            )}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable
            appendAction={
              selectedCategory ?
                <CMenu
                  options={[
                    {
                      label: (
                        <div className="flex items-center gap-1">
                          <IconPencil /> Editar
                        </div>
                      ),
                      disabled:
                        selectedCategoryAndSubcategoryInForm.selectedCategoryInForm,
                      onClick: () => {
                        setIsEdition(true);
                        setCloneCategory(undefined);
                        setOpenCategoryCreationDialog(true);
                      },
                    },
                    {
                      label: (
                        <div className="flex items-center gap-1">
                          <IconCopy /> Clonar
                        </div>
                      ),
                      onClick: () => {
                        setIsEdition(false);
                        setCloneCategory(selectedCategory);
                        setOpenCategoryCreationDialog(true);
                      },
                    },
                  ]}
                />
              : undefined
            }
            onChange={(evt, val) => {
              setSelectedCategoryAndSubcategoryId({
                categoryId: Number(val?.id),
                subcategoryId: 0,
                verifySubcategoryNullness: false,
              });
            }}
          />
          <CButton
            square
            sx={{ marginTop: "8px" }}
            onClick={() => {
              setIsEdition(false);
              setOpenCategoryCreationDialog(true);
            }}
          >
            <IconPlus />
          </CButton>
        </div>
        <div className="flex items-center justify-center gap-1">
          <CAutocomplete
            options={fullSubcategoriesOptions}
            label="Subcategoria"
            className="w-full"
            value={fullSubcategoriesOptions.find(
              (fs) => fs.id === selectedCategoryAndSubcategoryId.subcategoryId,
            )}
            disabled={!selectedCategoryAndSubcategoryId.categoryId}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable
            appendAction={
              (
                selectedSubcategory &&
                selectedCategoryAndSubcategoryId.subcategoryId !== -1
              ) ?
                <CMenu
                  options={[
                    {
                      label: (
                        <div className="flex items-center gap-1">
                          <IconPencil /> Editar
                        </div>
                      ),
                      disabled:
                        selectedCategoryAndSubcategoryInForm.selectedSubcategoryInForm,
                      onClick: () => {
                        setIsEdition(true);
                        setCloneSubcategory(undefined);
                        setOpenSubcategoryCreationDialog(true);
                      },
                    },
                    {
                      label: (
                        <div className="flex items-center gap-1">
                          <IconCopy /> Clonar
                        </div>
                      ),
                      onClick: () => {
                        setIsEdition(false);
                        setCloneSubcategory(selectedSubcategory);
                        setOpenSubcategoryCreationDialog(true);
                      },
                    },
                  ]}
                />
              : undefined
            }
            onChange={(evt, val) => {
              setSelectedCategoryAndSubcategoryId({
                ...selectedCategoryAndSubcategoryId,
                subcategoryId: val.id,
                verifySubcategoryNullness: val.id === -1 ? true : false,
              });
            }}
          />
          <CButton
            square
            disabled={!selectedCategoryAndSubcategoryId.categoryId}
            sx={{ marginTop: "8px" }}
            onClick={() => {
              setIsEdition(false);
              setOpenSubcategoryCreationDialog(true);
            }}
          >
            <IconPlus />
          </CButton>
        </div>
        <CButton
          onClick={() => {
            setOpenQuestionCreationDialog(true);
          }}
        >
          Criar questão
        </CButton>
        <CategoryCreationDialog
          formUse={formUse}
          open={openCategoryCreationDialog}
          categoryId={isEdition ? selectedCategory?.id : undefined}
          cloneCategory={cloneCategory}
          categoryName={isEdition ? selectedCategory?.name : undefined}
          notes={isEdition ? (selectedCategory?.notes ?? undefined) : undefined}
          allowGeometryAssociation={
            isEdition ? selectedCategory?.allowGeometryAssociation : false
          }
          geometryTypes={
            isEdition ? selectedCategory?.geometryTypes : undefined
          }
          onClose={() => {
            setOpenCategoryCreationDialog(false);
            setCloneCategory(undefined);
          }}
          openCategoryDeletionDialog={() => {
            setOpenCategoryCreationDialog(false);
            setOpenCategoryDeletionDialog(true);
          }}
          reloadCategories={handleReloadCategories}
        />

        {!!selectedCategoryAndSubcategoryId.categoryId && (
          <>
            <SubcategoryCreationDialog
              formUse={formUse}
              categoryId={selectedCategoryAndSubcategoryId.categoryId}
              categoryName={selectedCategory?.name ?? "ERRO"}
              subcategoryId={isEdition ? selectedSubcategory?.id : undefined}
              cloneSubcategory={cloneSubcategory}
              subcategoryName={
                isEdition ? selectedSubcategory?.name : undefined
              }
              notes={
                isEdition ?
                  (selectedSubcategory?.notes ?? undefined)
                : undefined
              }
              allowGeometryAssociation={
                isEdition ?
                  selectedSubcategory?.allowGeometryAssociation
                : false
              }
              geometryTypes={
                isEdition ? selectedSubcategory?.geometryTypes : undefined
              }
              open={openSubcategoryCreationDialog}
              openSubcategoryDeletionDialog={() => {
                setOpenSubcategoryCreationDialog(false);
                setOpenSubcategoryDeletionDialog(true);
              }}
              onClose={() => {
                setOpenSubcategoryCreationDialog(false);
                setCloneSubcategory(undefined);
              }}
              reloadCategories={handleReloadCategories}
            />
            <CategoryDeletionDialog
              reloadCategories={() => {
                handleReloadCategories({ resetSelectedCategory: true });
              }}
              categoryId={selectedCategoryAndSubcategoryId.categoryId}
              categoryName={selectedCategory?.name ?? "ERRO"}
              open={openCategoryDeletionDialog}
              onClose={() => {
                setOpenCategoryDeletionDialog(false);
              }}
            />
            {!!selectedCategoryAndSubcategoryId.subcategoryId && (
              <SubcategoryDeletionDialog
                reloadCategories={() => {
                  handleReloadCategories({ resetSelectedCategory: true });
                }}
                subcategoryId={selectedCategoryAndSubcategoryId.subcategoryId}
                subcategoryName={selectedSubcategory?.name ?? "ERRO"}
                open={openSubcategoryDeletionDialog}
                onClose={() => {
                  setOpenSubcategoryDeletionDialog(false);
                }}
              />
            )}
            <QuestionCreation
              formUse={formUse}
              fetchCategoriesAfterCreation={reloadCategories}
              open={openQuestionCreationDialog}
              onClose={() => {
                setOpenQuestionCreationDialog(false);
              }}
              categoryId={selectedCategoryAndSubcategoryId.categoryId}
              subcategoryId={
                selectedCategoryAndSubcategoryId.subcategoryId ?? undefined
              }
              categoryName={selectedCategory?.name}
              subcategoryName={selectedSubcategory?.name}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FormItemManager;
