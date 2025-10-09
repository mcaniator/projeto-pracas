import { FormItemType } from "@enums/formTree";

import {
  QuestionItem,
  SubcategoryItem,
} from "../../app/admin/forms/[formId]/edit/clientV2";

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
    if (
      ("questionId" in item && item.questionId !== null) ||
      ("subcategoryId" in item && item.subcategoryId !== null)
    ) {
      return false;
    }
    return item.categoryId != null && "categoryId" in item;
  }

  public static isSubcategoryType(item: {
    categoryId?: number;
    subcategoryId?: number | null;
    questionId?: number | null;
  }): item is SubcategoryItem {
    if ("questionId" in item && item.questionId !== null) {
      return false;
    }
    return item.subcategoryId != null && "subcategoryId" in item;
  }

  public static isQuestionType(item: {
    categoryId?: number;
    subcategoryId?: number | null;
    questionId?: number | null;
  }): item is QuestionItem {
    if ("questionId" in item) {
      return item.questionId !== null;
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

  public static getItemRankForSorting(item: {
    categoryId?: number;
    subcategoryId?: number | null;
    questionId?: number | null;
  }) {
    if (item.categoryId && !item.subcategoryId && !item.questionId) return 1;
    if (item.categoryId && item.subcategoryId && !item.questionId) return 2;
    if (item.questionId) return 3;
    throw new Error("Invalid item type");
  }
}

export { FormItemUtils };
