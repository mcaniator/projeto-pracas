"use client";

import { Box, Typography } from "@mui/material";
import {
  IconDeviceFloppy,
  IconMap,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";

import { useHelperCard } from "../../../../../../../components/context/helperCardContext";
import CAccordion from "../../../../../../../components/ui/accordion/CAccordion";
import CAccordionDetails from "../../../../../../../components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "../../../../../../../components/ui/accordion/CAccordionSummary";
import CButton from "../../../../../../../components/ui/cButton";
import CButtonFilePicker from "../../../../../../../components/ui/cButtonFilePicker";
import CCheckboxGroup from "../../../../../../../components/ui/cCheckboxGroup";
import CHelpChip from "../../../../../../../components/ui/cHelpChip";
import CNumberField from "../../../../../../../components/ui/cNumberField";
import CRadioGroup from "../../../../../../../components/ui/cRadioGroup";
import CTextField from "../../../../../../../components/ui/cTextField";
import CCalculationChip from "../../../../../../../components/ui/question/cCalculationChip";
import CNotesChip from "../../../../../../../components/ui/question/cNotesChip";
import CQuestionCharacterTypeChip from "../../../../../../../components/ui/question/cQuestionCharacterChip";
import CQuestionGeometryChip from "../../../../../../../components/ui/question/cQuestionGeometryChip";
import CQuestionTypeChip from "../../../../../../../components/ui/question/cQuestionTypeChip";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "../../../../../../../lib/serverFunctions/queries/assessment";
import { ResponseGeometry } from "../../../../../../../lib/types/assessments/geometry";
import { Calculation } from "../../../../../../../lib/utils/calculationUtils";
import { FormItemUtils } from "../../../../../../../lib/utils/formTreeUtils";
import MapDialog from "./MapDialog";
import DeleteAssessmentDialog from "./deleteAssessmentDialog";
import SaveAssessmentDialog from "./saveAssessmentDialog";

export type FormValues = {
  [key: string]: string | number | number[] | null;
};

export type ResponseFormGeometry = {
  questionId: number;
  geometries: ResponseGeometry[];
};

export type SimpleMention = {
  id: string;
  display: string;
};

const ResponseFormV2 = ({
  locationName,
  locationId,
  assessmentTree,
  finalized,
}: {
  locationName: string;
  locationId: number;
  assessmentTree: {
    id: number;
    startDate: Date;
    endDate: Date | null;
    formName: string;
    totalQuestions: number;
    responsesFormValues: FormValues;
    geometries: ResponseFormGeometry[];
    categories: AssessmentCategoryItem[];
  };
  finalized: boolean;
}) => {
  const { setHelperCard } = useHelperCard();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: assessmentTree.responsesFormValues,
  });
  const [numericResponses, setNumericResponses] = useState(
    new Map<number, number>(),
  );

  const [questionsForMention] = useState(() => {
    const questions: SimpleMention[] = [];
    assessmentTree.categories.forEach((c) => {
      c.categoryChildren.forEach((ch) => {
        if (FormItemUtils.isSubcategoryType(ch)) {
          ch.questions.forEach((q) => {
            questions.push({
              id: String(q.questionId),
              display: `${q.name} {id:${q.questionId}}`,
            });
          });
        } else if (FormItemUtils.isQuestionType(ch)) {
          questions.push({
            id: String(ch.questionId),
            display: `${ch.name} {id:${ch.questionId}}`,
          });
        }
      });
    });
    return questions;
  });

  const [importedFinalizationDatetime, setImportedFinalizationDatetime] =
    useState<Dayjs | null>(null);

  const [geometries, setGeometries] = useState<ResponseFormGeometry[]>(
    assessmentTree.geometries,
  );
  const [formValues, setFormValues] = useState<FormValues>({});
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteAssessmentDialog, setOpenDeleteAssessmentDialog] =
    useState(false);

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
    setFormValues(data);
    setOpenSaveDialog(true);
  };

  const importData = async (e: ChangeEvent<HTMLInputElement>) => {
    //TODO: Add validation with Zod
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      if (!parsed || typeof parsed !== "object") {
        throw new Error();
      }

      const importedData = parsed as {
        assessmentId: number;
        responses: FormValues;
        geometries?: ResponseFormGeometry[];
        finalizationDateTime: string | null;
      };

      if (importedData.responses) {
        reset(importedData.responses);
      }

      const incomingGeoms = importedData.geometries ?? [];
      setGeometries(incomingGeoms);

      const finalizationDateTime = dayjs(importedData.finalizationDateTime);
      setImportedFinalizationDatetime(
        finalizationDateTime.isValid() ? finalizationDateTime : null,
      );

      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Avaliação importada!</>,
      });
    } catch (err) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Arquivo inválido!</>,
      });
    }
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
      {!finalized && (
        <div className="flex flex-wrap content-center justify-between gap-1 sm:justify-end">
          <div className="flex gap-1">
            <CHelpChip tooltip="É possível importar uma avaliação salva em seu dispositivo." />
            <CButtonFilePicker
              fileAccept="application/json"
              className="w-fit"
              onFileInput={(e) => {
                void importData(e);
              }}
            >
              <IconUpload />
              Importar
            </CButtonFilePicker>
          </div>

          <CButton
            square
            color="error"
            onClick={() => {
              setOpenDeleteAssessmentDialog(true);
            }}
          >
            <IconTrash />
          </CButton>
        </div>
      )}

      {assessmentTree.categories.map((cat, index) => (
        <Category
          key={index}
          category={cat}
          numericResponses={numericResponses}
          geometries={geometries}
          questionsForMention={questionsForMention}
          finalized={finalized}
          handleQuestionGeometryChange={handleQuestionGeometryChange}
          control={control}
        />
      ))}

      <Typography mt={2} className="text-black">
        Campos preenchidos: {filledCount} / {totalQuestions}
      </Typography>
      <div className="flew-row flex justify-center gap-1">
        <CButton type="submit">
          <IconDeviceFloppy />
          Salvar
        </CButton>
      </div>

      <SaveAssessmentDialog
        locationName={locationName}
        assessmentId={assessmentTree.id}
        open={openSaveDialog}
        formValues={formValues}
        geometries={geometries}
        importedFinalizationDatetime={importedFinalizationDatetime}
        onClose={() => {
          setOpenSaveDialog(false);
        }}
      />
      <DeleteAssessmentDialog
        assessmentId={assessmentTree.id}
        locationId={locationId}
        open={openDeleteAssessmentDialog}
        onClose={() => {
          setOpenDeleteAssessmentDialog(false);
        }}
      />
    </form>
  );
};

const Category = ({
  category,
  numericResponses,
  geometries,
  questionsForMention,
  handleQuestionGeometryChange,
  control,
  finalized,
}: {
  category: AssessmentCategoryItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  questionsForMention: SimpleMention[];
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  return (
    <CAccordion defaultExpanded>
      <CAccordionSummary>
        <div className="flex flex-row items-center gap-1">
          <CNotesChip notes={category.notes} />
          {category.name}
        </div>
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
                  questionsForMention={questionsForMention}
                  finalized={finalized}
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
                  questionsForMention={questionsForMention}
                  finalized={finalized}
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
  questionsForMention,
  handleQuestionGeometryChange,
  control,
  finalized,
}: {
  subcategory: AssessmentSubcategoryItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  questionsForMention: SimpleMention[];
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
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
            <CNotesChip notes={subcategory.notes} />
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
                questionsForMention={questionsForMention}
                finalized={finalized}
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
  questionsForMention,
  handleQuestionGeometryChange,
  control,
  finalized,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  questionsForMention: SimpleMention[];
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  const [openMapDialog, setOpenMapDialog] = useState(false);
  return (
    <Box
      sx={{ border: 1, borderColor: "primary.main", borderRadius: 1 }}
      className="flex flex-col justify-between gap-1 px-4 py-2"
    >
      <div className="flex flex-row items-center gap-1">
        {" "}
        <CQuestionTypeChip
          questionType={question.questionType}
          optionType={question.optionType}
          options={question.options?.map((o) => o.text)}
          name={question.name}
        />
        <CQuestionCharacterTypeChip characterType={question.characterType} />
        <CQuestionGeometryChip geometryTypes={question.geometryTypes} />
        <CNotesChip notes={question.notes} name={question.name} />
        <CCalculationChip
          name={question.name}
          expression={question.calculationExpression}
          questions={questionsForMention}
        />
      </div>
      <div className="break-all">{question.name}</div>
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
              finalized={finalized}
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
          finalized={finalized}
          control={control}
        />
      )}

      {question.questionType === "OPTIONS" && (
        <OptionsQuestion
          question={question}
          finalized={finalized}
          control={control}
        />
      )}
    </Box>
  );
};

const WrittenQuestion = ({
  question,
  numericResponses,
  control,
  finalized,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
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
        render={({ field }) => <CNumberField readOnly={finalized} {...field} />}
      />
    : <Controller
        name={String(question.questionId)}
        control={control}
        render={({ field }) => <CTextField readOnly={finalized} {...field} />}
      />;
};

const OptionsQuestion = ({
  question,
  control,
  finalized,
}: {
  question: AssessmentQuestionItem;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
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
            value={Array.isArray(field.value) ? field.value : ([] as number[])}
            clearable
            readOnly={finalized}
            options={question.options!.map((opt) => opt)}
            getOptionValue={(opt) => opt.id}
            getOptionLabel={(opt) => opt.text}
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
            value={Array.isArray(field.value) ? null : Number(field.value)}
            clearable
            readOnly={finalized}
            onChange={(e) => field.onChange(e)}
            options={question.options!}
            getOptionValue={(opt) => opt.id}
            getOptionLabel={(opt) => opt.text}
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
