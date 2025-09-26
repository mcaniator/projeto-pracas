import CMentionsTextField from "../../../../../../components/ui/cMentionsTextField";
import { CalculationParams, Mention } from "./calculationDialog";

const Calculations = ({
  formCalculations,
  mentions,
}: {
  formCalculations: CalculationParams[];
  mentions: Mention[];
}) => {
  return (
    <div className="mt-2 flex flex-col gap-1">
      {formCalculations.length === 0 && (
        <div className="font-semibold">
          Nenhum cálculo criado para este formulário ainda!
        </div>
      )}
      {formCalculations.map((calc, index) => (
        <div key={index} className="flex flex-col gap-2 p-1 outline outline-1">
          <div>{calc.questionName}</div>
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
