import { MentionsTextField } from "@jackstenglein/mui-mentions";
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

import CAutocomplete from "../../../../../../components/ui/cAutoComplete";
import CButton from "../../../../../../components/ui/cButton";
import CNumberField from "../../../../../../components/ui/cNumberField";
import { Calculation } from "../../../../../../lib/utils/calculationUtils";
import { FormItemUtils } from "../../../../../../lib/utils/formTreeUtils";
import {
  CategoryItem,
  FormEditorTree,
  QuestionItem,
  SubcategoryItem,
} from "./clientV2";

type TestValue = Map<number, number | null>;

const CalculationCreation = ({
  formTree,
  setEnableCalculationSave,
}: {
  formTree: FormEditorTree;
  setEnableCalculationSave: Dispatch<SetStateAction<boolean>>;
}) => {
  const [expression, setExpression] = useState("");
  const [selectedTargetQuestion, setSelectedTargetQuestion] = useState<{
    id: string;
    display: string;
  } | null>(null);

  const [mentions, setMentions] = useState<{ id: string; display: string }[]>(
    [],
  );
  const [filteredCategories, setFilteredCategories] = useState<CategoryItem[]>(
    [],
  );
  const [validExpression, setValidExpresssion] = useState(false);

  const [testValues, setTestValues] = useState<TestValue>(new Map());

  const [testResult, setTestResult] = useState<number | null>(null);

  useEffect(() => {
    const newMentions: { id: string; display: string }[] = [];
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
              newMentions.push({
                id: String(q.questionId),
                display: `${q.name} {id:${q.questionId}}`,
              });
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
              newMentions.push({
                id: String(q.questionId),
                display: `${q.name} {id:${q.questionId}}`,
              });
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

  useEffect(() => {
    const calc = new Calculation(expression);
    const valid = calc.validateExpression();
    setValidExpresssion(valid);
    setEnableCalculationSave(valid);
  }, [expression, setEnableCalculationSave]);

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
        options={mentions}
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
      <MentionsTextField
        label="Expressão"
        fullWidth
        multiline
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
            data: mentions.filter((m) => m.id !== selectedTargetQuestion?.id),
            ignoreAccents: true,
          },
        ]}
        onChange={(newVal) => {
          setExpression(newVal);
        }}
      />

      <div>Utilize os campos abaixo para testar a expressão:</div>

      <CNumberField label="Resultado" disabled value={testResult} />

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
            setValue(Number(e.target.value));
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
          <div>
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
