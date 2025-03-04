import { ResponseForm } from "@/components/singleUse/admin/response/responseForm";
import {
  fetchAssessmentGeometries,
  fetchAssessmentWithResponses,
} from "@/serverActions/assessmentUtil";
import { CalculationTypes, Question } from "@prisma/client";

interface ResponseCalculation {
  id: number;
  name: string;
  type: CalculationTypes;
  questions: Question[];
}

interface SubcategoryWithQuestion {
  id: number;
  name: string;
  questions: Question[];
  calculations: ResponseCalculation[];
}

interface CategoryWithSubcategoryAndQuestion {
  id: number;
  name: string;
  subcategories: SubcategoryWithQuestion[];
  questions: Question[];
  calculations: ResponseCalculation[];
}

type AssessmentWithResposes = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentWithResponses>>
>;

type FetchedAssessmentGeometries = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentGeometries>>
>;

const ResponseComponent = ({
  locationId,
  userId,
  assessment,
  initialGeometries,
}: {
  locationId: number;
  userId: string;
  assessment: AssessmentWithResposes;
  initialGeometries: FetchedAssessmentGeometries;
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
        calculations: [],
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
          calculations: [],
        };
        category.subcategories.push(subcategoryInCategory);
      }

      subcategoryInCategory.questions.push(question);
    } else {
      category.questions.push(question);
    }
  });

  const calculations = assessment.form.calculations;

  calculations.forEach((calculation) => {
    const calculationCategory = categoriesMap.get(calculation.categoryId);
    if (calculationCategory) {
      if (!calculation.subcategoryId) {
        calculationCategory.calculations.push(calculation);
      } else {
        const calculationSubcategory = calculationCategory.subcategories.find(
          (subcategory) => subcategory.id === calculation.subcategoryId,
        );
        calculationSubcategory?.calculations.push(calculation);
      }
    }
  });

  const categories = Array.from(categoriesMap.values());

  return (
    <ResponseForm
      userId={userId}
      locationId={locationId}
      categoriesObj={categories}
      assessment={assessment}
      fetchedGeometries={initialGeometries}
    />
  );
};

export { ResponseComponent };
export {
  type CategoryWithSubcategoryAndQuestion,
  type AssessmentWithResposes,
  type ResponseCalculation,
  type FetchedAssessmentGeometries,
};
