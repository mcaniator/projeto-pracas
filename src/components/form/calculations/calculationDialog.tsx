"use client";

import type {
  CalculationParams,
  CategoryItem,
} from "@/lib/types/forms/formStructure";
import CTabs from "@components/ui/cTabs";
import CDialog from "@components/ui/dialog/cDialog";
import { FormItemUtils } from "@lib/utils/formTreeUtils";
import { Tab } from "@mui/material";
import { QuestionTypes } from "@prisma/client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import CalculationCreation from "./calculationCreation";
import Calculations from "./calculations";

export type Mention = {
  id: string;
  display: string;
  questionType: QuestionTypes;
};

const calculationDialogOptions = [
  { id: 0, label: "Criados" },
  { id: 1, label: "Criar" },
];

const CalculationDialog = ({
  categories,
  openCalculationDialog,
  formCalculations,
  isFinalized,
  setOpenCalculationModal,
  onCalculationsChange,
}: {
  categories: CategoryItem[];
  openCalculationDialog: boolean;
  formCalculations: CalculationParams[];
  isFinalized: boolean;
  setOpenCalculationModal: Dispatch<SetStateAction<boolean>>;
  onCalculationsChange: (calculations: CalculationParams[]) => void;
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
    onCalculationsChange([...formCalculations, newCalculation]);
    setNewCalculation(null);
    setCalculationsDialogState(0);
  };

  useEffect(() => {
    const newMentions: Mention[] = [];
    const newFilteredCategories = categories.reduce<CategoryItem[]>(
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
                  display: `${q.categoryName} ➤${q.subcategoryName ? " " + q.subcategoryName + " " : ""}➤ ${q.name}`,
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
                  display: `${q.categoryName} ➤${q.subcategoryName ? " " + q.subcategoryName + " " : ""}➤ ${q.name}`,
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
  }, [categories]);
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
        <CTabs
          value={calculationsDialogState}
          onChange={(_, value: number) => setCalculationsDialogState(value)}
          aria-label="Modo de administração de cálculos"
        >
          {calculationDialogOptions.map((option) => (
            <Tab key={option.id} value={option.id} label={option.label} />
          ))}
        </CTabs>
      )}

      {calculationsDialogState === 0 && (
        <Calculations
          formCalculations={formCalculations}
          mentions={mentions}
          isFinalized={isFinalized}
          onCalculationsChange={onCalculationsChange}
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
