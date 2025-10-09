import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import CAutocomplete from "../../../../../../components/ui/cAutoComplete";
import CButton from "../../../../../../components/ui/cButton";
import { CategoriesWithQuestions } from "../../../../../../lib/serverFunctions/queries/category";
import CategoryCreationDialog from "./categoryCreationDialog";
import CategoryDeletionDialog from "./categoryDeletionDialog";
import QuestionCreation from "./questionCreation";
import SubcategoryCreationDialog from "./subcategoryCreationDialog";
import SubcategoryDeletionDialog from "./subcategoryDeletionDialog";

const FormItemManager = ({
  categories,
  reloadCategories,
}: {
  categories: CategoriesWithQuestions;
  reloadCategories: () => void;
}) => {
  const [
    selectedCategoryAndSubcategoryId,
    setSelectedCategoryAndSubcategoryId,
  ] = useState<{ categoryId: number | null; subcategoryId: number | null }>({
    categoryId: categories[0]?.id ?? null,
    subcategoryId: -1,
  });
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
        categoryId: null,
        subcategoryId: null,
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
      <h4>Selecionar categoria / subcategoria: </h4>
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
          disableAppendIconButton={!selectedCategoryAndSubcategoryId.categoryId}
          appendIconButton={<IconTrash />}
          onAppendIconButtonClick={() => {
            setOpenCategoryDeletionDialog(true);
          }}
          appendIconButtonSx={{ color: "error.main" }}
          onChange={(evt, val) => {
            setSelectedCategoryAndSubcategoryId({
              categoryId: Number(val?.id),
              subcategoryId: -1,
            });
          }}
        />
        <CButton
          square
          sx={{ marginTop: "8px" }}
          onClick={() => {
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
          appendIconButton={<IconTrash />}
          onAppendIconButtonClick={() => {
            setOpenSubcategoryDeletionDialog(true);
          }}
          appendIconButtonSx={{ color: "error.main" }}
          onChange={(evt, val) => {
            setSelectedCategoryAndSubcategoryId({
              ...selectedCategoryAndSubcategoryId,
              subcategoryId: val.id,
            });
          }}
        />
        <CButton
          square
          disabled={!selectedCategoryAndSubcategoryId.categoryId}
          sx={{ marginTop: "8px" }}
          onClick={() => {
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
        onClose={() => {
          setOpenCategoryCreationDialog(false);
        }}
        reloadCategories={handleReloadCategories}
      />

      {selectedCategoryAndSubcategoryId.categoryId && (
        <>
          <SubcategoryCreationDialog
            categoryId={selectedCategoryAndSubcategoryId.categoryId}
            categoryName={selectedCategory?.name ?? "ERRO"}
            open={openSubcategoryCreationDialog}
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
  );
};

export default FormItemManager;
