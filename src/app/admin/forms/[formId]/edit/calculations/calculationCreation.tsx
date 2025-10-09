import CAutocomplete from "@components/ui/cAutoComplete";
import CButton from "@components/ui/cButton";
import CMentionsTextField from "@components/ui/cMentionsTextField";
import CNumberField from "@components/ui/cNumberField";
import { Calculation } from "@lib/utils/calculationUtils";
import { FormItemUtils } from "@lib/utils/formTreeUtils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
  CategoryItem,
  FormEditorTree,
  QuestionItem,
  SubcategoryItem,
} from "../clientV2";
import { CalculationParams, Mention } from "./calculationDialog";

type TestValue = Map<number, number | null>;

const CalculationCreation = ({
  formCalculations,
  mentions,
  filteredCategories,
  setNewCalculation,
}: {
  formCalculations: CalculationParams[];
  mentions: Mention[];
  filteredCategories: CategoryItem[];
  setNewCalculation: Dispatch<SetStateAction<CalculationParams | null>>;
}) => {
  const [expression, setExpression] = useState("");
  const [selectedTargetQuestion, setSelectedTargetQuestion] = useState<{
    id: string;
    display: string;
  } | null>(null);

  const [validExpression, setValidExpresssion] = useState(false);

  const [testValues, setTestValues] = useState<TestValue>(new Map());

  const [testResult, setTestResult] = useState<number | null>(null);

  useEffect(() => {
    const calc = new Calculation(expression);
    const valid = calc.validateExpression();
    setValidExpresssion(valid);
    if (valid && selectedTargetQuestion) {
      setNewCalculation({
        targetQuestionId: parseInt(selectedTargetQuestion.id),
        questionName: selectedTargetQuestion.display,
        expression: expression,
        expressionQuestionsIds: calc.getExpressionQuestionIds(),
      });
    } else {
      setNewCalculation(null);
    }
  }, [expression, selectedTargetQuestion, setNewCalculation]);

  useEffect(() => {
    setExpression("");
  }, [selectedTargetQuestion]);

  useEffect(() => {
    const calc = new Calculation(expression, testValues);
    setTestResult(calc.evaluate());
  }, [testValues, expression]);
  return (
    <div className="mt-4 flex flex-col gap-1">
      <CAutocomplete
        label="Questão-alvo"
        options={mentions.filter(
          (m) =>
            m.questionType === "WRITTEN" &&
            !formCalculations.some(
              (fC) =>
                fC.targetQuestionId === Number(m.id) ||
                fC.expressionQuestionsIds.some((eQ) => eQ === Number(m.id)),
            ),
        )}
        getOptionLabel={(q) => q.display}
        value={selectedTargetQuestion ?? null}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_, newValue) => setSelectedTargetQuestion(newValue)}
      />
      <div>
        Crie uma expressão matemática, podendo selecionar questões com @. É
        necessário ter um espaço antes do @, caso seja precedido por um
        caractere.
      </div>
      <CMentionsTextField
        label="Expressão"
        fullWidth
        highlightColor="primary.main"
        size="small"
        highlightTextColor
        spellCheck={false}
        disabled={!selectedTargetQuestion}
        value={expression}
        error={!validExpression && !!selectedTargetQuestion}
        helperText={
          !validExpression && !!selectedTargetQuestion ?
            "Expressão inválida"
          : " "
        }
        dataSources={[
          {
            data: mentions.filter(
              (m) =>
                m.id !== selectedTargetQuestion?.id &&
                !formCalculations.some(
                  (fc) => fc.targetQuestionId === Number(m.id),
                ),
            ),
            ignoreAccents: true,
          },
        ]}
        onChange={(newVal) => {
          setExpression(newVal);
        }}
      />
      <div>Utilize os campos abaixo para testar a expressão:</div>

      <CNumberField label="Resultado" readOnly value={testResult} />

      <div className="flex flex-col gap-1">
        {filteredCategories.map((category, index) => (
          <Category
            key={index}
            category={category}
            setTestValues={setTestValues}
          />
        ))}
      </div>
    </div>
  );
};

const Category = ({
  category,
  setTestValues,
}: {
  category: FormEditorTree["categories"][number];
  setTestValues: Dispatch<SetStateAction<TestValue>>;
}) => {
  return (
    <div>
      <Accordion
        sx={{
          border: 1,
          borderColor: "primary.main",
          borderRadius: 1,
        }}
        defaultExpanded
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "primary.lighter4",
            "&:hover": {
              backgroundColor: "primary.lighter3",
            },
          }}
          className="max-w-full"
        >
          <div className="flex flex-row items-center gap-1">
            {category.name}
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="flex flex-col gap-1">
            {category.categoryChildren.map((child, index) => {
              if (FormItemUtils.isSubcategoryType(child)) {
                return (
                  <Subcategory
                    key={index}
                    subcategory={child}
                    setTestValues={setTestValues}
                  />
                );
              }
              return (
                <Question
                  key={index}
                  question={child}
                  setTestValues={setTestValues}
                />
              );
            })}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

const Subcategory = ({
  subcategory,
  setTestValues,
}: {
  subcategory: SubcategoryItem;
  setTestValues: Dispatch<SetStateAction<TestValue>>;
}) => {
  return (
    <Box
      sx={{
        padding: "6px",
        border: 1,
        borderColor: "primary.main",
        borderRadius: 1,
      }}
    >
      <Accordion
        sx={{
          border: 1,
          borderColor: "primary.main",
          borderRadius: 1,
        }}
        defaultExpanded
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "primary.lighter4",
            "&:hover": {
              backgroundColor: "primary.lighter3",
            },
          }}
          className="max-w-full"
        >
          <div className="flex flex-row items-center gap-1">
            {subcategory.name}
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="flex flex-col gap-1">
            {subcategory.questions.map((question, index) => (
              <Question
                key={index}
                question={question}
                setTestValues={setTestValues}
              />
            ))}
          </div>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

const Question = ({
  question,
  setTestValues,
}: {
  question: QuestionItem;
  setTestValues: Dispatch<SetStateAction<TestValue>>;
}) => {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    setTestValues((prev) => {
      const newMap = new Map(prev);
      newMap.set(question.questionId, value);
      return newMap;
    });
  }, [value, setTestValues, question.questionId]);
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "primary.main",
        borderRadius: 1,
      }}
      className="flex flex-col justify-between px-4 py-2"
    >
      <div className="flex flex-row items-center gap-1">
        {question.name + ` {Id: ${question.questionId}}`}
      </div>
      {question.questionType === "WRITTEN" && (
        <CNumberField
          label="Valor"
          value={value}
          onChange={(e) => {
            setValue(e);
          }}
        />
      )}
      {question.questionType === "OPTIONS" && (
        <FormControl>
          <FormLabel>Valor</FormLabel>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}
            onChange={(e) => {
              setValue(Number(e.target.value));
            }}
          >
            {question.options?.map((o, index) => (
              <FormControlLabel
                key={index}
                value={Number(o.text)}
                control={<Radio />}
                label={o.text}
              />
            ))}
          </RadioGroup>
          <div className="w-fit">
            <CButton
              variant="outlined"
              dense
              onClick={() => {
                setValue(null);
              }}
            >
              <IconX />
            </CButton>
          </div>
        </FormControl>
      )}
    </Box>
  );
};

export default CalculationCreation;
