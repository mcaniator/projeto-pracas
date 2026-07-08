import { booleanFromString } from "@/lib/zodValidators";
import { z } from "zod";

export const fetchQuestionsByCategoryAndSubcategoryParamsSchema = z.object({
  categoryId: z.coerce.number().int().nullish(),
  subcategoryId: z.coerce.number().nullish(),
  verifySubcategoryNullness: booleanFromString.nullish(),
  name: z.string().optional().nullish(),
});

export type FetchQuestionsByCategoryAndSubcategoryParams = z.infer<
  typeof fetchQuestionsByCategoryAndSubcategoryParamsSchema
>;

export const fetchQuestionUsesParamsSchema = z.object({
  questionId: z.coerce.number().int(),
});

export type FetchQuestionUsesParams = z.infer<
  typeof fetchQuestionUsesParamsSchema
>;

export const questionSubmitDataSchema = z.instanceof(FormData);

export type QuestionSubmitData = z.infer<typeof questionSubmitDataSchema>;

export const questionUpdateDataSchema = z.instanceof(FormData);

export type QuestionUpdateData = z.infer<typeof questionUpdateDataSchema>;

export const deleteQuestionDataSchema = z.instanceof(FormData);

export type DeleteQuestionData = z.infer<typeof deleteQuestionDataSchema>;
