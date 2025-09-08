"use client";

import CustomModal from "@components/modal/customModal";
import CTextField from "@components/ui/cTextField";
import { useHelperCard } from "@context/helperCardContext";
import { useLoadingOverlay } from "@context/loadingContext";
import { FormQuestionWithCategoryAndSubcategory } from "@customTypes/forms/formCreation";
import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { CategoriesWithQuestionsAndStatusCode } from "@queries/category";
import { _updateFormV2 } from "@serverActions/formUtil";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import CButton from "../../../../../../components/ui/cButton";
import { FormItemUtils } from "../../../../../../lib/utils/formTreeUtils";
import QuestionFormV2 from "./questionFormV2";

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
  position: number;
  categoryChildren: (QuestionItem | SubcategoryItem)[];
};

export type FormEditorTree = {
  id: number;
  name: string;
  categories: CategoryItem[];
};

const ClientV2 = ({
  form,
  categories,
  formId,
}: {
  form: {
    formTree: FormEditorTree;
    statusCode: number;
  };
  categories: CategoriesWithQuestionsAndStatusCode;
  formId: number;
}) => {
  const { setHelperCard } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [isMobileView, setIsMobileView] = useState<boolean>(true);
  const [formName, setFormName] = useState(form.formTree.name);
  const [formQuestionsIds, setFormQuestionsIds] = useState<number[]>([]);
  const [formTree, setFormTree] = useState<FormEditorTree>(form.formTree);
  const [openQuestionFormModal, setOpenQuestionFormModal] = useState(false);

  const addQuestion = (question: FormQuestionWithCategoryAndSubcategory) => {
    if (formQuestionsIds.includes(question.id)) return;

    setFormTree((prev) => {
      const categoryId = question.category.id;
      const subcategoryId = question.subcategory?.id;

      // Busca ou cria categoria
      let category = prev.categories.find(
        (cat) => cat.categoryId === categoryId,
      );
      if (!category) {
        category = {
          categoryId: categoryId,
          name: question.category.name,
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
          subItem = {
            subcategoryId: subcategoryId,
            name: question.subcategory!.name,
            position: newCategory.categoryChildren.length + 1, // insere no final
            notes: null,
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
        oldFormName: form.formTree.name,
        newFormName: formName,
        formTree: formTree,
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
            isMobileView ? "col-span-5" : "col-span-3"
          } overflow-auto`}
        >
          <div className="mr-2 flex flex-col gap-1">
            <div className="flex flex-row items-center justify-between">
              <CTextField
                label="Nome"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                }}
              />
              {!isMobileView && (
                <CButton
                  className="w-fit"
                  onClick={() => {
                    void handleUpdateForm();
                  }}
                >
                  Salvar
                </CButton>
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
                  className="w-fit"
                  onClick={() => {
                    void handleUpdateForm();
                  }}
                >
                  Salvar
                </CButton>
              </div>
            )}
            {<FormEditor formTree={formTree} setFormTree={setFormTree} />}
          </div>
        </div>
        <div
          className={`col-span-2 h-full overflow-auto ${isMobileView ? "hidden" : ""}`}
          style={{
            borderLeft: "solid 1px gray",
            boxShadow: "-4px 0 6px -2px rgba(0, 0, 0, 0.3)",
          }}
        >
          <QuestionFormV2
            addQuestion={addQuestion}
            categories={categories.categories}
            formQuestionsIds={formQuestionsIds}
            showTitle
          />
        </div>
      </div>
      <CustomModal
        disableModalActions
        fullWidth
        title="Adicionar questões"
        isOpen={openQuestionFormModal}
        onOpenChange={(e) => {
          setOpenQuestionFormModal(e);
        }}
      >
        <QuestionFormV2
          addQuestion={addQuestion}
          categories={categories.categories}
          formQuestionsIds={formQuestionsIds}
          showTitle={false}
        />
      </CustomModal>
    </div>
  );
};

export default ClientV2;
