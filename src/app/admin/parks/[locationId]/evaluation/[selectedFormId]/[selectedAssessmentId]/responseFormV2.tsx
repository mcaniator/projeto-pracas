"use client";

import { Box, Button, Typography } from "@mui/material";
import { IconMap } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";

import CAccordion from "../../../../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../../../../components/ui/accordion/CAccordionSummary";
import CButton from "../../../../../../../components/ui/cButton";
import CCheckboxGroup from "../../../../../../../components/ui/cCheckboxGroup";
import CNumberField from "../../../../../../../components/ui/cNumberField";
import CRadioGroup from "../../../../../../../components/ui/cRadioGroup";
import CTextField from "../../../../../../../components/ui/cTextField";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "../../../../../../../lib/serverFunctions/queries/assessment";
import { ResponseGeometry } from "../../../../../../../lib/types/assessments/geometry";
import { Calculation } from "../../../../../../../lib/utils/calculationUtils";
import { FormItemUtils } from "../../../../../../../lib/utils/formTreeUtils";
import MapDialog from "./MapDialog";

type FormValues = {
  [key: string]: string | number | string[] | null;
};

type ResponseFormGeometry = {
  questionId: number;
  geometries: ResponseGeometry[];
};

const ResponseFormV2 = ({
  assessmentTree,
}: {
  assessmentTree: {
    id: number;
    formName: string;
    totalQuestions: number;
    categories: AssessmentCategoryItem[];
  };
}) => {
  const { control, handleSubmit } = useForm<FormValues>({
    mode: "onChange",
  });
  const [numericResponses, setNumericResponses] = useState(
    new Map<number, number>(),
  );

  const [geometries, setGeometries] = useState<ResponseFormGeometry[]>([]);

  const allValues = useWatch({ control });

  const filledCount = Object.values(allValues).filter(
    (v) => v != null && v !== "" && (!(v instanceof Array) || v.length > 0),
  ).length;

  const totalQuestions = assessmentTree.totalQuestions;

  const handleQuestionGeometryChange = ({
    questionId,
    geometries,
  }: {
    questionId: number;
    geometries: ResponseGeometry[];
  }) => {
    setGeometries((prev) => {
      if (prev.some((p) => p.questionId === questionId)) {
        return prev.map((p) => {
          if (p.questionId === questionId) {
            return { questionId: questionId, geometries: geometries };
          } else {
            return p;
          }
        });
      } else {
        prev.push({ questionId: questionId, geometries: geometries });
        return [...prev];
      }
    });
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  useEffect(() => {
    const numericResponses = new Map<number, number>();
    Object.entries(allValues).forEach(([key, val]) => {
      if (typeof val === "number") {
        numericResponses.set(Number(key), val);
      }
    });
    setNumericResponses(numericResponses);
  }, [allValues]);

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      className="flex w-full flex-col gap-4"
    >
      {assessmentTree.categories.map((cat, index) => (
        <Category
          key={index}
          category={cat}
          numericResponses={numericResponses}
          geometries={geometries}
          handleQuestionGeometryChange={handleQuestionGeometryChange}
          control={control}
        />
      ))}

      <Typography mt={2} className="text-black">
        Campos preenchidos: {filledCount} / {totalQuestions}
      </Typography>

      <Button type="submit" variant="contained">
        Salvar
      </Button>
    </form>
  );
};

const Category = ({
  category,
  numericResponses,
  geometries,
  handleQuestionGeometryChange,
  control,
}: {
  category: AssessmentCategoryItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
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
                  numericResponses={numericResponses}
                  geometries={geometries}
                  handleQuestionGeometryChange={handleQuestionGeometryChange}
                  control={control}
                />
              );
            } else if (FormItemUtils.isQuestionType(child)) {
              return (
                <Question
                  key={index}
                  question={child}
                  numericResponses={numericResponses}
                  geometries={geometries}
                  handleQuestionGeometryChange={handleQuestionGeometryChange}
                  control={control}
                />
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
  numericResponses,
  geometries,
  handleQuestionGeometryChange,
  control,
}: {
  subcategory: AssessmentSubcategoryItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
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
              <Question
                key={index}
                question={question}
                numericResponses={numericResponses}
                geometries={geometries}
                handleQuestionGeometryChange={handleQuestionGeometryChange}
                control={control}
              />
            ))}
          </div>
        </CAccordionDetails>
      </CAccordion>
    </Box>
  );
};

const Question = ({
  question,
  numericResponses,
  geometries,
  handleQuestionGeometryChange,
  control,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  const [openMapDialog, setOpenMapDialog] = useState(false);
  return (
    <Box
      sx={{ border: 1, borderColor: "primary.main", borderRadius: 1 }}
      className="flex flex-col justify-between px-4 py-2"
    >
      <div className="flex flex-row items-center gap-1">{question.name}</div>
      <div className="mb-1 flex flex-wrap justify-start gap-1">
        {question.geometryTypes.length > 0 && (
          <>
            <CButton
              square
              onClick={() => {
                setOpenMapDialog(true);
              }}
            >
              <IconMap />
            </CButton>
            <MapDialog
              openMapDialog={openMapDialog}
              onClose={() => {
                setOpenMapDialog(false);
              }}
              questionId={question.questionId}
              questionName={question.name}
              initialGeometries={
                geometries.find((g) => g.questionId === question.questionId)
                  ?.geometries
              }
              geometryType={question.geometryTypes}
              handleQuestionGeometryChange={(e, v) => {
                handleQuestionGeometryChange({ questionId: e, geometries: v });
              }}
            />
          </>
        )}
      </div>

      {question.questionType === "WRITTEN" && (
        <WrittenQuestion
          question={question}
          numericResponses={numericResponses}
          control={control}
        />
      )}

      {question.questionType === "OPTIONS" && (
        <OptionsQuestion question={question} control={control} />
      )}
    </Box>
  );
};

const WrittenQuestion = ({
  question,
  numericResponses,
  control,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  if (question.calculationExpression) {
    return (
      <CalculationQuestion
        question={question}
        numericResponses={numericResponses}
        control={control}
      />
    );
  }
  return question.characterType === "NUMBER" ?
      <Controller
        name={String(question.questionId)}
        control={control}
        render={({ field }) => <CNumberField {...field} />}
      />
    : <Controller
        name={String(question.questionId)}
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
        name={String(question.questionId)}
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
        name={String(question.questionId)}
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

const CalculationQuestion = ({
  question,
  numericResponses,
  control,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const calc = new Calculation(
      question.calculationExpression!,
      numericResponses,
    );
    setValue(calc.evaluate());
  }, [numericResponses, question.calculationExpression]);
  return (
    <Controller
      name={String(question.questionId)}
      control={control}
      render={({ field }) => <CNumberField {...field} readOnly value={value} />}
    />
  );
};

export default ResponseFormV2;
