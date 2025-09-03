"use client";

import { Button } from "@components/button";
import CustomModal from "@components/modal/customModal";
import CTextField from "@components/ui/cTextField";
import { useHelperCard } from "@context/helperCardContext";
import { useLoadingOverlay } from "@context/loadingContext";
import { FormQuestionWithCategoryAndSubcategory } from "@customTypes/forms/formCreation";
import { DndContext, closestCorners } from "@dnd-kit/core";
import {
  FormItemType,
  OptionTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { CategoriesWithQuestionsAndStatusCode } from "@queries/category";
import { FormToEditPage } from "@queries/form";
import { _updateFormV2 } from "@serverActions/formUtil";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import QuestionFormV2 from "./questionFormV2";

const FormEditor = dynamic(() => import("./formEditor"), {
  ssr: false,
});

type FormEditorTree = {
  id: number;
  name: string;
  categories: {
    id: number;
    name: string;
    position: number;
    formItems: {
      formItemType: FormItemType;
      position: number;
      referenceId: number;
      name: string;
      notes: string | null;
      questionType?: QuestionTypes; //only if type = QUESTION
      characterType?: QuestionResponseCharacterTypes; //only if type = QUESTION
      optionType?: OptionTypes | null; //only if type = QUESTION
      options?: {
        //only if type = QUESTION
        text: string;
      }[];
      questions?: {
        //only if type = SUBCATEGORY
        referenceId: number;
        name: string;
        notes: string | null;
        questionType: QuestionTypes;
        position: number;
        characterType: QuestionResponseCharacterTypes;
        optionType: OptionTypes | null;
        options: {
          text: string;
        }[];
      }[];
    }[];
  }[];
};

const ClientV2 = ({
  dbFormTree,
  categories,
}: {
  dbFormTree: FormEditorTree;
  categories: CategoriesWithQuestionsAndStatusCode;
}) => {
  const { setHelperCard } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [isMobileView, setIsMobileView] = useState<boolean>(true);
  const [formName, setFormName] = useState("test");
  const [formQuestionsIds, setFormQuestionsIds] = useState<number[]>([]);
  const [formTree, setFormTree] = useState<FormEditorTree>(dbFormTree);
  const [openQuestionFormModal, setOpenQuestionFormModal] = useState(false);

  const addQuestion = (question: FormQuestionWithCategoryAndSubcategory) => {
    if (formQuestionsIds.includes(question.id)) return;

    setFormTree((prev) => {
      const categoryId = question.category.id;
      const subcategoryId = question.subcategory?.id;

      // Busca ou cria categoria
      let category = prev.categories.find((cat) => cat.id === categoryId);
      if (!category) {
        category = {
          id: categoryId,
          name: question.category.name,
          position: prev.categories.length + 1,
          formItems: [],
        };
      }

      let newCategory = { ...category };

      if (subcategoryId) {
        // Adiciona questão dentro de subcategoria
        let subItem = newCategory.formItems.find(
          (item) =>
            item.formItemType === "SUBCATEGORY" &&
            item.referenceId === subcategoryId,
        );

        if (!subItem) {
          subItem = {
            formItemType: "SUBCATEGORY",
            referenceId: subcategoryId,
            name: question.subcategory!.name,
            position: newCategory.formItems.length + 1, // insere no final
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
              referenceId: question.id,
              name: question.name,
              notes: question.notes,
              questionType: question.questionType,
              position: (subItem.questions?.length ?? 0) + 1,
              characterType: question.characterType,
              optionType: question.optionType,
              options: question.options,
            },
          ],
        };

        // Atualiza formItems substituindo ou adicionando subcategoria
        const newFormItems = [
          ...newCategory.formItems.filter(
            (item) =>
              !(
                item.formItemType === "SUBCATEGORY" &&
                item.referenceId === subcategoryId
              ),
          ),
          subItem,
        ].sort((a, b) => a.position - b.position);

        newCategory = { ...newCategory, formItems: newFormItems };
      } else {
        // Adiciona questão direta na categoria
        const questionItem: (typeof newCategory.formItems)[number] = {
          formItemType: "QUESTION",
          referenceId: question.id,
          name: question.name,
          notes: question.notes,
          questionType: question.questionType,
          characterType: question.characterType,
          optionType: question.optionType,
          options: question.options,
          position: newCategory.formItems.length + 1,
        };

        newCategory = {
          ...newCategory,
          formItems: [...newCategory.formItems, questionItem].sort(
            (a, b) => a.position - b.position,
          ),
        };
      }

      // Atualiza lista de categorias
      const newCategories = [
        ...prev.categories.filter((cat) => cat.id !== categoryId),
        newCategory,
      ].sort((a, b) => a.position - b.position);

      return { ...prev, categories: newCategories };
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

  useEffect(() => {
    console.log("TREE CHANGED");
    const questionsIds: number[] = [];
    formTree.categories.forEach((c) => {
      c.formItems.forEach((fi) => {
        if (fi.formItemType === "QUESTION") {
          questionsIds.push(fi.referenceId);
        } else if (fi.formItemType === "SUBCATEGORY") {
          fi.questions?.forEach((q) => {
            questionsIds.push(q.referenceId);
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
        formId: dbFormTree.id,
        oldFormName: dbFormTree.name,
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
              {!isMobileView && (
                <Button
                  className="w-fit"
                  variant={"constructive"}
                  onPress={() => {
                    void handleUpdateForm();
                  }}
                >
                  Salvar
                </Button>
              )}
            </div>
            {isMobileView && (
              <div className="flex items-center gap-2">
                <Button
                  onPress={() => {
                    setOpenQuestionFormModal(true);
                  }}
                >
                  Questões
                </Button>
                <Button
                  className="w-fit"
                  variant={"constructive"}
                  onPress={() => {
                    void handleUpdateForm();
                  }}
                >
                  Salvar
                </Button>
              </div>
            )}
            {<FormEditor formTree={formTree} setFormTree={setFormTree} />}
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
      <CustomModal
        disableModalActions
        fullWidth
        isOpen={openQuestionFormModal}
        onOpenChange={(e) => {
          setOpenQuestionFormModal(e);
        }}
      >
        <QuestionFormV2
          addQuestion={addQuestion}
          categories={categories.categories}
          formQuestionsIds={formQuestionsIds}
        />
      </CustomModal>
    </div>
  );
};

export default ClientV2;
export type { FormEditorTree };
