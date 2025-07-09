import { ResponseForm } from "@/app/admin/parks/[locationId]/evaluation/[selectedFormId]/[selectedAssessmentId]/responseForm";
import { ResponseCalculation } from "@customTypes/assessments/calculation";
import { CategoryWithSubcategoryAndQuestionAndCalculation } from "@customTypes/assessments/category";
import { fetchAssessmentWithResponses } from "@serverActions/assessmentUtil";
import { FetchedAssessmentGeometries } from "@serverOnly/geometries";

type AssessmentWithResposes = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentWithResponses>>["assessment"]
>;

const ResponseComponent = ({
  locationId,
  assessment,
  formName,
  initialGeometries,
}: {
  locationId: number;
  assessment: AssessmentWithResposes;
  formName: string;
  initialGeometries: FetchedAssessmentGeometries;
}) => {
  const questions = assessment?.form?.questions;

  const categoriesMap = new Map<
    number,
    CategoryWithSubcategoryAndQuestionAndCalculation
  >();

  questions?.forEach((question) => {
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

  const calculations = assessment.form?.calculations;

  calculations?.forEach((calculation) => {
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
    <div className="flex h-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
      <h3 className="flex flex-col gap-5 text-2xl font-semibold">
        Avaliando: {assessment?.location?.name} com o formulário: {formName}
      </h3>
      <ResponseForm
        locationId={locationId}
        categoriesObj={categories}
        assessment={assessment}
        fetchedGeometries={initialGeometries}
      />
    </div>
  );
};

export { ResponseComponent };
export {
  type AssessmentWithResposes,
  type ResponseCalculation,
  type FetchedAssessmentGeometries,
};
