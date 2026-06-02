"use client";

import DriveFolderUrlDialog from "@/app/admin/assessments/[selectedAssessmentId]/driveFolderUrlDialog";
import { useHelperCard } from "@/components/context/helperCardContext";
import CButton from "@/components/ui/cButton";
import CButtonFilePicker from "@/components/ui/cButtonFilePicker";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CHelpChip from "@/components/ui/cHelpChip";
import ControlledResponseQuestionField from "@/components/ui/responseForm/controlledResponseQuestionField";
import ResponseFormCategory from "@/components/ui/responseForm/responseFormCategory";
import ResponseFormQuestionCard from "@/components/ui/responseForm/responseFormQuestionCard";
import ResponseFormQuestionGeometryControls from "@/components/ui/responseForm/responseFormQuestionGeometryControls";
import ResponseFormQuestionImageControls from "@/components/ui/responseForm/responseFormQuestionImageControls";
import ResponseFormSubcategory from "@/components/ui/responseForm/responseFormSubcategory";
import type {
  FormValues,
  ResponseFormGeometry,
  ResponseFormImages,
  SerializedFormValues,
  SimpleMention,
} from "@/components/ui/responseForm/responseFormTypes";
import dayjs from "@/lib/dayjs";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import { Chip } from "@mui/material";
import { QuestionResponseCharacterTypes } from "@prisma/client";
import {
  IconAlertTriangle,
  IconBrandGoogleDrive,
  IconCheck,
  IconDeviceFloppy,
  IconPencil,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { Dayjs } from "dayjs";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { type Control, useForm, useWatch } from "react-hook-form";

import DeleteAssessmentDialog from "./deleteAssessmentDialog";
import SaveAssessmentDialog from "./saveAssessmentDialog";

export const isAssessmentSubcategoryItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentSubcategoryItem => {
  return "questions" in item;
};

export const isAssessmentQuestionItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentQuestionItem => {
  return "questionId" in item && item.questionId !== null;
};

const deserializeResponseFormValues = (
  values: SerializedFormValues,
  categories: AssessmentCategoryItem[],
): FormValues => {
  //We need to map all date questions to construct their dayjs objects based on their serialized values
  const dateQuestionsMap = new Map<number, QuestionResponseCharacterTypes>();

  categories.forEach((category) => {
    category.categoryChildren.forEach((child) => {
      if (isAssessmentSubcategoryItem(child)) {
        child.questions.forEach((question) => {
          if (
            question.questionType === "WRITTEN" &&
            (question.characterType === "DATE" ||
              question.characterType === "TIME" ||
              question.characterType === "DATETIME")
          ) {
            dateQuestionsMap.set(question.questionId, question.characterType);
          }
        });
        return;
      }

      if (
        isAssessmentQuestionItem(child) &&
        child.questionType === "WRITTEN" &&
        (child.characterType === "DATE" ||
          child.characterType === "TIME" ||
          child.characterType === "DATETIME")
      ) {
        dateQuestionsMap.set(child.questionId, child.characterType);
      }
    });
  });

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const questionDateType = dateQuestionsMap.get(Number(key));
      if (!questionDateType || value === null) {
        return [key, value];
      }

      if (typeof value !== "string") {
        return [key, null];
      }

      if (questionDateType === "DATE") {
        const dateValue = dayjs(value, "DD/MM/YYYY", true);
        return [key, dateValue.isValid() ? dateValue : null];
      }
      if (questionDateType === "TIME") {
        const dateValue = dayjs(value, "HH:mm", true);
        return [key, dateValue.isValid() ? dateValue : null];
      }

      if (questionDateType === "DATETIME") {
        const dateValue = dayjs(value, "DD/MM/YYYY HH:mm", true);
        return [key, dateValue.isValid() ? dateValue : null];
      }

      throw new Error("Untreatable value found");
    }),
  ) as FormValues;
};

const ResponseFormV2 = ({
  locationId,
  locationName,
  locationPolygonGeoJson,
  assessmentTree,
  finalized,
  userCanEdit,
  isPreview = false,
  onValuesChange,
  onGeometriesChange,
  onImagesChange,
}: {
  locationId: number;
  locationName: string;
  locationPolygonGeoJson: string | null;
  assessmentTree: {
    id: number;
    startDate: Date;
    endDate: Date | null;
    isFinalized: boolean;
    formName: string;
    totalQuestions: number;
    responsesFormValues: SerializedFormValues;
    geometries: ResponseFormGeometry[];
    responseImages: ResponseFormImages;
    categories: AssessmentCategoryItem[];
    driveFolderUrl: string | null;
  };
  finalized: boolean;
  userCanEdit: boolean;
  isPreview?: boolean;
  onValuesChange?: (values: FormValues) => void;
  onGeometriesChange?: (geometries: ResponseFormGeometry[]) => void;
  onImagesChange?: (images: ResponseFormImages) => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const defaultResponseFormValues = useMemo(
    () =>
      deserializeResponseFormValues(
        assessmentTree.responsesFormValues,
        assessmentTree.categories,
      ),
    [assessmentTree.categories, assessmentTree.responsesFormValues],
  );
  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: defaultResponseFormValues,
  });
  const [numericResponses, setNumericResponses] = useState(
    new Map<number, number>(),
  );
  const [isFilling, setIsFilling] = useState(
    finalized ? false
    : userCanEdit ? true
    : false,
  );
  const [questionsForMention] = useState(() => {
    const questions: SimpleMention[] = [];
    assessmentTree.categories.forEach((c) => {
      c.categoryChildren.forEach((ch) => {
        if (isAssessmentSubcategoryItem(ch)) {
          ch.questions.forEach((q) => {
            questions.push({
              id: String(q.questionId),
              display: `${q.categoryName} ➤${q.subcategoryName ? " " + q.subcategoryName + " " : ""}➤ ${q.name}`,
            });
          });
        } else if (isAssessmentQuestionItem(ch)) {
          questions.push({
            id: String(ch.questionId),
            display: `${ch.categoryName} ➤${ch.subcategoryName ? " " + ch.subcategoryName + " " : ""}➤ ${ch.name}`,
          });
        }
      });
    });
    return questions;
  });

  const [importedFinalizationDatetime, setImportedFinalizationDatetime] =
    useState<Dayjs | null>(
      assessmentTree.endDate ? dayjs(assessmentTree.endDate) : null,
    );
  const [importedIsFinalized, setImportedIsFinalized] = useState(
    assessmentTree.isFinalized,
  );
  const [startDate, setStartDate] = useState<Dayjs>(
    dayjs(assessmentTree.startDate),
  );

  const [openDriveFolderUrlDialog, setOpenDriveFolderUrlDialog] =
    useState(false);

  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(
    assessmentTree.driveFolderUrl,
  );

  const [geometries, setGeometries] = useState<ResponseFormGeometry[]>(
    assessmentTree.geometries,
  );
  const [responseImages, setResponseImages] = useState<ResponseFormImages>(
    assessmentTree.responseImages,
  );
  const [formValues, setFormValues] = useState<FormValues>({});
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteAssessmentDialog, setOpenDeleteAssessmentDialog] =
    useState(false);
  const [filledCount, setFilledCount] = useState(0);

  const allValues = useWatch({ control });

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

  const handleQuestionImagesChange = (questionId: number, images: string[]) => {
    setResponseImages((prev) => ({
      ...prev,
      [questionId]: images,
    }));
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
        responses: SerializedFormValues;
        geometries?: ResponseFormGeometry[];
        responseImages?: ResponseFormImages;
        endDateTime?: string | null;
        finalizationDateTime?: string | null;
        isFinalized?: boolean;
        startDate: string;
        driveFolderUrl: string | null;
      };

      if (importedData.responses) {
        reset(
          deserializeResponseFormValues(
            importedData.responses,
            assessmentTree.categories,
          ),
        );
      }

      const incomingGeoms = importedData.geometries ?? [];
      setGeometries(incomingGeoms);
      setResponseImages(importedData.responseImages ?? {});

      const startDate = dayjs(importedData.startDate);
      setStartDate(startDate);

      const endDateTime = dayjs(
        importedData.endDateTime ?? importedData.finalizationDateTime,
      );
      setImportedFinalizationDatetime(
        endDateTime.isValid() ? endDateTime : null,
      );
      setImportedIsFinalized(
        importedData.isFinalized ?? !!importedData.finalizationDateTime,
      );

      setDriveFolderUrl(importedData.driveFolderUrl);

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
    let filledFieldsCounter = 0;
    const normalizedValues = Object.fromEntries(
      Object.entries(allValues).map(([key, value]) => [
        key,
        value === undefined ? null : value,
      ]),
    ) as FormValues;
    Object.entries(normalizedValues).forEach(([key, val]) => {
      if (typeof val === "number") {
        numericResponses.set(Number(key), val);
      }
      if (
        val != null &&
        val !== "" &&
        (!(val instanceof Array) || val.length > 0) &&
        (!dayjs.isDayjs(val) || val.isValid())
      ) {
        filledFieldsCounter++;
      }
    });
    setNumericResponses(numericResponses);
    setFilledCount(filledFieldsCounter);
    onValuesChange?.(normalizedValues);
  }, [allValues, onValuesChange]);

  useEffect(() => {
    onGeometriesChange?.(geometries);
  }, [geometries, onGeometriesChange]);

  useEffect(() => {
    onImagesChange?.(responseImages);
  }, [responseImages, onImagesChange]);

  return (
    <form
      onSubmit={(e) => {
        if (isPreview) {
          e.preventDefault();
          return;
        }
        void handleSubmit(onSubmit)(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();

          const form = e.currentTarget;
          const elements = Array.from(form.elements);
          const currentIndex = elements.indexOf(e.target as Element);
          for (let i = currentIndex + 1; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const realInput =
              el.tagName === "INPUT" ?
                el
              : (el.querySelector("input") as HTMLElement | null);

            if (realInput) {
              realInput.focus();
              return;
            }
          }
        }
      }}
      className="flex w-full flex-col gap-4"
    >
      {!isFilling && (
        <div className="flex flex-col gap-1">
          <div>
            <div>
              {`Início: ${dateTimeFormatter.format(assessmentTree.startDate)}`}
            </div>
            <div>
              {`Fim: ${assessmentTree.endDate ? dateTimeFormatter.format(assessmentTree.endDate) : "Indefinido"}`}
            </div>
          </div>
        </div>
      )}
      {isFilling && (
        <div className="flex flex-wrap content-center justify-between gap-4">
          <CDateTimePicker
            label="Início"
            value={startDate}
            onChange={(e) => {
              if (!e) return;
              setStartDate(e);
            }}
          />

          <div className="flex items-center justify-end gap-2">
            {!isPreview && (
              <>
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
              </>
            )}

            <CButton
              square
              tooltip="Drive"
              enableTopLeftChip={!!driveFolderUrl}
              topLeftChipLabel={"1"}
              onClick={() => {
                setOpenDriveFolderUrlDialog(true);
              }}
            >
              <IconBrandGoogleDrive />
            </CButton>
            {!isPreview && (
              <CButton
                square
                color="error"
                onClick={() => {
                  setOpenDeleteAssessmentDialog(true);
                }}
              >
                <IconTrash />
              </CButton>
            )}
          </div>
        </div>
      )}
      {!isPreview && !isFilling && (
        <div className="flex flex-wrap content-center justify-between gap-1 sm:justify-end">
          <div className="flex items-center gap-2">
            {userCanEdit && (
              <>
                <CHelpChip tooltip="Você possui permissão para editar esta avaliação finalizada." />
                <CButton
                  square
                  onClick={() => {
                    setIsFilling(true);
                  }}
                >
                  <IconPencil />
                </CButton>
              </>
            )}

            <CButton
              square
              tooltip="Drive"
              enableTopLeftChip={!!driveFolderUrl}
              topLeftChipLabel={"1"}
              disabled={!driveFolderUrl}
              onClick={() => {
                setOpenDriveFolderUrlDialog(true);
              }}
            >
              <IconBrandGoogleDrive />
            </CButton>
          </div>
        </div>
      )}

      {assessmentTree.categories.map((cat, index) => (
        <Category
          key={index}
          category={cat}
          numericResponses={numericResponses}
          geometries={geometries}
          responseImages={responseImages}
          questionsForMention={questionsForMention}
          finalized={!isFilling}
          locationPolygonGeoJson={locationPolygonGeoJson}
          handleQuestionGeometryChange={handleQuestionGeometryChange}
          handleQuestionImagesChange={handleQuestionImagesChange}
          control={control}
        />
      ))}

      <Chip
        label={`Campos preenchidos: ${filledCount} / ${totalQuestions}`}
        icon={
          filledCount < totalQuestions ? <IconAlertTriangle /> : <IconCheck />
        }
        color={filledCount < totalQuestions ? "warning" : "success"}
      />

      {isFilling && !isPreview && (
        <div className="flew-row flex justify-center gap-1">
          <CButton type="submit">
            <IconDeviceFloppy />
            Salvar
          </CButton>
        </div>
      )}

      {!isPreview && (
        <>
          <SaveAssessmentDialog
            locationName={locationName}
            assessmentId={assessmentTree.id}
            open={openSaveDialog}
            formValues={formValues}
            geometries={geometries}
            responseImages={responseImages}
            importedEndDatetime={importedFinalizationDatetime}
            importedIsFinalized={importedIsFinalized}
            startDate={startDate}
            driveFolderUrl={driveFolderUrl}
            categories={assessmentTree.categories}
            onClose={() => {
              setOpenSaveDialog(false);
            }}
          />
          <DeleteAssessmentDialog
            assessmentId={assessmentTree.id}
            open={openDeleteAssessmentDialog}
            locationId={locationId}
            onClose={() => {
              setOpenDeleteAssessmentDialog(false);
            }}
          />
        </>
      )}
      <DriveFolderUrlDialog
        open={openDriveFolderUrlDialog}
        driveFolderUrl={driveFolderUrl}
        isFilling={isFilling}
        onClose={() => setOpenDriveFolderUrlDialog(false)}
        onConfirm={(url) => setDriveFolderUrl(url)}
      />
    </form>
  );
};

const Category = ({
  category,
  numericResponses,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  finalized,
}: {
  category: AssessmentCategoryItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  questionsForMention: SimpleMention[];
  locationPolygonGeoJson: string | null;
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  handleQuestionImagesChange: (questionId: number, images: string[]) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  return (
    <ResponseFormCategory category={category}>
      <>
        {category.categoryChildren.map((child, index) => {
          if (isAssessmentSubcategoryItem(child)) {
            return (
              <Subcategory
                key={index}
                subcategory={child}
                numericResponses={numericResponses}
                geometries={geometries}
                responseImages={responseImages}
                questionsForMention={questionsForMention}
                finalized={finalized}
                locationPolygonGeoJson={locationPolygonGeoJson}
                handleQuestionGeometryChange={handleQuestionGeometryChange}
                handleQuestionImagesChange={handleQuestionImagesChange}
                control={control}
              />
            );
          } else if (isAssessmentQuestionItem(child)) {
            return (
              <Question
                key={index}
                question={child}
                numericResponses={numericResponses}
                geometries={geometries}
                responseImages={responseImages}
                questionsForMention={questionsForMention}
                finalized={finalized}
                locationPolygonGeoJson={locationPolygonGeoJson}
                handleQuestionGeometryChange={handleQuestionGeometryChange}
                handleQuestionImagesChange={handleQuestionImagesChange}
                control={control}
              />
            );
          }
        })}
      </>
    </ResponseFormCategory>
  );
};

const Subcategory = ({
  subcategory,
  numericResponses,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  finalized,
}: {
  subcategory: AssessmentSubcategoryItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  questionsForMention: SimpleMention[];
  locationPolygonGeoJson: string | null;
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  handleQuestionImagesChange: (questionId: number, images: string[]) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  return (
    <ResponseFormSubcategory subcategory={subcategory}>
      <>
        {subcategory.questions.map((question, index) => (
          <Question
            key={index}
            question={question}
            numericResponses={numericResponses}
            geometries={geometries}
            responseImages={responseImages}
            questionsForMention={questionsForMention}
            finalized={finalized}
            locationPolygonGeoJson={locationPolygonGeoJson}
            handleQuestionGeometryChange={handleQuestionGeometryChange}
            handleQuestionImagesChange={handleQuestionImagesChange}
            control={control}
          />
        ))}
      </>
    </ResponseFormSubcategory>
  );
};

const Question = ({
  question,
  numericResponses,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  finalized,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  questionsForMention: SimpleMention[];
  locationPolygonGeoJson: string | null;
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  handleQuestionImagesChange: (questionId: number, images: string[]) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  return (
    <ResponseFormQuestionCard
      question={question}
      questionsForMention={questionsForMention}
      questionControls={
        <>
          <ResponseFormQuestionGeometryControls
            question={question}
            geometries={geometries}
            locationPolygonGeoJson={locationPolygonGeoJson}
            finalized={finalized}
            handleQuestionGeometryChange={handleQuestionGeometryChange}
          />
          <ResponseFormQuestionImageControls
            question={question}
            responseImages={responseImages}
            finalized={finalized}
            onQuestionImagesChange={handleQuestionImagesChange}
          />
        </>
      }
    >
      <ControlledResponseQuestionField
        question={question}
        numericResponses={numericResponses}
        control={control}
        finalized={finalized}
      />
    </ResponseFormQuestionCard>
  );
};

export default ResponseFormV2;
