import { FormItemType } from "@prisma/client";

import {
  QuestionItem,
  SubcategoryItem,
} from "../../app/admin/registration/forms/[formId]/edit/clientV2";

abstract class FormItemUtils {
  public static getFormItemType(item: {
    categoryId?: number;
    subcategoryId?: number | null;
    questionId?: number | null;
  }) {
    if ("subcategoryId" in item) {
      if ("questionId" in item) {
        return FormItemType.QUESTION;
      }
      return FormItemType.SUBCATEGORY;
    }
    return FormItemType.CATEGORY;
  }

  public static isCategoryType(item: {
    categoryId?: number;
    subcategoryId?: number | null;
    questionId?: number | null;
  }): item is SubcategoryItem {
    if ("questionId" in item || "subcategoryId" in item) {
      return false;
    }
    return true;
  }

  public static isSubcategoryType(item: {
    categoryId?: number;
    subcategoryId?: number | null;
    questionId?: number | null;
  }): item is SubcategoryItem {
    if ("questionId" in item) {
      return false;
    }
    return true;
  }

  public static isQuestionType(item: {
    categoryId?: number;
    subcategoryId?: number | null;
    questionId?: number | null;
  }): item is QuestionItem {
    if ("questionId" in item) {
      return true;
    }
    return false;
  }

  public static buildCategoryChildId({
    item,
    categoryId,
    subcategoryId,
  }: {
    item: QuestionItem | SubcategoryItem;
    categoryId: number;
    subcategoryId?: number | null;
  }) {
    if ("questionId" in item) {
      return `formItem-${categoryId}-${subcategoryId ?? "null"}-${FormItemType.QUESTION}-${item.questionId}`;
    } else {
      //Is subcategory
      return `formItem-${categoryId}-${subcategoryId ?? "null"}-${FormItemType.SUBCATEGORY}-${item.subcategoryId}`;
    }
  }
}

export { FormItemUtils };
