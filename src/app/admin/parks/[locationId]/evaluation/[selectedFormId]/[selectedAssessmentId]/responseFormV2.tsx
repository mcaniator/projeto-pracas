"use client";

import { Box, Button, Typography } from "@mui/material";
import { Control, Controller, useForm, useWatch } from "react-hook-form";

import CAccordion from "../../../../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../../../../components/ui/accordion/CAccordionSummary";
import CCheckboxGroup from "../../../../../../../components/ui/cCheckboxGroup";
import CNumberField from "../../../../../../../components/ui/cNumberField";
import CRadioGroup from "../../../../../../../components/ui/cRadioGroup";
import CTextField from "../../../../../../../components/ui/cTextField";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "../../../../../../../lib/serverFunctions/queries/assessment";
import { FormItemUtils } from "../../../../../../../lib/utils/formTreeUtils";

type FormValues = {
  [key: string]: string | number | string[] | null;
};
const ResponseFormV2 = ({
  assessmentTree,
}: {
  assessmentTree: {
    id: number;
    formName: string;
    categories: AssessmentCategoryItem[];
  };
}) => {
  const { control, handleSubmit } = useForm<FormValues>({
    mode: "onChange",
  });

  const allValues = useWatch({ control });

  const filledCount = Object.values(allValues).filter(
    (v) => v != null && v !== "" && (!(v instanceof Array) || v.length > 0),
  ).length;

  const totalQuestions = 10;

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      className="flex w-full flex-col gap-4"
    >
      {assessmentTree.categories.map((cat, index) => (
        <Category key={index} category={cat} control={control} />
      ))}

      <Typography mt={2} className="text-black">
        Campos preenchidos: {filledCount} / {totalQuestions}
      </Typography>

      <Button type="submit" variant="contained">
        Enviar
      </Button>
    </form>
  );
};

const Category = ({
  category,
  control,
}: {
  category: AssessmentCategoryItem;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  return (
    <CAccordion defaultExpanded>
      <CAccordionSummary>
        <div className="flex flex-row items-center gap-1">{category.name}</div>
      </CAccordionSummary>
      <CAccordionDetails>
        <div className="flex flex-col gap-3">
          {category.categoryChildren.map((child, index) => {
            if (FormItemUtils.isSubcategoryType(child)) {
              return (
                <Subcategory
                  key={index}
                  subcategory={child}
                  control={control}
                />
              );
            } else if (FormItemUtils.isQuestionType(child)) {
              return (
                <Question key={index} question={child} control={control} />
              );
            }
          })}
        </div>
      </CAccordionDetails>
    </CAccordion>
  );
};

const Subcategory = ({
  subcategory,
  control,
}: {
  subcategory: AssessmentSubcategoryItem;
  control: Control<FormValues, unknown, FormValues>;
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
      <CAccordion defaultExpanded>
        <CAccordionSummary>
          <div className="flex flex-row items-center gap-1">
            {subcategory.name}
          </div>
        </CAccordionSummary>
        <CAccordionDetails>
          <div className="flex flex-col gap-3">
            {subcategory.questions.map((question, index) => (
              <Question key={index} question={question} control={control} />
            ))}
          </div>
        </CAccordionDetails>
      </CAccordion>
    </Box>
  );
};

const Question = ({
  question,
  control,
}: {
  question: AssessmentQuestionItem;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  return (
    <Box
      sx={{ border: 1, borderColor: "primary.main", borderRadius: 1 }}
      className="flex flex-col justify-between px-4 py-2"
    >
      <div className="flex flex-row items-center gap-1">{question.name}</div>

      {question.questionType === "WRITTEN" && (
        <WrittenQuestion question={question} control={control} />
      )}

      {question.questionType === "OPTIONS" && (
        <OptionsQuestion question={question} control={control} />
      )}
    </Box>
  );
};

const WrittenQuestion = ({
  question,
  control,
}: {
  question: AssessmentQuestionItem;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  return question.characterType === "NUMBER" ?
      <Controller
        name={String(question.id)}
        control={control}
        render={({ field }) => <CNumberField {...field} />}
      />
    : <Controller
        name={String(question.id)}
        control={control}
        render={({ field }) => <CTextField {...field} />}
      />;
};

const OptionsQuestion = ({
  question,
  control,
}: {
  question: AssessmentQuestionItem;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  if (!question.options) {
    throw new Error("Options questions must have options");
  }
  if (question.optionType === "CHECKBOX") {
    return (
      <Controller
        name={String(question.id)}
        control={control}
        render={({ field }) => (
          <CCheckboxGroup
            {...field}
            value={Array.isArray(field.value) ? field.value : []}
            clearable
            options={question.options!.map((opt) => opt.text)}
            getOptionValue={(opt) => opt}
            getOptionLabel={(opt) => opt}
          />
        )}
      />
    );
  } else {
    return (
      <Controller
        name={String(question.id)}
        control={control}
        render={({ field }) => (
          <CRadioGroup
            {...field}
            value={Array.isArray(field.value) ? null : field.value}
            label={question.characterType}
            clearable
            onChange={(e) => field.onChange(e)}
            isNumber={question.characterType === "NUMBER"}
            options={question.options!.map((opt) => opt.text)}
            getOptionValue={(opt) => opt}
            getOptionLabel={(opt) => opt}
          />
        )}
      />
    );
  }
};

export default ResponseFormV2;
