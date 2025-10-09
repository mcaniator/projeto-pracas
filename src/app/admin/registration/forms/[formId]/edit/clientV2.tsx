"use client";

import CTextField from "@components/ui/cTextField";
import { useHelperCard } from "@context/helperCardContext";
import { useLoadingOverlay } from "@context/loadingContext";
import { QuestionPickerQuestionToAdd } from "@customTypes/forms/formCreation";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import {
  CategoriesWithQuestions,
  CategoriesWithQuestionsAndStatusCode,
} from "@queries/category";
import { _updateFormV2 } from "@serverActions/formUtil";
import { IconCalculator } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import CButton from "../../../../../../components/ui/cButton";
import CDialog from "../../../../../../components/ui/dialog/cDialog";
import { _getCategoriesWithSubcategories } from "../../../../../../lib/serverFunctions/apiCalls/category";
import { FormItemUtils } from "../../../../../../lib/utils/formTreeUtils";
import CalculationDialog, { CalculationParams } from "./calculationDialog";
import QuestionFormV2 from "./questionFormV2";
import SaveFormDialog from "./saveFormDialog";

const FormEditor = dynamic(() => import("./formEditor"), {
  ssr: false,
});

export type SubcategoryItem = {
  position: number;
  subcategoryId: number;
  name: string;
  notes: string | null;
  questions: QuestionItem[];
};

export type QuestionItem = {
  position: number;
  questionId: number;
  name: string;
  notes: string | null;
  questionType: QuestionTypes;
  characterType: QuestionResponseCharacterTypes;
  optionType?: OptionTypes | null;
  options?: {
    text: string;
  }[];
  geometryTypes: QuestionGeometryTypes[];
};

export type CategoryItem = {
  categoryId: number;
  name: string;
  notes: string | null;
  position: number;
  categoryChildren: (QuestionItem | SubcategoryItem)[];
};

export type FormEditorTree = {
  id: number;
  name: string;
  finalized: boolean;
  categories: CategoryItem[];
};

const ClientV2 = ({
  form,
  dbCalculations,
  formId,
}: {
  form: {
    formTree: FormEditorTree;
    statusCode: number;
  };
  dbCalculations: CalculationParams[];
  formId: number;
}) => {
  const { setHelperCard, helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [isFinalized] = useState(form.formTree.finalized);
  const [isMobileView, setIsMobileView] = useState<boolean>(true);
  const [formName, setFormName] = useState(form.formTree.name);
  const [formQuestionsIds, setFormQuestionsIds] = useState<number[]>([]);
  const [formTree, setFormTree] = useState<FormEditorTree>(form.formTree);
  const [formCalculations, setFormCalculations] =
    useState<CalculationParams[]>(dbCalculations);
  const [openQuestionFormModal, setOpenQuestionFormModal] = useState(false);
  const [openCalculationDialog, setOpenCalculationDialog] = useState(false);
  const [openSaveFormDialog, setOpenSaveFormDialog] = useState(false);
  const [saveAsDone, setSaveAsDone] = useState(false);
  const [categories, setCategories] = useState<CategoriesWithQuestions>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const fetchCategories = useCallback(async () => {
    console.log("RELOADING MAIN GETCH");
    setIsLoadingCategories(true);
    setLoadingOverlay({ show: true, message: "Carregando categorias..." });
    const response = await _getCategoriesWithSubcategories();
    helperCardProcessResponse(response.responseInfo);
    setCategories(response.categories);
    setLoadingOverlay({ show: false });
    setIsLoadingCategories(false);
  }, [helperCardProcessResponse, setLoadingOverlay]);

  const reloadCategories = useCallback(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const addQuestion = (question: QuestionPickerQuestionToAdd) => {
    if (formQuestionsIds.includes(question.id)) return;

    setFormTree((prev) => {
      const categoryId = question.categoryId;
      const subcategoryId = question.subcategoryId;

      // Busca ou cria categoria
      let category = prev.categories.find(
        (cat) => cat.categoryId === categoryId,
      );
      const categoryFromCategoriesList = categories.find(
        (cat) => cat.id === categoryId,
      );
      if (!category) {
        if (!categoryFromCategoriesList) {
          throw new Error("Tried to find category that does not exists");
        }
        category = {
          categoryId: categoryId,
          name: categoryFromCategoriesList.name,
          notes: categoryFromCategoriesList.notes,
          position: prev.categories.length + 1,
          categoryChildren: [],
        };
      }

      let newCategory = { ...category };

      if (subcategoryId) {
        // Adiciona questão dentro de subcategoria
        let subItem = newCategory.categoryChildren.find(
          (item): item is SubcategoryItem =>
            FormItemUtils.isSubcategoryType(item) &&
            item.subcategoryId === subcategoryId,
        );

        if (!subItem) {
          const subcategoryFromCategoriesList =
            categoryFromCategoriesList?.subcategory.find(
              (sub) => sub.id === subcategoryId,
            );
          if (!subcategoryFromCategoriesList) {
            throw new Error("Tried to find subcategory that does not exists");
          }
          subItem = {
            subcategoryId: subcategoryId,
            name: subcategoryFromCategoriesList.name,
            position: newCategory.categoryChildren.length + 1, // insere no final
            notes: subcategoryFromCategoriesList.notes,
            questions: [],
          };
        }

        // Adiciona a questão dentro da subcategoria
        subItem = {
          ...subItem,
          questions: [
            ...(subItem.questions ?? []),
            {
              questionId: question.id,
              name: question.name,
              notes: question.notes,
              questionType: question.questionType,
              position: (subItem.questions?.length ?? 0) + 1,
              characterType: question.characterType,
              optionType: question.optionType,
              options: question.options,
              geometryTypes: question.geometryTypes,
            },
          ],
        };

        // Atualiza formItems substituindo ou adicionando subcategoria
        const newCategoryChildren = [
          ...newCategory.categoryChildren.filter(
            (item) =>
              !(
                FormItemUtils.isSubcategoryType(item) &&
                item.subcategoryId === subcategoryId
              ),
          ),
          subItem,
        ].sort((a, b) => a.position - b.position);

        newCategory = { ...newCategory, categoryChildren: newCategoryChildren };
      } else {
        // Adiciona questão direta na categoria
        const questionItem: QuestionItem = {
          questionId: question.id,
          name: question.name,
          notes: question.notes,
          questionType: question.questionType,
          characterType: question.characterType,
          optionType: question.optionType,
          options: question.options,
          geometryTypes: question.geometryTypes,
          position: newCategory.categoryChildren.length + 1,
        };

        newCategory = {
          ...newCategory,
          categoryChildren: [
            ...newCategory.categoryChildren,
            questionItem,
          ].sort((a, b) => a.position - b.position),
        };
      }

      // Atualiza lista de categorias
      const newCategories = [
        ...prev.categories.filter((cat) => cat.categoryId !== categoryId),
        newCategory,
      ].sort((a, b) => a.position - b.position);

      return { ...prev, categories: newCategories };
    });
  };

  useEffect(() => {
    if (isFinalized) return;
    void fetchCategories();
  }, [fetchCategories, isFinalized]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1000);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const questionsIds: number[] = [];
    formTree.categories.forEach((c) => {
      c.categoryChildren.forEach((fi) => {
        if (FormItemUtils.isQuestionType(fi)) {
          questionsIds.push(fi.questionId);
        } else if (FormItemUtils.isSubcategoryType(fi)) {
          fi.questions?.forEach((q) => {
            questionsIds.push(q.questionId);
          });
        }
      });
    });
    setFormQuestionsIds(questionsIds);
  }, [formTree]);

  const handleUpdateForm = async () => {
    try {
      setLoadingOverlay({ show: true, message: "Salvando..." });
      const response = await _updateFormV2({
        formId: formId,
        newFormName: formName,
        formTree: formTree,
        isFinalized: saveAsDone,
        calculations: formCalculations,
      });
      if (response?.statusCode !== 200) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao salvar!</>,
        });
      } else {
        setHelperCard({
          show: true,
          helperCardType: "CONFIRM",
          content: <>Formulário salvo!</>,
        });
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao salvar!</>,
      });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-white">
      <div className="grid h-full grid-cols-5 gap-2 overflow-auto">
        <div
          className={`${
            isMobileView || isFinalized ? "col-span-5" : "col-span-3"
          } overflow-auto`}
        >
          <div className="ml-1 mr-2 flex flex-col gap-1">
            <div className="flex flex-row items-center justify-between">
              <CTextField
                label="Nome"
                value={formName}
                readOnly={isFinalized}
                onChange={(e) => {
                  setFormName(e.target.value);
                }}
              />
              {!isMobileView && (
                <div className="flex items-center gap-1">
                  <CButton
                    enableTopLeftChip
                    disableMinWidth
                    topLeftChipLabel={formCalculations.length}
                    onClick={() => {
                      setOpenCalculationDialog(true);
                    }}
                  >
                    <IconCalculator />
                  </CButton>
                  {!isFinalized && (
                    <CButton
                      className="w-fit"
                      onClick={() => {
                        setOpenSaveFormDialog(true);
                      }}
                    >
                      Salvar
                    </CButton>
                  )}
                </div>
              )}
            </div>
            {isMobileView && (
              <div className="flex items-center gap-2">
                <CButton
                  onClick={() => {
                    setOpenQuestionFormModal(true);
                  }}
                >
                  Questões
                </CButton>
                <CButton
                  enableTopLeftChip
                  disableMinWidth
                  topLeftChipLabel={formCalculations.length}
                  onClick={() => {
                    setOpenCalculationDialog(true);
                  }}
                >
                  <IconCalculator />
                </CButton>
                {!isFinalized && (
                  <CButton
                    className="w-fit"
                    onClick={() => {
                      setOpenSaveFormDialog(true);
                    }}
                  >
                    Salvar
                  </CButton>
                )}
              </div>
            )}
            {
              <FormEditor
                formTree={formTree}
                isFinalized={isFinalized}
                setFormTree={setFormTree}
              />
            }
          </div>
        </div>
        {!isMobileView && !isFinalized && (
          <div
            className={`col-span-2 h-full overflow-auto`}
            style={{
              borderLeft: "solid 1px gray",
              boxShadow: "-4px 0 6px -2px rgba(0, 0, 0, 0.3)",
            }}
          >
            <QuestionFormV2
              addQuestion={addQuestion}
              reloadCategories={reloadCategories}
              categories={categories}
              formQuestionsIds={formQuestionsIds}
              isLoadingCategories={isLoadingCategories}
              showTitle
            />
          </div>
        )}
      </div>
      {isMobileView && !isFinalized && (
        <CDialog
          fullScreen
          title="Adicionar questões"
          open={openQuestionFormModal}
          onClose={() => {
            setOpenQuestionFormModal(false);
          }}
        >
          <QuestionFormV2
            addQuestion={addQuestion}
            reloadCategories={reloadCategories}
            categories={categories}
            formQuestionsIds={formQuestionsIds}
            isLoadingCategories={isLoadingCategories}
            showTitle={false}
          />
        </CDialog>
      )}

      <CalculationDialog
        formTree={formTree}
        openCalculationDialog={openCalculationDialog}
        formCalculations={formCalculations}
        isFinalized={isFinalized}
        setOpenCalculationModal={setOpenCalculationDialog}
        setFormCalculations={setFormCalculations}
      />
      <SaveFormDialog
        openSaveFormDialog={openSaveFormDialog}
        setOpenSaveFormDialog={setOpenSaveFormDialog}
        saveAsDone={saveAsDone}
        setSaveAsDone={setSaveAsDone}
        save={() => {
          void handleUpdateForm();
        }}
      />
    </div>
  );
};

export default ClientV2;
