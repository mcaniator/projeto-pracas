import { MentionsTextField } from "@jackstenglein/mui-mentions";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Switch,
} from "@mui/material";
import { CalculationTypes } from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";

import CAutocomplete from "../../../../../../components/ui/cAutoComplete";
import CCheckbox from "../../../../../../components/ui/cCheckbox";
import CTextField from "../../../../../../components/ui/cTextField";
import { calculationTypesTranslationMap } from "../../../../../../lib/translationMaps/assessment";
import { FormItemUtils } from "../../../../../../lib/utils/formTreeUtils";
import {
  CategoryItem,
  FormEditorTree,
  QuestionItem,
  SubcategoryItem,
} from "./clientV2";

const CalculationCreation = ({ formTree }: { formTree: FormEditorTree }) => {
  const calculationTypes = Object.values(CalculationTypes).map((type) => ({
    value: type,
    label: calculationTypesTranslationMap.get(type)!,
  }));
  const [selectedType, setSelectedType] = useState<{
    value: CalculationTypes;
    label: string;
  } | null>(null);
  const [selectedTargetQuestion, setSelectedTargetQuestion] =
    useState<QuestionItem | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set<number>(),
  );
  const filteredCategories = formTree.categories.reduce<CategoryItem[]>(
    (acc, cat) => {
      const catQuestions = cat.categoryChildren.filter(
        (child) =>
          FormItemUtils.isQuestionType(child) &&
          child.characterType === "NUMBER",
      );
      const subCats = cat.categoryChildren
        .filter((child) => FormItemUtils.isSubcategoryType(child))
        .map((sub) => ({
          ...sub,
          questions: sub.questions.filter((q) => q.characterType === "NUMBER"),
        }))
        .filter((sub) => sub.questions.length > 0);
      if (catQuestions.length > 0 || (subCats && subCats.length > 0)) {
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
  console.log(selectedQuestions);
  const [mention, setMention] = useState("");
  const stormlight = [
    { id: "kaladin", display: "Kaladin Stormblessed" },
    { id: "adolin", display: "Adolin Kholin" },
    { id: "shallan", display: "Shallan Davar" },
    { id: "dalinar", display: "Dalinar Kholin" },
    { id: "renarin", display: "Renarin Kholin" },
    { id: "syl", display: "Syl" },
    { id: "teft", display: "Teft" },
    { id: "hoid", display: "Hoid" },
    { id: "moash", display: "Moash" },
    { id: "sadeas", display: "Torol Sadeas" },
    { id: "amaram", display: "Amaram" },
    { id: "nohadon", display: "Nohadon" },
  ];
  const defaultValue = "Hello, @[Kaladin Stormblessed](kaladin)!";
  return (
    <div className="flex flex-col">
      <MentionsTextField
        label="Trigger with #"
        fullWidth
        dataSources={[
          {
            data: stormlight,
            trigger: "#",
          },
        ]}
      />
      <CAutocomplete
        label="Tipo"
        value={selectedType}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option === value}
        options={calculationTypes}
        onChange={(_, val) => {
          setSelectedType(val);
        }}
      />
      <CTextField
        label="Questão-alvo"
        disabled
        value={selectedTargetQuestion?.name ?? ""}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />
      <div className="flex flex-row items-center">
        Total de questões:{" "}
        <Chip
          label={selectedQuestions.size}
          className="ml-1"
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            fontWeight: "bold",
          }}
        />
      </div>
      <div className="flex flex-row items-center">
        Selecione a questão-alvo com : <Switch checked={true} />
      </div>
      <div className="flex flex-row items-center">
        Selecione as questões que farão parte do cálculo com :{" "}
        <CCheckbox checked={true} />
      </div>
      <div className="flex flex-col gap-1">
        {filteredCategories.map((category, index) => (
          <Category
            key={index}
            category={category}
            selectedQuestions={selectedQuestions}
            setSelectedTargetQuestion={setSelectedTargetQuestion}
            setSelectedQuestions={setSelectedQuestions}
          />
        ))}
      </div>
    </div>
  );
};

const Category = ({
  category,
  selectedQuestions,
  setSelectedTargetQuestion,
  setSelectedQuestions,
}: {
  category: FormEditorTree["categories"][number];
  selectedQuestions: Set<number>;
  setSelectedTargetQuestion: Dispatch<SetStateAction<QuestionItem | null>>;
  setSelectedQuestions: Dispatch<SetStateAction<Set<number>>>;
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
            <CCheckbox
              checked={
                category.categoryChildren
                  .filter((child) => FormItemUtils.isQuestionType(child))
                  .every((child) => selectedQuestions.has(child.questionId)) &&
                category.categoryChildren
                  .filter((child) => FormItemUtils.isSubcategoryType(child))
                  .every((sub) =>
                    sub.questions.every((question) =>
                      selectedQuestions.has(question.questionId),
                    ),
                  )
              }
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedQuestions((prev) => {
                    const newSet = new Set(prev);
                    category.categoryChildren.forEach((child) => {
                      if (FormItemUtils.isSubcategoryType(child)) {
                        child.questions.forEach((q) => {
                          newSet.add(q.questionId);
                        });
                      } else {
                        newSet.add(child.questionId);
                      }
                    });
                    return newSet;
                  });
                } else {
                  setSelectedQuestions((prev) => {
                    const newSet = new Set(prev);
                    category.categoryChildren.forEach((child) => {
                      if (FormItemUtils.isSubcategoryType(child)) {
                        child.questions.forEach((question) => {
                          newSet.delete(question.questionId);
                        });
                      } else {
                        newSet.delete(child.questionId);
                      }
                    });
                    return newSet;
                  });
                }
              }}
            />
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
                    selectedQuestions={selectedQuestions}
                    setSelectedTargetQuestion={setSelectedTargetQuestion}
                    setSelectedQuestions={setSelectedQuestions}
                  />
                );
              }
              return (
                <Question
                  key={index}
                  question={child}
                  selectedQuestions={selectedQuestions}
                  setSelectedTargetQuestion={setSelectedTargetQuestion}
                  setSelectedQuestions={setSelectedQuestions}
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
  selectedQuestions,
  setSelectedTargetQuestion,
  setSelectedQuestions,
}: {
  subcategory: SubcategoryItem;
  selectedQuestions: Set<number>;
  setSelectedTargetQuestion: Dispatch<SetStateAction<QuestionItem | null>>;
  setSelectedQuestions: Dispatch<SetStateAction<Set<number>>>;
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
            <CCheckbox
              checked={subcategory.questions.every((q) =>
                selectedQuestions.has(q.questionId),
              )}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedQuestions((prev) => {
                    const newSet = new Set(prev);
                    subcategory.questions.forEach((q) => {
                      newSet.add(q.questionId);
                    });
                    return newSet;
                  });
                } else {
                  setSelectedQuestions((prev) => {
                    const newSet = new Set(prev);
                    subcategory.questions.forEach((q) => {
                      newSet.delete(q.questionId);
                    });
                    return newSet;
                  });
                }
              }}
            />
            {subcategory.name}
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="flex flex-col gap-1">
            {subcategory.questions.map((question, index) => (
              <Question
                key={index}
                question={question}
                selectedQuestions={selectedQuestions}
                setSelectedQuestions={setSelectedQuestions}
                setSelectedTargetQuestion={setSelectedTargetQuestion}
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
  selectedQuestions,
  setSelectedTargetQuestion,
  setSelectedQuestions,
}: {
  question: QuestionItem;
  selectedQuestions: Set<number>;
  setSelectedTargetQuestion: Dispatch<SetStateAction<QuestionItem | null>>;
  setSelectedQuestions: Dispatch<SetStateAction<Set<number>>>;
}) => {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "primary.main",
        borderRadius: 1,
      }}
      className="flex flex-row justify-between"
    >
      <div className="flex flex-row items-center gap-1">
        <CCheckbox
          checked={selectedQuestions.has(question.questionId)}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedQuestions((prev) => {
                const newSet = new Set(prev);
                newSet.add(question.questionId);
                return newSet;
              });
            } else {
              setSelectedQuestions((prev) => {
                const newSet = new Set(prev);
                newSet.delete(question.questionId);
                return newSet;
              });
            }
          }}
        />
        {question.name}
      </div>
      <Switch
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedTargetQuestion(question);
          } else {
            setSelectedTargetQuestion(null);
          }
        }}
      />
    </Box>
  );
};

export default CalculationCreation;
