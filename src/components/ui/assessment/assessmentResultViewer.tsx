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

const COMPACT_GRID_CHARACTER_TYPES = new Set(["BOOLEAN", "NUMBER"]);

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
  const gridClassName = useMemo(() => {
    const hasOnlyCompactQuestions = questions.every((question) =>
      COMPACT_GRID_CHARACTER_TYPES.has(question.characterType),
    );

    return hasOnlyCompactQuestions ?
        "grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-2"
      : "grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-2";
  }, [questions]);
  return (
    <div className={gridClassName}>
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
  // Each block is either a question group or a subcategory. Questions groups are separated by subcategories.
  // Each block will have its own grid
  const categoryContentBlocks = category.categoryChildren.reduce<
    (
      | { kind: "questions"; questions: AssessmentQuestionItem[] }
      | { kind: "subcategory"; subcategory: AssessmentSubcategoryItem }
    )[]
  >((blocks, child) => {
    if (isAssessmentSubcategoryItem(child)) {
      blocks.push({ kind: "subcategory", subcategory: child });
      return blocks;
    }

    // If the last block is a question block, add the question to it
    const lastBlock = blocks[blocks.length - 1];
    if (lastBlock?.kind === "questions") {
      lastBlock.questions.push(child);
      return blocks;
    }

    // Otherwise, create a new question block
    blocks.push({ kind: "questions", questions: [child] });
    return blocks;
  }, []);

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

      <div className="flex flex-col gap-2">
        {categoryContentBlocks.map((block, index) =>
          block.kind === "questions" ?
            <QuestionList
              key={`questions-${index}`}
              assessment={assessment}
              questions={block.questions}
            />
          : <Subcategory
              key={getCategoryChildKey(block.subcategory)}
              assessment={assessment}
              subcategory={block.subcategory}
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
