"use client";

import CImage from "@/components/ui/CImage";
import QuestionResponseRenderer from "@/components/ui/assessment/questionResponseRenderer";
import CIconChip from "@/components/ui/cIconChip";
import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import { buildGoogleDriveThumbnailImageUrl } from "@/lib/utils/image";
import { Divider } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  type AssessmentTree,
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
    <div className="flex flex-col gap-1">
      {categories.map((category, index, arr) => {
        const isLastItem = index === arr.length - 1;
        return (
          <div key={category.id} className="flex flex-col gap-2">
            <Category assessment={assessment} category={category} />
            {!isLastItem && <Divider />}
          </div>
        );
      })}
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
  const images = assessment.responseImages?.[question.questionId] ?? [];

  return (
    <div className="flex flex-row items-center gap-1">
      <QuestionResponseRenderer
        question={question}
        resolvedValue={resolvedValue}
      />
      {images.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {images.map((url, index) => {
            const directUrl = buildGoogleDriveThumbnailImageUrl({
              sharingUrl: url,
            });

            return (
              <CImage
                key={index}
                src={directUrl}
                width={100}
                height={100}
                alt={`${question.name} - imagem ${index + 1}`}
                className="aspect-[4/3] w-32 rounded object-cover"
              />
            );
          })}
        </div>
      )}
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
    <div className="flex flex-wrap items-center gap-4">
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
    <div className="flex flex-col gap-2 p-1 outline-dashed outline-1 outline-gray-300">
      <h5 className="font-medium">{subcategory.name}</h5>
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
    <div className="flex flex-col gap-2 pl-px">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold">{category.name}</h4>
        <span>
          <IconsLegendDialog categoryIcons={categoryIcons} />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {category.categoryChildren.map((child) =>
          isAssessmentSubcategoryItem(child) ?
            <div className="w-full" key={getCategoryChildKey(child)}>
              <Subcategory assessment={assessment} subcategory={child} />
            </div>
          : <QuestionValues
              key={getCategoryChildKey(child)}
              assessment={assessment}
              question={child}
            />,
        )}
      </div>
    </div>
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
      triggerchildren={<IconInfoCircle />}
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
