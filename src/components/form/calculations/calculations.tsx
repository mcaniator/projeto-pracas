import type { CalculationParams } from "@/lib/types/forms/formStructure";
import CButton from "@components/ui/cButton";
import CMentionsTextField from "@components/ui/cMentionsTextField";
import { IconTrash } from "@tabler/icons-react";

import type { Mention } from "./calculationDialog";

const Calculations = ({
  formCalculations,
  mentions,
  isFinalized,
  onCalculationsChange,
}: {
  formCalculations: CalculationParams[];
  mentions: Mention[];
  isFinalized: boolean;
  onCalculationsChange: (calculations: CalculationParams[]) => void;
}) => {
  const removeCalculation = (calculationToRemove: CalculationParams) => {
    onCalculationsChange(
      formCalculations.filter(
        (p) => p.targetQuestionId !== calculationToRemove.targetQuestionId,
      ),
    );
  };
  return (
    <div className="mt-2 flex flex-col gap-1">
      {formCalculations.length === 0 && (
        <div className="font-semibold">
          Nenhum cálculo criado para este formulário ainda!
        </div>
      )}
      {formCalculations.map((calc, index) => (
        <div key={index} className="flex flex-col gap-2 p-1 outline outline-1">
          <div
            className={
              `flex flex-row justify-between ` +
              ` ${isFinalized ? "justify-start" : "justify-end"}`
            }
          >
            <div>{calc.questionName}</div>
            {!isFinalized && (
              <CButton
                dense
                color="error"
                onClick={() => {
                  removeCalculation(calc);
                }}
              >
                <IconTrash />
              </CButton>
            )}
          </div>
          <CMentionsTextField
            label="Expressão"
            fullWidth
            multiline
            highlightColor="primary.main"
            size="small"
            highlightTextColor
            value={calc.expression}
            dataSources={[{ data: mentions }]}
            readOnly
          />
        </div>
      ))}
    </div>
  );
};

export default Calculations;
