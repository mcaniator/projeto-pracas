"use client";

import CToggleButtonGroup from "@components/ui/cToggleButtonGroup";
import CDialog from "@components/ui/dialog/cDialog";
import { FormItemUtils } from "@lib/utils/formTreeUtils";
import { QuestionTypes } from "@prisma/client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import CalculationCreation from "./calculationCreation";
import Calculations from "./calculations";
import { CategoryItem, FormEditorTree } from "./clientV2";

export type CalculationParams = {
  targetQuestionId: number;
  questionName: string;
  expression: string;
  expressionQuestionsIds: number[];
};

export type Mention = {
  id: string;
  display: string;
  questionType: QuestionTypes;
};

const CalculationDialog = ({
  formTree,
  openCalculationDialog,
  formCalculations,
  isFinalized,
  setOpenCalculationModal,
  setFormCalculations,
}: {
  formTree: FormEditorTree;
  openCalculationDialog: boolean;
  formCalculations: CalculationParams[];
  isFinalized: boolean;
  setOpenCalculationModal: Dispatch<SetStateAction<boolean>>;
  setFormCalculations: Dispatch<SetStateAction<CalculationParams[]>>;
}) => {
  const [calculationsDialogState, setCalculationsDialogState] = useState(0);
  const [newCalculation, setNewCalculation] =
    useState<CalculationParams | null>(null);

  const [mentions, setMentions] = useState<Mention[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryItem[]>(
    [],
  );
  const addCalculation = () => {
    if (!newCalculation) return;
    setFormCalculations((prev) => {
      const newArr = prev;
      newArr.push(newCalculation);
      return [...newArr];
    });
    setNewCalculation(null);
    setCalculationsDialogState(0);
  };

  useEffect(() => {
    const newMentions: Mention[] = [];
    const newFilteredCategories = formTree.categories.reduce<CategoryItem[]>(
      (acc, cat) => {
        const catQuestions = cat.categoryChildren.filter(
          (child) =>
            FormItemUtils.isQuestionType(child) &&
            child.characterType === "NUMBER",
        );
        const subCats = cat.categoryChildren
          .filter((child) => FormItemUtils.isSubcategoryType(child))
          .map((sub) => {
            sub.questions.forEach((q) => {
              if (q.characterType === "NUMBER") {
                newMentions.push({
                  id: String(q.questionId),
                  display: `${q.name} {id:${q.questionId}}`,
                  questionType: q.questionType,
                });
              }
            });
            return {
              ...sub,
              questions: sub.questions.filter(
                (q) => q.characterType === "NUMBER",
              ),
            };
          })
          .filter((sub) => sub.questions.length > 0);
        if (catQuestions.length > 0 || (subCats && subCats.length > 0)) {
          catQuestions
            .filter((q) => FormItemUtils.isQuestionType(q))
            .forEach((q) => {
              if (q.characterType === "NUMBER") {
                newMentions.push({
                  id: String(q.questionId),
                  display: `${q.name} {id:${q.questionId}}`,
                  questionType: q.questionType,
                });
              }
            });
          const children = catQuestions
            .concat(subCats)
            .sort((a, b) => a.position - b.position);
          acc.push({
            ...cat,
            categoryChildren: children,
          });
        }
        return acc;
      },
      [],
    );
    setFilteredCategories(newFilteredCategories);
    setMentions(newMentions);
  }, [formTree]);
  return (
    <CDialog
      title="Cálculos"
      subtitle="Cálculos preenchem automaticamente o valor de uma questão"
      open={openCalculationDialog}
      fullScreen
      onClose={() => {
        setOpenCalculationModal(false);
      }}
      confirmChildren={<>Criar</>}
      disableDialogActions={calculationsDialogState === 0}
      disableConfirmButton={!newCalculation}
      onConfirm={addCalculation}
    >
      {!isFinalized && (
        <CToggleButtonGroup
          className="mt-2"
          value={calculationsDialogState}
          getLabel={(a) => a.label}
          getValue={(a) => a.id}
          options={[
            { id: 0, label: "Criados" },
            { id: 1, label: "Criar" },
          ]}
          onChange={(e, val) => {
            setCalculationsDialogState(val.id);
          }}
        />
      )}

      {calculationsDialogState === 0 && (
        <Calculations
          formCalculations={formCalculations}
          mentions={mentions}
          isFinalized={isFinalized}
          setFormCalculations={setFormCalculations}
        />
      )}
      {calculationsDialogState === 1 && (
        <CalculationCreation
          formCalculations={formCalculations}
          mentions={mentions}
          filteredCategories={filteredCategories}
          setNewCalculation={setNewCalculation}
        />
      )}
    </CDialog>
  );
};

export default CalculationDialog;
