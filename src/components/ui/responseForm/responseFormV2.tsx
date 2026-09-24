"use client";

import CalculationSynchronizer from "@/components/ui/responseForm/calculationSynchronizer";
import ControlledResponseQuestionField from "@/components/ui/responseForm/controlledResponseQuestionField";
import FilledQuestionsCounter from "@/components/ui/responseForm/filledQuestionsCounter";
import ResponseFormCategory from "@/components/ui/responseForm/responseFormCategory";
import ResponseFormGeometryControls from "@/components/ui/responseForm/responseFormGeometryControls";
import ResponseFormQuestionCard from "@/components/ui/responseForm/responseFormQuestionCard";
import ResponseFormQuestionImageControls from "@/components/ui/responseForm/responseFormQuestionImageControls";
import ResponseFormSubcategory from "@/components/ui/responseForm/responseFormSubcategory";
import dayjs from "@/lib/dayjs";
import {
  buildDateResponseFormatByQuestionId,
  deserializeResponseFormValues,
} from "@/lib/responseForm/responseForm";
import type {
  FormSubmissionCategoryItem,
  FormSubmissionQuestionItem,
  FormSubmissionSubcategoryItem,
  GetFormSubmissionDataResult,
} from "@/lib/serverFunctions/queries/formSubmission";
import type {
  FormValues,
  ResponseFormGeometry,
  ResponseFormImage,
  ResponseFormImages,
  ResponseGeometry,
  SerializedFormValues,
  SerializedResponseQuestionValue,
  SimpleMention,
} from "@/lib/types/formSubmission/responseFormTypes";
import { isFormSubmissionSubcategoryItem } from "@/lib/utils/formSubmissionUtils";
import { Divider } from "@mui/material";
import {
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { type Control, useForm } from "react-hook-form";
import { Virtuoso } from "react-virtuoso";

export type ResponseFormValuesChange = {
  values: FormValues;
  serializedValues: SerializedFormValues;
  changedQuestionId?: string;
};

export type ResponseFormV2Handle = {
  reset: (values: SerializedFormValues) => void;
  submit: () => void;
};

type ResponseFormV2Props = {
  formSubmission: GetFormSubmissionDataResult;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  readOnly: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  locationPolygonGeoJson?: string | null;
  onValuesChange?: (change: ResponseFormValuesChange) => void;
  onGeometriesChange: (geometries: ResponseFormGeometry[]) => void;
  onImagesChange: (images: ResponseFormImages) => void;
  onSubmit?: (values: FormValues) => void;
};

const countQuestions = (categories: FormSubmissionCategoryItem[]) =>
  categories.reduce(
    (total, category) =>
      total +
      category.categoryChildren.reduce(
        (categoryTotal, child) =>
          categoryTotal +
          (isFormSubmissionSubcategoryItem(child) ? child.questions.length : 1),
        0,
      ),
    0,
  );

const ResponseFormV2 = forwardRef<ResponseFormV2Handle, ResponseFormV2Props>(
  (
    {
      formSubmission,
      geometries,
      responseImages,
      readOnly,
      header,
      footer,
      locationPolygonGeoJson = null,
      onValuesChange,
      onGeometriesChange,
      onImagesChange,
      onSubmit,
    },
    ref,
  ) => {
    const categories = formSubmission.formTree.categories;
    const defaultResponseFormValues = useMemo(
      () =>
        deserializeResponseFormValues(
          formSubmission.responsesFormValues,
          categories,
        ),
      [categories, formSubmission.responsesFormValues],
    );
    const dateFormatByQuestionId = useMemo(
      () => buildDateResponseFormatByQuestionId(categories),
      [categories],
    );
    const calculationByQuestionId = useMemo(
      () =>
        new Map(
          formSubmission.calculations.map((calculation) => [
            calculation.targetQuestionId,
            calculation,
          ]),
        ),
      [formSubmission.calculations],
    );
    const virtuosoComponents = useMemo(
      () => ({
        ...(header !== undefined && header !== null ?
          { Header: () => <>{header}</> }
        : {}),
        ...(footer !== undefined && footer !== null ?
          { Footer: () => <>{footer}</> }
        : {}),
      }),
      [footer, header],
    );
    const { control, getValues, handleSubmit, reset, setValue, subscribe } =
      useForm<FormValues>({
        mode: "onChange",
        defaultValues: defaultResponseFormValues,
      });
    const [expandedCategoryIds, setExpandedCategoryIds] = useState(
      () => new Set(categories.map((category) => category.categoryId)),
    );
    const [expandedSubcategoryIds, setExpandedSubcategoryIds] = useState(
      () =>
        new Set(
          categories.flatMap((category) =>
            category.categoryChildren.flatMap((child) =>
              isFormSubmissionSubcategoryItem(child) ?
                [child.subcategoryId]
              : [],
            ),
          ),
        ),
    );

    const questionsForMention = useMemo(() => {
      const questions: SimpleMention[] = [];
      categories.forEach((category) => {
        category.categoryChildren.forEach((child) => {
          const appendQuestion = (question: FormSubmissionQuestionItem) => {
            questions.push({
              id: String(question.questionId),
              display: `${question.categoryName} ➤${question.subcategoryName ? ` ${question.subcategoryName} ` : ""}➤ ${question.name}`,
            });
          };

          if (isFormSubmissionSubcategoryItem(child)) {
            child.questions.forEach(appendQuestion);
          } else {
            appendQuestion(child);
          }
        });
      });
      return questions;
    }, [categories]);

    const resetSerializedValues = useCallback(
      (values: SerializedFormValues) => {
        reset(deserializeResponseFormValues(values, categories));
      },
      [categories, reset],
    );

    useImperativeHandle(
      ref,
      () => ({
        reset: resetSerializedValues,
        submit: () => {
          if (onSubmit) {
            void handleSubmit(onSubmit)();
          }
        },
      }),
      [handleSubmit, onSubmit, resetSerializedValues],
    );

    useEffect(() => {
      const serializeValue = (
        questionId: string,
        value: FormValues[string] | undefined,
      ) => {
        const normalizedValue = value === undefined ? null : value;

        if (dayjs.isDayjs(normalizedValue)) {
          const format = dateFormatByQuestionId.get(questionId);
          return format && normalizedValue.isValid() ?
              normalizedValue.format(format)
            : null;
        }

        return normalizedValue as SerializedResponseQuestionValue;
      };

      const notifyValuesChange = (
        values: FormValues,
        changedQuestionId?: string,
      ) => {
        const serializedValues: SerializedFormValues = {};
        Object.entries(values).forEach(([questionId, value]) => {
          serializedValues[questionId] = serializeValue(questionId, value);
        });
        onValuesChange?.({
          values,
          serializedValues,
          changedQuestionId,
        });
      };

      notifyValuesChange(getValues());
      return subscribe({
        formState: { values: true },
        callback: ({ values, name }) => {
          notifyValuesChange(values, name);
        },
      });
    }, [dateFormatByQuestionId, getValues, onValuesChange, subscribe]);

    const handleCategoryExpandedChange = useCallback(
      (categoryId: number, expanded: boolean) => {
        setExpandedCategoryIds((current) => {
          const next = new Set(current);
          expanded ? next.add(categoryId) : next.delete(categoryId);
          return next;
        });
      },
      [],
    );
    const handleSubcategoryExpandedChange = useCallback(
      (subcategoryId: number, expanded: boolean) => {
        setExpandedSubcategoryIds((current) => {
          const next = new Set(current);
          expanded ? next.add(subcategoryId) : next.delete(subcategoryId);
          return next;
        });
      },
      [],
    );
    const handleResponseGeometryChange = ({
      questionId,
      geometries: questionGeometries,
    }: {
      questionId: number;
      geometries: ResponseGeometry[];
    }) => {
      const nextGeometries =
        geometries.some((item) => item.questionId === questionId) ?
          geometries.map((item) =>
            item.questionId === questionId ?
              { questionId, geometries: questionGeometries }
            : item,
          )
        : [...geometries, { questionId, geometries: questionGeometries }];
      onGeometriesChange(nextGeometries);
    };
    const handleQuestionImagesChange = (
      questionId: number,
      images: ResponseFormImage[],
    ) => {
      onImagesChange({ ...responseImages, [questionId]: images });
    };

    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (onSubmit) {
            void handleSubmit(onSubmit)(event);
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();

          const elements = Array.from(event.currentTarget.elements);
          const currentIndex = elements.indexOf(event.target as Element);
          for (let index = currentIndex + 1; index < elements.length; index++) {
            const element = elements[index] as HTMLElement;
            const realInput =
              element.tagName === "INPUT" ?
                element
              : (element.querySelector("input") as HTMLElement | null);
            if (realInput) {
              realInput.focus();
              return;
            }
          }
        }}
        className="flex h-full min-h-0 w-full flex-1 flex-col"
      >
        <CalculationSynchronizer
          calculations={formSubmission.calculations}
          control={control}
          setValue={setValue}
        />
        <div className="min-h-0 flex-1">
          <Virtuoso
            data={categories}
            components={virtuosoComponents}
            style={{ height: "100%", overflowX: "hidden" }}
            computeItemKey={(_, category) => `category-${category.categoryId}`}
            itemContent={(_, category) => (
              <div className="pb-2">
                <Category
                  category={category}
                  calculationByQuestionId={calculationByQuestionId}
                  geometries={geometries}
                  responseImages={responseImages}
                  questionsForMention={questionsForMention}
                  readOnly={readOnly}
                  expanded={expandedCategoryIds.has(category.categoryId)}
                  onExpandedChange={handleCategoryExpandedChange}
                  expandedSubcategoryIds={expandedSubcategoryIds}
                  onSubcategoryExpandedChange={handleSubcategoryExpandedChange}
                  locationPolygonGeoJson={locationPolygonGeoJson}
                  onResponseGeometryChange={handleResponseGeometryChange}
                  onQuestionImagesChange={handleQuestionImagesChange}
                  control={control}
                />
              </div>
            )}
          />
        </div>
        <Divider />
        <div className="mt-2 px-2">
          <FilledQuestionsCounter
            control={control}
            totalQuestions={countQuestions(categories)}
          />
        </div>
      </form>
    );
  },
);

ResponseFormV2.displayName = "ResponseFormV2";

type CalculationByQuestionId = Map<
  number,
  GetFormSubmissionDataResult["calculations"][number]
>;

type SharedQuestionProps = {
  calculationByQuestionId: CalculationByQuestionId;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  questionsForMention: SimpleMention[];
  locationPolygonGeoJson: string | null;
  onResponseGeometryChange: (params: ResponseFormGeometry) => void;
  onQuestionImagesChange: (
    questionId: number,
    images: ResponseFormImage[],
  ) => void;
  control: Control<FormValues, unknown, FormValues>;
  readOnly: boolean;
};

const Category = ({
  category,
  calculationByQuestionId,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  onResponseGeometryChange,
  onQuestionImagesChange,
  control,
  readOnly,
  expanded,
  onExpandedChange,
  expandedSubcategoryIds,
  onSubcategoryExpandedChange,
}: SharedQuestionProps & {
  category: FormSubmissionCategoryItem;
  expanded: boolean;
  onExpandedChange: (categoryId: number, expanded: boolean) => void;
  expandedSubcategoryIds: Set<number>;
  onSubcategoryExpandedChange: (
    subcategoryId: number,
    expanded: boolean,
  ) => void;
}) => (
  <ResponseFormCategory
    category={category}
    expanded={expanded}
    onExpandedChange={(nextExpanded) =>
      onExpandedChange(category.categoryId, nextExpanded)
    }
  >
    <>
      {category.categoryChildren.map((child) =>
        isFormSubmissionSubcategoryItem(child) ?
          <Subcategory
            key={`subcategory-${child.subcategoryId}`}
            {...{
              calculationByQuestionId,
              geometries,
              responseImages,
              questionsForMention,
              locationPolygonGeoJson,
              onResponseGeometryChange,
              onQuestionImagesChange,
              control,
              readOnly,
            }}
            subcategory={child}
            expanded={expandedSubcategoryIds.has(child.subcategoryId)}
            onExpandedChange={onSubcategoryExpandedChange}
          />
        : <Question
            key={`question-${child.questionId}`}
            {...{
              calculationByQuestionId,
              geometries,
              responseImages,
              questionsForMention,
              locationPolygonGeoJson,
              onResponseGeometryChange,
              onQuestionImagesChange,
              control,
              readOnly,
            }}
            question={child}
          />,
      )}
    </>
  </ResponseFormCategory>
);

const Subcategory = ({
  subcategory,
  expanded,
  onExpandedChange,
  ...sharedProps
}: SharedQuestionProps & {
  subcategory: FormSubmissionSubcategoryItem;
  expanded: boolean;
  onExpandedChange: (subcategoryId: number, expanded: boolean) => void;
}) => (
  <ResponseFormSubcategory
    subcategory={subcategory}
    expanded={expanded}
    onExpandedChange={(nextExpanded) =>
      onExpandedChange(subcategory.subcategoryId, nextExpanded)
    }
  >
    <>
      {subcategory.questions.map((question) => (
        <Question
          key={question.questionId}
          {...sharedProps}
          question={question}
        />
      ))}
    </>
  </ResponseFormSubcategory>
);

const Question = ({
  question,
  calculationByQuestionId,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  onResponseGeometryChange,
  onQuestionImagesChange,
  control,
  readOnly,
}: SharedQuestionProps & { question: FormSubmissionQuestionItem }) => {
  const calculation = calculationByQuestionId.get(question.questionId);

  return (
    <ResponseFormQuestionCard
      question={question}
      calculationExpression={calculation?.expression}
      questionsForMention={questionsForMention}
      questionControls={
        <>
          <ResponseFormGeometryControls
            question={question}
            geometries={geometries}
            locationPolygonGeoJson={locationPolygonGeoJson}
            finalized={readOnly}
            handleResponseGeometryChange={onResponseGeometryChange}
          />
          <ResponseFormQuestionImageControls
            question={question}
            responseImages={responseImages}
            finalized={readOnly}
            onQuestionImagesChange={onQuestionImagesChange}
          />
        </>
      }
    >
      <ControlledResponseQuestionField
        question={question}
        calculationExpression={calculation?.expression}
        control={control}
        finalized={readOnly}
      />
    </ResponseFormQuestionCard>
  );
};

export default ResponseFormV2;
