"use client";

import CalculationSynchronizer from "@/components/ui/responseForm/calculationSynchronizer";
import ControlledResponseQuestionField from "@/components/ui/responseForm/controlledResponseQuestionField";
import FilledQuestionsCounter from "@/components/ui/responseForm/filledQuestionsCounter";
import ResponseFormCategory from "@/components/ui/responseForm/responseFormCategory";
import ResponseFormGeometryControls from "@/components/ui/responseForm/responseFormGeometryControls";
import ResponseFormQuestionCard from "@/components/ui/responseForm/responseFormQuestionCard";
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

export type ResponseFormChangeSource = "user" | "reset";

export type ResponseFormValuesChange = {
  values: FormValues;
  serializedValues: SerializedFormValues;
  source: ResponseFormChangeSource;
};

export type ResponseFormGeometriesChange = {
  geometries: ResponseFormGeometry[];
  source: ResponseFormChangeSource;
};

export type ResponseFormResetData = Pick<
  GetFormSubmissionDataResult,
  "responsesFormValues" | "geometries"
>;

export type ResponseFormV2Handle = {
  reset: (data: ResponseFormResetData) => void;
  submit: () => void;
};

type ResponseFormV2Props = {
  formSubmission: GetFormSubmissionDataResult;
  readOnly: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  disableFilledQuestionsCounter?: boolean;
  locationPolygonGeoJson?: string | null;
  onValuesChange?: (change: ResponseFormValuesChange) => void;
  onGeometriesChange?: (change: ResponseFormGeometriesChange) => void;
  onSubmit?: (values: FormValues) => void;
};

type ResponseFormVirtuosoContext = {
  control: Control<FormValues>;
  disableFilledQuestionsCounter: boolean;
  footer?: ReactNode;
  header?: ReactNode;
  totalQuestions: number;
};

const ResponseFormVirtuosoHeader = ({
  context,
}: {
  context?: ResponseFormVirtuosoContext;
}) => <>{context?.header}</>;

const ResponseFormVirtuosoFooter = ({
  context,
}: {
  context?: ResponseFormVirtuosoContext;
}) => {
  if (!context) return null;

  return (
    <>
      {!context.disableFilledQuestionsCounter && ( // If there is a footer, the filled questions counter is rendered at the to of the footer
        <>
          <Divider />
          <div className="mt-2 px-2">
            <FilledQuestionsCounter
              control={context.control}
              totalQuestions={context.totalQuestions}
            />
          </div>
          <Divider sx={{ mt: 1 }} />
        </>
      )}
      {context.footer}
    </>
  );
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
      readOnly,
      header,
      footer,
      disableFilledQuestionsCounter = false,
      locationPolygonGeoJson = null,
      onValuesChange,
      onGeometriesChange,
      onSubmit,
    },
    ref,
  ) => {
    const categories = formSubmission.formStructure.categories;
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
    const calculations = useMemo(
      () => formSubmission.formStructure.calculations ?? [],
      [formSubmission.formStructure.calculations],
    );
    const calculationByQuestionId = useMemo(
      () =>
        new Map(
          calculations.map((calculation) => [
            calculation.targetQuestionId,
            calculation,
          ]),
        ),
      [calculations],
    );
    const totalQuestions = useMemo(
      () => countQuestions(categories),
      [categories],
    );
    const { control, getValues, handleSubmit, reset, setValue, subscribe } =
      useForm<FormValues>({
        mode: "onChange",
        defaultValues: defaultResponseFormValues,
      });
    const hasHeader = header !== undefined && header !== null;
    const hasFooter = footer !== undefined && footer !== null;
    const virtuosoComponents = useMemo(
      () => ({
        ...(hasHeader ? { Header: ResponseFormVirtuosoHeader } : {}),
        ...(hasFooter ? { Footer: ResponseFormVirtuosoFooter } : {}),
      }),
      [hasFooter, hasHeader],
    );
    const virtuosoContext: ResponseFormVirtuosoContext = {
      control,
      disableFilledQuestionsCounter,
      footer,
      header,
      totalQuestions,
    };
    const [geometries, setGeometries] = useState<ResponseFormGeometry[]>(
      () => formSubmission.geometries,
    );
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

    const resetFormSubmission = useCallback(
      (data: ResponseFormResetData) => {
        resetSerializedValues(data.responsesFormValues);
        setGeometries(data.geometries);
        onGeometriesChange?.({
          geometries: data.geometries,
          source: "reset",
        });
      },
      [onGeometriesChange, resetSerializedValues],
    );

    useImperativeHandle(
      ref,
      () => ({
        reset: resetFormSubmission,
        submit: () => {
          if (onSubmit) {
            void handleSubmit(onSubmit)();
          }
        },
      }),
      [handleSubmit, onSubmit, resetFormSubmission],
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
        source: ResponseFormChangeSource,
      ) => {
        const serializedValues: SerializedFormValues = {};
        Object.entries(values).forEach(([questionId, value]) => {
          serializedValues[questionId] = serializeValue(questionId, value);
        });
        onValuesChange?.({
          values,
          serializedValues,
          source,
        });
      };

      notifyValuesChange(getValues(), "reset");
      return subscribe({
        formState: { values: true },
        callback: ({ values, name }) => {
          notifyValuesChange(values, name === undefined ? "reset" : "user");
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
      setGeometries(nextGeometries);
      onGeometriesChange?.({
        geometries: nextGeometries,
        source: "user",
      });
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
          calculations={calculations}
          control={control}
          setValue={setValue}
        />
        <div className="min-h-0 flex-1">
          <Virtuoso
            data={categories}
            components={virtuosoComponents}
            context={virtuosoContext}
            style={{ height: "100%", overflowX: "hidden" }}
            computeItemKey={(_, category) => `category-${category.categoryId}`}
            itemContent={(_, category) => (
              <div className="pb-2">
                <Category
                  category={category}
                  calculationByQuestionId={calculationByQuestionId}
                  geometries={geometries}
                  questionsForMention={questionsForMention}
                  readOnly={readOnly}
                  expanded={expandedCategoryIds.has(category.categoryId)}
                  onExpandedChange={handleCategoryExpandedChange}
                  expandedSubcategoryIds={expandedSubcategoryIds}
                  onSubcategoryExpandedChange={handleSubcategoryExpandedChange}
                  locationPolygonGeoJson={locationPolygonGeoJson}
                  onResponseGeometryChange={handleResponseGeometryChange}
                  control={control}
                />
              </div>
            )}
          />
        </div>
        {(footer === undefined || footer === null) &&
          !disableFilledQuestionsCounter && (
            <>
              <Divider />
              <div className="mt-2 px-2">
                <FilledQuestionsCounter
                  control={control}
                  totalQuestions={totalQuestions}
                />
              </div>
            </>
          )}
      </form>
    );
  },
);

ResponseFormV2.displayName = "ResponseFormV2";

type FormSubmissionCalculations = NonNullable<
  GetFormSubmissionDataResult["formStructure"]["calculations"]
>;

type CalculationByQuestionId = Map<number, FormSubmissionCalculations[number]>;

type SharedQuestionProps = {
  calculationByQuestionId: CalculationByQuestionId;
  geometries: ResponseFormGeometry[];
  questionsForMention: SimpleMention[];
  locationPolygonGeoJson: string | null;
  onResponseGeometryChange: (params: ResponseFormGeometry) => void;
  control: Control<FormValues, unknown, FormValues>;
  readOnly: boolean;
};

const Category = ({
  category,
  calculationByQuestionId,
  geometries,
  questionsForMention,
  locationPolygonGeoJson,
  onResponseGeometryChange,
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
              questionsForMention,
              locationPolygonGeoJson,
              onResponseGeometryChange,
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
              questionsForMention,
              locationPolygonGeoJson,
              onResponseGeometryChange,
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
  questionsForMention,
  locationPolygonGeoJson,
  onResponseGeometryChange,
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
