import { GetFormReturn } from "@serverOnly/formTree";

import { FormEditorTree } from "../../app/admin/registration/forms/[formId]/edit/clientV2";

const mapFormToFormTree = (form: GetFormReturn): FormEditorTree | null => {
  if (!form) {
    return null;
  }
  return {
    id: form.id,
    name: form.name,
    categories: form.formCategories.map((fc) => ({
      id: fc.categoryId,
      name: fc.category.name,
      position: fc.position,
      questions: fc.formQuestions.map((fq) => ({
        id: fq.questionId,
        name: fq.question.name,
        notes: fq.question.notes,
        type: fq.question.type,
        characterType: fq.question.characterType,
        optionType: fq.question.optionType,
        options: fq.question.options,
        position: fq.position,
      })),
      subcategories: fc.formSubcategories.map((fs) => ({
        id: fs.subcategoryId,
        name: fs.subcategory.name,
        position: fs.position,
        questions: fs.formQuestions.map((fq) => ({
          id: fq.questionId,
          name: fq.question.name,
          notes: fq.question.notes,
          type: fq.question.type,
          characterType: fq.question.characterType,
          optionType: fq.question.optionType,
          options: fq.question.options,
          position: fq.position,
        })),
      })),
    })),
  };
};

export { mapFormToFormTree };
