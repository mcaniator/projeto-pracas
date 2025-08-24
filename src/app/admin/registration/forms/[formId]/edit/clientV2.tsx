"use client";

import { Button } from "@components/button";
import CTextField from "@components/ui/cTextField";
import { useHelperCard } from "@context/helperCardContext";
import { useLoadingOverlay } from "@context/loadingContext";
import { FormQuestionWithCategoryAndSubcategory } from "@customTypes/forms/formCreation";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { CategoriesWithQuestionsAndStatusCode } from "@queries/category";
import { FormToEditPage } from "@queries/form";
import { _updateFormV2 } from "@serverActions/formUtil";
import { useEffect, useState } from "react";

import { FormEditor } from "./formEditor";
import QuestionFormV2 from "./questionFormV2";

type FormQuestionWithCategoryAndSubcategoryAndPosition =
  FormQuestionWithCategoryAndSubcategory & {
    position: number;
  };

type FormEditorTree = {
  categories: {
    id: number;
    name: string;
    position: number;
    questions: FormQuestionWithCategoryAndSubcategoryAndPosition[];
    subcategories: {
      id: number;
      name: string;
      position: number;
      questions: FormQuestionWithCategoryAndSubcategoryAndPosition[];
    }[];
  }[];
};

const ClientV2 = ({
  form,
  categories,
}: {
  form: FormToEditPage;
  categories: CategoriesWithQuestionsAndStatusCode;
}) => {
  const { setHelperCard } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [isMobileView, setIsMobileView] = useState<boolean>(true);
  const [formName, setFormName] = useState(form.name);
  const [formQuestionsToUpdate, setFormQuestionsToUpdate] = useState<
    { id: number; position: number }[]
  >([]);
  const [formQuestionsToRemove, setFormQuestionsToRemove] = useState<
    { id: number }[]
  >([]);
  const [questionsToAdd, setQuestionsToAdd] = useState<{ id: number }[]>([]);
  const [formQuestionsIds, setFormQuestionsIds] = useState<number[]>([]);
  const [formTree, setFormTree] = useState<FormEditorTree>({ categories: [] });

  const addQuestion = (question: FormQuestionWithCategoryAndSubcategory) => {
    if (formQuestionsIds.includes(question.id)) {
      return;
    }
    setFormQuestionsIds((prev) => {
      const newArr = [...prev];
      newArr.push(question.id);
      return newArr;
    });
    console.log("adding:", question);
    const categoryId = question.category.id;
    const subcategoryId = question.subcategory?.id;
    setFormTree((prev) => {
      const categoryId = question.category.id;
      const subcategoryId = question.subcategory?.id;

      // Verifica se a categoria existe
      let category = prev.categories.find((cat) => cat.id === categoryId);

      // Se não existir, cria a categoria
      if (!category) {
        category = {
          id: categoryId,
          name: question.category.name,
          position: prev.categories.length + 1,
          questions: [],
          subcategories: [],
        };
      }

      let newCategory = { ...category }; // Cria cópia da categoria para não mutar

      if (subcategoryId) {
        // Trabalha com subcategoria
        let sub = newCategory.subcategories.find((s) => s.id === subcategoryId);

        if (!sub) {
          sub = {
            id: subcategoryId,
            name: question.subcategory!.name,
            position: newCategory.subcategories.length + 1,
            questions: [],
          };
        }

        // Cria novo array de questões da subcategoria
        const newSubQuestions = [
          ...sub.questions,
          { ...question, position: sub.questions.length + 1 },
        ];
        sub = { ...sub, questions: newSubQuestions };

        // Atualiza o array de subcategorias
        const newSubcategories = [
          ...newCategory.subcategories.filter((s) => s.id !== subcategoryId),
          sub,
        ];

        newCategory = { ...newCategory, subcategories: newSubcategories };
      } else {
        // Questão sem subcategoria
        const newQuestions = [
          ...newCategory.questions,
          { ...question, position: newCategory.questions.length + 1 },
        ];
        newCategory = { ...newCategory, questions: newQuestions };
      }

      // Atualiza a lista de categorias
      const newCategories = [
        ...prev.categories.filter((cat) => cat.id !== categoryId),
        newCategory,
      ].sort((a, b) => a.position - b.position);

      return { ...prev, categories: newCategories };
    });
  };

  const removeQuestionId = (questionId: number) => {
    setFormQuestionsIds((prev) => {
      return prev.filter((id) => id !== questionId);
    });
  };

  console.log(formTree);

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

  const handleUpdateForm = async () => {
    try {
      setLoadingOverlay({ show: true, message: "Salvando..." });
      const response = await _updateFormV2({
        formId: form.id,
        oldFormName: form.name,
        newFormName: formName,
        formQuestionsToUpdate: formQuestionsToUpdate,
        formQuestionsToRemove: formQuestionsToRemove,
        questionsToAdd: questionsToAdd,
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
    <div className="flex h-full flex-col bg-white">
      <div className="grid h-full grid-cols-5 gap-2 overflow-auto">
        <div
          className={`${
            isMobileView ? "col-span-5" : "col-span-3"
          } overflow-auto`}
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center justify-between">
              <CTextField
                label="Nome"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                }}
              />
              <Button
                className="w-fit"
                variant={"constructive"}
                onPress={() => {
                  handleUpdateForm();
                }}
              >
                Salvar
              </Button>
            </div>
            <FormEditor
              formTree={formTree}
              setFormTree={setFormTree}
              removeQuestionId={removeQuestionId}
            />
          </div>
        </div>
        <div
          className={`col-span-2 h-full overflow-auto ${isMobileView ? "hidden" : ""}`}
        >
          <QuestionFormV2
            addQuestion={addQuestion}
            categories={categories.categories}
            formQuestionsIds={formQuestionsIds}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientV2;
export type {
  FormEditorTree,
  FormQuestionWithCategoryAndSubcategoryAndPosition,
};
