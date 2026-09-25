"use client";

import CIconChip from "@/components/ui/cIconChip";
import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import QuestionResponseRenderer from "@/components/ui/formSubmissionViewer/questionResponseRenderer";
import type {
  FormSubmissionCategoryItem,
  FormSubmissionQuestionItem,
  FormSubmissionSubcategoryItem,
} from "@/lib/serverFunctions/queries/formSubmission";
import { isFormSubmissionSubcategoryItem } from "@/lib/utils/formSubmissionUtils";
import {
  type FormSubmissionViewerData,
  resolveFormSubmissionQuestionGeometries,
  resolveFormSubmissionQuestionValue,
} from "@/lib/utils/formSubmissionViewer/formSubmissionViewerUtils";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMemo } from "react";

type FormSubmissionViewerProps = {
  formSubmission: FormSubmissionViewerData;
  filterNonPublicQuestions?: boolean;
  locationPolygonGeoJson?: string | null;
};

const filterPublicCategories = (
  categories: FormSubmissionCategoryItem[],
): FormSubmissionCategoryItem[] =>
  categories
    .map((category) => ({
      ...category,
      categoryChildren: category.categoryChildren.reduce<
        FormSubmissionCategoryItem["categoryChildren"]
      >((children, child) => {
        if (isFormSubmissionSubcategoryItem(child)) {
          const questions = child.questions.filter(
            (question) => question.isPublic,
          );
          if (questions.length > 0) {
            children.push({ ...child, questions });
          }
          return children;
        }
        if (child.isPublic) children.push(child);
        return children;
      }, []),
    }))
    .filter((category) => category.categoryChildren.length > 0);

const FormSubmissionViewer = ({
  formSubmission,
  filterNonPublicQuestions = false,
  locationPolygonGeoJson = null,
}: FormSubmissionViewerProps) => {
  const categories =
    filterNonPublicQuestions ?
      filterPublicCategories(formSubmission.formStructure.categories)
    : formSubmission.formStructure.categories;

  return (
    <div className="flex flex-col gap-5">
      {categories.map((category) => (
        <Category
          key={category.categoryId}
          formSubmission={formSubmission}
          category={category}
          locationPolygonGeoJson={locationPolygonGeoJson}
        />
      ))}
    </div>
  );
};

const COMPACT_GRID_CHARACTER_TYPES = new Set(["BOOLEAN", "NUMBER"]);

const QuestionValues = ({
  formSubmission,
  question,
  locationPolygonGeoJson,
}: {
  formSubmission: FormSubmissionViewerData;
  question: FormSubmissionQuestionItem;
  locationPolygonGeoJson: string | null;
}) => (
  <div className="flex min-h-14 items-center rounded border border-gray-200 bg-white px-3 py-2 shadow-sm">
    <QuestionResponseRenderer
      question={question}
      resolvedValue={resolveFormSubmissionQuestionValue(
        formSubmission,
        question,
      )}
      geometries={resolveFormSubmissionQuestionGeometries(
        formSubmission,
        question,
      )}
      locationPolygonGeoJson={locationPolygonGeoJson}
    />
  </div>
);

const QuestionList = ({
  formSubmission,
  questions,
  locationPolygonGeoJson,
}: {
  formSubmission: FormSubmissionViewerData;
  questions: FormSubmissionQuestionItem[];
  locationPolygonGeoJson: string | null;
}) => {
  const gridClassName = useMemo(
    () =>
      (
        questions.every((question) =>
          COMPACT_GRID_CHARACTER_TYPES.has(question.characterType),
        )
      ) ?
        "grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-2"
      : "grid grid-cols-[repeat(auto-fit,minmax(13.5rem,1fr))] gap-2",
    [questions],
  );

  return (
    <div className={gridClassName}>
      {questions.map((question) => (
        <QuestionValues
          key={question.questionId}
          formSubmission={formSubmission}
          question={question}
          locationPolygonGeoJson={locationPolygonGeoJson}
        />
      ))}
    </div>
  );
};

const Subcategory = ({
  formSubmission,
  subcategory,
  locationPolygonGeoJson,
}: {
  formSubmission: FormSubmissionViewerData;
  subcategory: FormSubmissionSubcategoryItem;
  locationPolygonGeoJson: string | null;
}) => (
  <div className="flex flex-col gap-2 rounded border border-gray-200 bg-gray-50 p-3">
    <h5 className="text-sm font-medium text-gray-700">{subcategory.name}</h5>
    <QuestionList
      formSubmission={formSubmission}
      questions={subcategory.questions}
      locationPolygonGeoJson={locationPolygonGeoJson}
    />
  </div>
);

const Category = ({
  formSubmission,
  category,
  locationPolygonGeoJson,
}: {
  formSubmission: FormSubmissionViewerData;
  category: FormSubmissionCategoryItem;
  locationPolygonGeoJson: string | null;
}) => {
  const contentBlocks = category.categoryChildren.reduce<
    (
      | { kind: "questions"; questions: FormSubmissionQuestionItem[] }
      | {
          kind: "subcategory";
          subcategory: FormSubmissionSubcategoryItem;
        }
    )[]
  >((blocks, child) => {
    if (isFormSubmissionSubcategoryItem(child)) {
      blocks.push({ kind: "subcategory", subcategory: child });
    } else if (blocks.at(-1)?.kind === "questions") {
      (
        blocks.at(-1) as { questions: FormSubmissionQuestionItem[] }
      ).questions.push(child);
    } else {
      blocks.push({ kind: "questions", questions: [child] });
    }
    return blocks;
  }, []);
  const categoryIcons = category.categoryChildren.flatMap((child) =>
    isFormSubmissionSubcategoryItem(child) ? child.questions : [child],
  );

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <h4 className="text-sm font-semibold uppercase text-gray-700">
          {category.name}
        </h4>
        <CDialogTrigger
          title="Legenda"
          triggerProps={{ square: true, variant: "outlined" }}
          triggerchildren={<IconInfoCircle size={18} />}
        >
          {categoryIcons.map((question) => (
            <div key={question.questionId} className="my-1 flex items-center">
              <CIconChip
                icon={<CDynamicIcon iconKey={question.iconKey} />}
                variant="emphasis"
                tooltip={question.name}
              />
              <span>{question.name}</span>
            </div>
          ))}
        </CDialogTrigger>
      </div>
      <div className="flex flex-col gap-2">
        {contentBlocks.map((block, index) =>
          block.kind === "questions" ?
            <QuestionList
              key={`questions-${index}`}
              formSubmission={formSubmission}
              questions={block.questions}
              locationPolygonGeoJson={locationPolygonGeoJson}
            />
          : <Subcategory
              key={block.subcategory.subcategoryId}
              formSubmission={formSubmission}
              subcategory={block.subcategory}
              locationPolygonGeoJson={locationPolygonGeoJson}
            />,
        )}
      </div>
    </section>
  );
};

export default FormSubmissionViewer;
