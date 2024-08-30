import { ResponseForm } from "@/components/singleUse/admin/response/responseForm";
import { fetchAssessmentWithResponses } from "@/serverActions/assessmentUtil";
import { Question } from "@prisma/client";

interface SubcategoryWithQuestion {
  id: number;
  name: string;
  questions: Question[];
}

interface CategoryWithSubcategoryAndQuestion {
  id: number;
  name: string;
  subcategories: SubcategoryWithQuestion[];
  questions: Question[];
}

type AssessmentWithResposes = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentWithResponses>>
>;

const ResponseComponent = ({
  locationId,
  userId,
  assessment,
}: {
  locationId: number;
  userId: string;
  assessment: AssessmentWithResposes;
}) => {
  const questions = assessment?.form.questions;

  const categoriesMap = new Map<number, CategoryWithSubcategoryAndQuestion>();

  questions.forEach((question) => {
    const { id: categoryId, name: categoryName } = question.category;
    const subcategory = question.subcategory;

    if (!categoriesMap.has(categoryId)) {
      categoriesMap.set(categoryId, {
        id: categoryId,
        name: categoryName,
        subcategories: [],
        questions: [],
      });
    }

    const category = categoriesMap.get(categoryId)!;

    if (subcategory && subcategory.id !== undefined) {
      let subcategoryInCategory = category.subcategories.find(
        (sc) => sc.id === subcategory.id,
      );

      if (!subcategoryInCategory) {
        subcategoryInCategory = {
          id: subcategory.id,
          name: subcategory.name,
          questions: [],
        };
        category.subcategories.push(subcategoryInCategory);
      }

      subcategoryInCategory.questions.push(question);
    } else {
      category.questions.push(question);
    }
  });

  const categories = Array.from(categoriesMap.values());

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex w-full flex-col gap-5 text-white">
        <ResponseForm
          userId={userId}
          locationId={locationId}
          categoriesObj={categories}
          assessment={assessment}
        />
      </div>
    </div>
  );
};

export { ResponseComponent };
export { type CategoryWithSubcategoryAndQuestion, type AssessmentWithResposes };
