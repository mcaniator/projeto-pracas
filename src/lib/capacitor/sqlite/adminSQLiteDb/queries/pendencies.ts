import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import type { APIRequest } from "@/lib/types/backendCalls/APIResponse";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

const assessmentsSchema = z.object({
  assessments: z.coerce.number().int().nonnegative(),
});

const fetchPendencies = async (_request: APIRequest) => {
  try {
    const assessmentsValues = await adminSQLiteDb.query({
      statement: `SELECT COUNT(*) AS assessments FROM assessment`,
    });
    const assessments = assessmentsSchema.parse(assessmentsValues.values[0]);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessments: assessments.assessments,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar pendências no dispositivo!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export { fetchPendencies };
