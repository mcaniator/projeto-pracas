import { ResponseForm } from "@/components/singleUse/admin/response/responseForm";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import { searchOptionsByQuestionId } from "@/serverActions/questionUtil";
import { Question, QuestionTypes } from "@prisma/client";

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

const ResponseComponent = async ({
  locationId,
  formId,
  formVersion,
  userId,
}: {
  locationId: number;
  formId: number;
  formVersion: number;
  userId: string;
}) => {
  const questions = await searchQuestionsByFormId(formId);

  if (questions === null) return null;
  const options = await Promise.all(
    questions.map(async (question) => {
      if (question.type === QuestionTypes.OPTIONS) {
        const options = await searchOptionsByQuestionId(question.id);
        return { questionId: question.id, options };
      }
      return { questionId: question.id, options: [] };
    }),
  );

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
          locationId={locationId}
          formId={formId}
          formVersion={formVersion}
          questions={questions}
          options={options}
          userId={userId}
          categoriesObj={categories}
        />
      </div>
    </div>
  );
};

export { ResponseComponent };
export { type CategoryWithSubcategoryAndQuestion };
