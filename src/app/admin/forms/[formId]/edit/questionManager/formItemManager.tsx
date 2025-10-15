import CAutocomplete from "@components/ui/cAutoComplete";
import CButton from "@components/ui/cButton";
import { CategoriesWithQuestions } from "@queries/category";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import CategoryCreationDialog from "./categoryCreationDialog";
import CategoryDeletionDialog from "./categoryDeletionDialog";
import QuestionCreation from "./questionCreation";
import SubcategoryCreationDialog from "./subcategoryCreationDialog";
import SubcategoryDeletionDialog from "./subcategoryDeletionDialog";

const FormItemManager = ({
  categories,
  selectedCategoryAndSubcategoryId,
  reloadCategories,
  setSelectedCategoryAndSubcategoryId,
}: {
  categories: CategoriesWithQuestions;
  selectedCategoryAndSubcategoryId: {
    categoryId: number | undefined;
    subcategoryId: number | null;
    verifySubcategoryNullness: boolean;
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
  const subcategoriesOptions =
    categories.find(
      (cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId,
    )?.subcategory || [];
  const fullSubcategoriesOptions = [
    { id: -1, name: "NENHUMA" },
    ...subcategoriesOptions,
  ];

  const [selectedCategory, setSelectedCategory] = useState<
    | {
        subcategory: {
          id: number;
          name: string;
          notes: string | null;
        }[];
        id: number;
        name: string;
        notes: string | null;
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
      }
    | undefined
  >(
    categories
      .find((cat) => cat.id === selectedCategoryAndSubcategoryId.categoryId)
      ?.subcategory.find(
        (sub) => sub.id === selectedCategoryAndSubcategoryId.subcategoryId,
      ),
  );

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
      <h4>Criar questão: </h4>
      <div className="text-red-500">
        Atenção: Antes de criar uma questão, certifique-se se já existe uma
        questão que aborde a avaliação desejada.
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
            disableAppendIconButton={
              !selectedCategoryAndSubcategoryId.categoryId
            }
            appendIconButton={<IconPencil />}
            onAppendIconButtonClick={() => {
              setIsEdition(true);
              setOpenCategoryCreationDialog(true);
            }}
            appendIconButtonSx={{ color: "primary.main" }}
            onChange={(evt, val) => {
              setSelectedCategoryAndSubcategoryId({
                categoryId: Number(val?.id),
                subcategoryId: -1,
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
            disableAppendIconButton={
              !selectedCategoryAndSubcategoryId.subcategoryId ||
              selectedCategoryAndSubcategoryId.subcategoryId === -1
            }
            appendIconButton={<IconPencil />}
            onAppendIconButtonClick={() => {
              setIsEdition(true);
              setOpenSubcategoryCreationDialog(true);
            }}
            appendIconButtonSx={{ color: "primary.main" }}
            onChange={(evt, val) => {
              setSelectedCategoryAndSubcategoryId({
                ...selectedCategoryAndSubcategoryId,
                subcategoryId: val.id,
                verifySubcategoryNullness: false,
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
          open={openCategoryCreationDialog}
          categoryId={isEdition ? selectedCategory?.id : undefined}
          categoryName={isEdition ? selectedCategory?.name : undefined}
          notes={isEdition ? (selectedCategory?.notes ?? undefined) : undefined}
          onClose={() => {
            setOpenCategoryCreationDialog(false);
          }}
          openCategoryDeletionDialog={() => {
            setOpenCategoryCreationDialog(false);
            setOpenCategoryDeletionDialog(true);
          }}
          reloadCategories={handleReloadCategories}
        />

        {selectedCategoryAndSubcategoryId.categoryId && (
          <>
            <SubcategoryCreationDialog
              categoryId={selectedCategoryAndSubcategoryId.categoryId}
              categoryName={selectedCategory?.name ?? "ERRO"}
              subcategoryId={isEdition ? selectedSubcategory?.id : undefined}
              subcategoryName={
                isEdition ? selectedSubcategory?.name : undefined
              }
              notes={
                isEdition ?
                  (selectedSubcategory?.notes ?? undefined)
                : undefined
              }
              open={openSubcategoryCreationDialog}
              openSubcategoryDeletionDialog={() => {
                setOpenSubcategoryCreationDialog(false);
                setOpenSubcategoryDeletionDialog(true);
              }}
              onClose={() => {
                setOpenSubcategoryCreationDialog(false);
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
            {selectedCategoryAndSubcategoryId.subcategoryId && (
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
