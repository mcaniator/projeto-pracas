import { deleteQuestionDataSchema } from "@/lib/serverFunctions/apiCalls/questionParamsSchemas";
import { _deleteQuestion } from "@/lib/serverFunctions/serverActions/questionUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteQuestionDataSchema.parse(await request.formData());
  return responseFromResult(await _deleteQuestion(data));
}
