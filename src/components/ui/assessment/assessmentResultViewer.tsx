"use client";

import QuestionResponseRenderer from "@/components/ui/assessment/questionResponseRenderer";
import CIconChip from "@/components/ui/cIconChip";
import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  type AssessmentTree,
  resolveAssessmentQuestionGeometries,
  resolveAssessmentQuestionValue,
} from "@utils/assessmentResultViewer/assessmentResultViewerUtils";
import { useMemo } from "react";

export type PublicAssessmentQuestionItem = AssessmentQuestionItem & {
  isPublic: boolean;
};

export type PublicAssessmentSubcategoryItem = Omit<
  AssessmentSubcategoryItem,
  "questions"
> & {
  questions: PublicAssessmentQuestionItem[];
};

export type PublicAssessmentCategoryItem = Omit<
  AssessmentCategoryItem,
  "categoryChildren"
> & {
  categoryChildren: (
    | PublicAssessmentQuestionItem
    | PublicAssessmentSubcategoryItem
  )[];
};

export type PublicAssessmentTree = Omit<AssessmentTree, "categories"> & {
  categories: PublicAssessmentCategoryItem[];
};

type CAssessmentResultViewerProps =
  | {
      assessment: AssessmentTree;
      filterNonPublicQuestions?: false;
    }
  | {
      assessment: PublicAssessmentTree;
      filterNonPublicQuestions: true;
    };

const isAssessmentSubcategoryItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentSubcategoryItem => {
  return "questions" in item;
};

const filterPublicAssessmentCategories = (
  categories: PublicAssessmentCategoryItem[],
): AssessmentCategoryItem[] => {
  return categories
    .map((category): AssessmentCategoryItem => {
      const categoryChildren = category.categoryChildren.reduce<
        AssessmentCategoryItem["categoryChildren"]
      >((children, child) => {
        if (isAssessmentSubcategoryItem(child)) {
          const questions = child.questions.filter(
            (question) => question.isPublic,
          );

          if (questions.length > 0) {
            children.push({ ...child, questions });
          }

          return children;
        }

        if (child.isPublic) {
          children.push(child);
        }

        return children;
      }, []);

      return {
        ...category,
        categoryChildren,
      };
    })
    .filter((category) => category.categoryChildren.length > 0);
};

const CAssessmentResultViewer = ({
  assessment,
  filterNonPublicQuestions,
}: CAssessmentResultViewerProps) => {
  const categories =
    filterNonPublicQuestions ?
      filterPublicAssessmentCategories(assessment.categories)
    : assessment.categories;

  return (
    <div className="flex flex-col gap-5">
      {categories.map((category) => (
        <Category
          key={category.id}
          assessment={assessment}
          category={category}
        />
      ))}
    </div>
  );
};

const getCategoryChildKey = (
  child: AssessmentQuestionItem | AssessmentSubcategoryItem,
) => {
  return isAssessmentSubcategoryItem(child) ?
      `subcategory-${child.id}`
    : `question-${child.id}`;
};

const QuestionValues = ({
  assessment,
  question,
}: {
  assessment: AssessmentTree;
  question: AssessmentQuestionItem;
}) => {
  const resolvedValue = resolveAssessmentQuestionValue(assessment, question);
  //TODO: Add images

  return (
    <div className="flex min-h-14 items-center rounded border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <QuestionResponseRenderer
        question={question}
        resolvedValue={resolvedValue}
        geometries={resolveAssessmentQuestionGeometries(assessment, question)}
        locationPolygonGeoJson={assessment.location?.st_asgeojson ?? null}
      />
    </div>
  );
};

const QuestionList = ({
  assessment,
  questions,
}: {
  assessment: AssessmentTree;
  questions: AssessmentQuestionItem[];
}) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-2">
      {questions.map((question) => (
        <QuestionValues
          key={question.id}
          assessment={assessment}
          question={question}
        />
      ))}
    </div>
  );
};

const Subcategory = ({
  assessment,
  subcategory,
}: {
  assessment: AssessmentTree;
  subcategory: AssessmentSubcategoryItem;
}) => {
  return (
    <div className="flex flex-col gap-2 rounded border border-gray-200 bg-gray-50 p-3">
      <h5 className="text-sm font-medium text-gray-700">{subcategory.name}</h5>
      <QuestionList assessment={assessment} questions={subcategory.questions} />
    </div>
  );
};

const Category = ({
  assessment,
  category,
}: {
  assessment: AssessmentTree;
  category: AssessmentCategoryItem;
}) => {
  const categoryIcons = useMemo(() => {
    const icons: { questionName: string; iconKey: string }[] = [];
    category.categoryChildren.forEach((child) => {
      if (isAssessmentSubcategoryItem(child)) {
        child.questions.forEach((question) => {
          icons.push({
            questionName: question.name,
            iconKey: question.iconKey,
          });
        });
      } else {
        icons.push({
          questionName: child.name,
          iconKey: child.iconKey,
        });
      }
    });
    return icons;
  }, [category.categoryChildren]);
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <h4 className="text-sm font-semibold uppercase text-gray-700">
          {category.name}
        </h4>
        <span>
          <IconsLegendDialog categoryIcons={categoryIcons} />
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-2">
        {category.categoryChildren.map((child) =>
          isAssessmentSubcategoryItem(child) ?
            <div className="col-span-full" key={getCategoryChildKey(child)}>
              <Subcategory assessment={assessment} subcategory={child} />
            </div>
          : <QuestionValues
              key={getCategoryChildKey(child)}
              assessment={assessment}
              question={child}
            />,
        )}
      </div>
    </section>
  );
};

const IconsLegendDialog = ({
  categoryIcons,
}: {
  categoryIcons: {
    questionName: string;
    iconKey: string;
  }[];
}) => {
  return (
    <CDialogTrigger
      title="Legenda"
      triggerProps={{ square: true, variant: "outlined" }}
      triggerchildren={<IconInfoCircle size={18} />}
    >
      {categoryIcons.map((icon, index) => (
        <div key={index} className="my-1 flex items-center">
          <CIconChip
            icon={<CDynamicIcon iconKey={icon.iconKey} />}
            variant="emphasis"
            tooltip={icon.questionName}
          />
          <span>{icon.questionName}</span>
        </div>
      ))}
    </CDialogTrigger>
  );
};

export default CAssessmentResultViewer;
