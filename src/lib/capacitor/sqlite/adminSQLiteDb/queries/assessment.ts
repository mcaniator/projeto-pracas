import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { sqliteBooleanSchema } from "@/lib/capacitor/sqlite/helpers";
import type { SQLiteTransactionOperation } from "@/lib/capacitor/sqlite/sqlite";
import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import type {
  CreateAssessmentData,
  CreateAssessmentResponse,
  DeleteAssessmentData,
} from "@/lib/serverFunctions/mutations/assessmentUtil";
import type {
  AssessmentSubmitData,
  AssessmentSubmitResponse,
} from "@/lib/serverFunctions/mutations/responseUtil";
import type {
  FetchAssessmentTreeParams,
  FetchAssessmentTreeResponse,
  FetchAssessmentUsersResponse,
  FetchAssessmentsParams,
  FetchAssessmentsResponse,
} from "@/lib/serverFunctions/queries/assessment";
import {
  type AssessmentDraft,
  assessmentDraftSchema,
} from "@/lib/types/assessments/assessmentDraft";
import type {
  APIRequest,
  APIRequestData,
  APIRequestParams,
  APIResponse,
} from "@/lib/types/backendCalls/APIResponse";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { Role } from "@prisma/client";
import { z } from "zod";

import {
  getAdminSQLiteFormSubmissionCreateOperation,
  getAdminSQLiteFormSubmissionData,
  getAdminSQLiteFormSubmissionUpdateOperations,
} from "./formSubmission";

const assessmentsSchema = z.array(
  z.object({
    id: z.coerce.number(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable(),
    isFinalized: sqliteBooleanSchema,
    isPublic: sqliteBooleanSchema,
    username: z.string(),
    formName: z.string(),
    locationName: z.string(),
  }),
);

const assessmentUsersSchema = z.array(
  z.object({
    id: z.string(),
    username: z.string(),
  }),
);

const assessmentSchema = z.array(
  z.object({
    id: z.coerce.number(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable(),
    isFinalized: sqliteBooleanSchema,
    updatedAt: z.coerce.date(),
    driveFolderUrl: z.string().nullable(),
    userId: z.string(),
    username: z.string(),
    locationId: z.coerce.number(),
    locationName: z.string(),
    locationPolygon: z.string().nullable(),
    formSubmissionId: z.coerce.number(),
  }),
);

const currentUserForResponsesSchema = z.object({
  id: z.string(),
  roles: z
    .string()
    .transform((value) => JSON.parse(value) as unknown)
    .pipe(z.array(z.nativeEnum(Role))),
});

const editableAssessmentSchema = z.object({
  id: z.coerce.number(),
  existsRemotely: sqliteBooleanSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isFinalized: sqliteBooleanSchema,
  isPublic: sqliteBooleanSchema,
  driveFolderUrl: z.string().nullable(),
  userId: z.string(),
  locationId: z.coerce.number(),
  formId: z.coerce.number(),
  formSubmissionId: z.coerce.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const createAdminSQLiteAssessment = async (
  request: APIRequestData<CreateAssessmentData>,
): Promise<APIResponse<CreateAssessmentResponse>> => {
  try {
    const { locationId, formId, startDate } = request.data!;
    const currentUserValues = await adminSQLiteDb.query({
      statement: `SELECT id FROM "current_user" LIMIT 1`,
    });
    const userId = z
      .object({ id: z.string() })
      .parse(currentUserValues.values[0]).id;
    const now = new Date();
    const nextAssessmentIdValues = await adminSQLiteDb.query({
      statement: `SELECT COALESCE(MAX(id), 0) + 1 AS id FROM assessment`,
    });
    const assessmentId = z
      .object({ id: z.coerce.number().int().positive() })
      .parse(nextAssessmentIdValues.values[0]).id;
    const createFormSubmissionOperation =
      getAdminSQLiteFormSubmissionCreateOperation({ formId });

    await adminSQLiteDb.executeTransaction([
      createFormSubmissionOperation,
      {
        statement: `INSERT INTO assessment (
          id,
          exists_remotely,
          start_date,
          end_date,
          is_finalized,
          is_public,
          drive_folder_url,
          user_id,
          location_id,
          form_id,
          form_submission_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, last_insert_rowid(), ?, ?)`,
        values: [
          assessmentId,
          0,
          startDate,
          null,
          0,
          0,
          null,
          userId,
          locationId,
          formId,
          now,
          now,
        ],
      },
    ]);

    return {
      responseInfo: {
        statusCode: 201,
        message: "Avaliação criada no dispositivo!",
      } as APIResponseInfo,
      data: {
        assessmentId,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar avaliação offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

type CreateAssessmentDataFromRemoteAssessment = {
  id: number;
  startDate: Date;
  endDate: Date | null;
  isFinalized: boolean;
  isPublic: boolean;
  driveFolderUrl: string | null;
  locationId: number;
  formId: number;
};

const createAdminSQLiteAssessmentFromRemoteAssessment = async (
  request: APIRequestData<CreateAssessmentDataFromRemoteAssessment>,
): Promise<APIResponse<CreateAssessmentResponse>> => {
  try {
    const data = request.data;
    if (!data) {
      throw new Error("Data not found");
    }
    const currentUserValues = await adminSQLiteDb.query({
      statement: `SELECT id FROM "current_user" LIMIT 1`,
    });
    const userId = z
      .object({ id: z.string() })
      .parse(currentUserValues.values[0]).id;
    const now = new Date();
    const createFormSubmissionOperation =
      getAdminSQLiteFormSubmissionCreateOperation({ formId: data.formId });

    await adminSQLiteDb.executeTransaction([
      createFormSubmissionOperation,
      {
        statement: `INSERT INTO assessment (
          exists_remotely,
          id,
          start_date,
          end_date,
          is_finalized,
          is_public,
          drive_folder_url,
          user_id,
          location_id,
          form_id,
          form_submission_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, last_insert_rowid(), ?, ?)`,
        values: [
          1,
          data.id,
          data.startDate,
          data.endDate,
          data.isFinalized,
          data.isPublic,
          data.driveFolderUrl,
          userId,
          data.locationId,
          data.formId,
          now,
          now,
        ],
      },
    ]);

    return {
      responseInfo: {
        statusCode: 201,
        message: "Avaliação criada no dispositivo!",
      } as APIResponseInfo,
      data: {
        assessmentId: data.id,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar avaliação offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const deleteAdminSQLiteAssessment = async (
  request: APIRequestData<DeleteAssessmentData>,
) => {
  const data = request.data;
  if (!data) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Dados inválidos para excluir avaliação do dispostivo!",
      } as APIResponseInfo,
      data: null,
    };
  }
  try {
    const assessmentToDelete = await adminSQLiteDb.query({
      statement: `
        SELECT form_submission_id AS formSubmissionId
        FROM assessment
        WHERE id = ?
      `,
      values: [data.assessmentId],
    });
    const formSubmissionId = z
      .object({ formSubmissionId: z.coerce.number() })
      .safeParse(assessmentToDelete.values[0]);
    if (!formSubmissionId.success) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação nao encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }
    await adminSQLiteDb.executeTransaction([
      {
        statement: `DELETE FROM assessment_draft WHERE assessment_id = ?`,
        values: [data.assessmentId],
      },
      {
        statement: `DELETE FROM assessment WHERE id = ?`,
        values: [data.assessmentId],
      },
      {
        statement: `DELETE FROM form_submission WHERE id = ?`,
        values: [formSubmissionId.data.formSubmissionId],
      },
    ]);

    return {
      responseInfo: {
        statusCode: 200,
        message: "Avaliação excluída com sucesso!",
      } as APIResponseInfo,
      data: null,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir avaliação offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const assessmentExistsRemotelySchema = z.object({
  existsRemotely: sqliteBooleanSchema,
});

type UpdateAdminSQLiteAssessmentRemoteReferenceData = {
  oldAssessmentId: number;
  newAssessmentId: number;
};

const updateAdminSQLiteAssessmentRemoteReference = async (
  request: APIRequestData<UpdateAdminSQLiteAssessmentRemoteReferenceData>,
) => {
  const data = request.data;
  if (!data) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Dados inválidos para atualizar a avaliação no dispositivo!",
      } as APIResponseInfo,
    };
  }

  try {
    const localAssessmentValues = await adminSQLiteDb.query({
      statement: `
        SELECT exists_remotely AS existsRemotely
        FROM assessment
        WHERE id = ?
        LIMIT 1
      `,
      values: [data.oldAssessmentId],
    });
    const localAssessment = assessmentExistsRemotelySchema.safeParse(
      localAssessmentValues.values[0],
    );
    if (!localAssessment.success) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação local não encontrada!",
        } as APIResponseInfo,
      };
    }
    if (localAssessment.data.existsRemotely) {
      return {
        responseInfo: {
          statusCode: 409,
          message: "A avaliação já existe no servidor!",
        } as APIResponseInfo,
      };
    }

    // If there is another assessment with the new id, it needs to be changed to the next available id
    const assessmentWithConflictingIdValues = await adminSQLiteDb.query({
      statement: `
        SELECT exists_remotely AS existsRemotely
        FROM assessment
        WHERE id = ?
          AND id <> ?
        LIMIT 1
      `,
      values: [data.newAssessmentId, data.oldAssessmentId],
    });
    const assessmentWithConflictingId =
      assessmentExistsRemotelySchema.safeParse(
        assessmentWithConflictingIdValues.values[0],
      );
    if (
      assessmentWithConflictingId.success &&
      assessmentWithConflictingId.data.existsRemotely
    ) {
      return {
        responseInfo: {
          statusCode: 409,
          message:
            "Já existe uma avaliação local espelhada remotamente com o identificador retornado pelo servidor!",
        } as APIResponseInfo,
      };
    }

    const transaction: SQLiteTransactionOperation[] = [];
    if (assessmentWithConflictingId.success) {
      // If there is another local assessment with the new id, it needs to be changed to the next available id
      const nextAvailableIdValues = await adminSQLiteDb.query({
        statement: `SELECT COALESCE(MAX(id), 0) + 1 AS id FROM assessment`,
      });
      const nextAvailableId = z
        .object({ id: z.coerce.number().int().positive() })
        .parse(nextAvailableIdValues.values[0]).id;

      transaction.push({
        statement: `UPDATE assessment SET id = ? WHERE id = ?`,
        values: [nextAvailableId, data.newAssessmentId],
      });
      // The draft needs to be updated manually, because the draft is does not have a foreign key
      transaction.push({
        statement: `
          UPDATE assessment_draft
          SET assessment_id = ?
          WHERE assessment_id = ?
        `,
        values: [nextAvailableId, data.newAssessmentId],
      });
    }
    // Update the local assessment id, to reflect the remote reference
    transaction.push({
      statement: `
        UPDATE assessment
        SET id = ?, exists_remotely = 1
        WHERE id = ?
      `,
      values: [data.newAssessmentId, data.oldAssessmentId],
    });
    // The draft needs to be updated manually, because the draft is does not have a foreign key
    transaction.push({
      statement: `
        UPDATE assessment_draft
        SET assessment_id = ?
        WHERE assessment_id = ?
      `,
      values: [data.newAssessmentId, data.oldAssessmentId],
    });
    await adminSQLiteDb.executeTransaction(transaction);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao atualizar a avaliação no dispositivo!",
      } as APIResponseInfo,
    };
  }
};

type FetchAdminSQLiteAssessmentBasicDataParams = {
  assessmentId: number;
};

const fetchAdminSQLiteAssessmentTableData = async (
  request: APIRequestParams<FetchAdminSQLiteAssessmentBasicDataParams>,
) => {
  const params = request.params;
  if (!params) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Parametros inválidos para consultar avaliação offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
  try {
    const assessmentValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          id,
          exists_remotely AS existsRemotely,
          start_date AS startDate,
          end_date AS endDate,
          is_finalized AS isFinalized,
          is_public AS isPublic,
          drive_folder_url AS driveFolderUrl,
          user_id AS userId,
          location_id AS locationId,
          form_id AS formId,
          form_submission_id AS formSubmissionId,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM assessment
        WHERE id = ?
        LIMIT 1
      `,
      values: [params.assessmentId],
    });
    const assessment = editableAssessmentSchema.parse(
      assessmentValues.values[0],
    );
    if (!assessment) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação nao encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }
    return {
      responseInfo: {
        statusCode: 200,
        message: "Avaliação encontrada!",
      } as APIResponseInfo,
      data: assessment,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliação offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const adminSQLiteAssessmentSubmit = async (
  request: APIRequestData<AssessmentSubmitData>,
): Promise<APIResponse<AssessmentSubmitResponse>> => {
  const {
    assessmentId,
    formSubmission,
    startDate,
    endDate,
    isFinalized,
    driveFolderUrl,
  } = request.data!;

  try {
    const currentUserValues = await adminSQLiteDb.query({
      statement: `SELECT id, roles FROM "current_user" LIMIT 1`,
    });
    const currentUserValue = currentUserValues.values[0];
    if (!currentUserValue) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Erro na autenticação!",
        } as APIResponseInfo,
      };
    }
    const currentUser = currentUserForResponsesSchema.parse(currentUserValue);
    const assessmentValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          id,
          exists_remotely AS existsRemotely,
          start_date AS startDate,
          end_date AS endDate,
          is_finalized AS isFinalized,
          is_public AS isPublic,
          drive_folder_url AS driveFolderUrl,
          user_id AS userId,
          location_id AS locationId,
          form_id AS formId,
          form_submission_id AS formSubmissionId,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM assessment
        WHERE id = ?
        LIMIT 1
      `,
      values: [assessmentId],
    });
    const assessmentValue = assessmentValues.values[0];
    if (!assessmentValue) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Avaliação não encontrada!",
        } as APIResponseInfo,
      };
    }
    const assessment = editableAssessmentSchema.parse(assessmentValue);

    if (
      currentUser.id !== assessment.userId &&
      !currentUser.roles.includes(Role.ASSESSMENT_MANAGER)
    ) {
      return {
        responseInfo: {
          statusCode: 401,
          message: "Sem permissão para editar esta avaliação!",
        } as APIResponseInfo,
      };
    }

    const now = new Date();
    const formSubmissionOperations =
      await getAdminSQLiteFormSubmissionUpdateOperations({
        formSubmissionId: assessment.formSubmissionId,
        formSubmission,
        userId: currentUser.id,
        updatedAt: now,
      });

    // The assessment is part of the same transaction and is only updated when
    // every form-submission operation succeeds.
    await adminSQLiteDb.executeBulkUpsertTransaction([
      {
        table: "assessment",
        insertColumns: [
          "id",
          "exists_remotely",
          "start_date",
          "end_date",
          "is_finalized",
          "is_public",
          "drive_folder_url",
          "user_id",
          "location_id",
          "form_id",
          "form_submission_id",
          "created_at",
          "updated_at",
        ],
        updateColumns: [
          "start_date",
          "end_date",
          "is_finalized",
          "is_public",
          "drive_folder_url",
          "updated_at",
        ],
        conflictColumns: ["id"],
        rows: [
          [
            assessment.id,
            assessment.existsRemotely,
            startDate.toISOString(),
            endDate?.toISOString() ?? null,
            isFinalized,
            isFinalized && assessment.isPublic,
            driveFolderUrl,
            assessment.userId,
            assessment.locationId,
            assessment.formId,
            assessment.formSubmissionId,
            assessment.createdAt.toISOString(),
            now.toISOString(),
          ],
        ],
      },
      ...formSubmissionOperations,
    ]);

    return {
      responseInfo: {
        statusCode: 201,
        message: "Avaliação salva!",
      } as APIResponseInfo,
      data: {
        savedAsFinalized: isFinalized,
        updatedAt: now,
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar avaliação!",
      } as APIResponseInfo,
    };
  }
};

const fetchAdminSQLiteHasAssessments = async (_request: APIRequest) => {
  try {
    const hasAssessments = await adminSQLiteDb.query({
      statement: `SELECT 1 FROM assessment LIMIT 1`,
    });
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        hasAssessments: hasAssessments.values.length > 0,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliações offline!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const fetchAdminSQLiteAssessments = async (
  request: APIRequestParams<FetchAssessmentsParams>,
): Promise<APIResponse<FetchAssessmentsResponse>> => {
  const params = request.params ?? {};
  try {
    const where: string[] = ["1 = 1"];
    const values: (number | string)[] = [];

    if (params.startDate) {
      where.push("a.start_date >= ?");
      values.push(params.startDate.toISOString());
    }
    if (params.endDate) {
      where.push("a.start_date <= ?");
      values.push(params.endDate.toISOString());
    }
    if (params.finalizationStatus === FINALIZATION_STATUS.FINALIZED) {
      where.push("a.is_finalized = 1");
    } else if (
      params.finalizationStatus === FINALIZATION_STATUS.NOT_FINALIZED
    ) {
      where.push("a.is_finalized = 0");
    }
    if (params.formId != null) {
      where.push("a.form_id = ?");
      values.push(params.formId);
    }
    if (params.userId != null) {
      where.push("a.user_id = ?");
      values.push(params.userId);
    }
    if (params.locationId != null) {
      where.push("l.id = ?");
      values.push(params.locationId);
    }
    if (params.cityId != null) {
      where.push("l.city_id = ?");
      values.push(params.cityId);
    }
    if (params.narrowUnitId != null) {
      where.push("l.narrow_administrative_unit_id = ?");
      values.push(params.narrowUnitId);
    }
    if (params.intermediateUnitId != null) {
      where.push("l.intermediate_administrative_unit_id = ?");
      values.push(params.intermediateUnitId);
    }
    if (params.broadUnitId != null) {
      where.push("l.broad_administrative_unit_id = ?");
      values.push(params.broadUnitId);
    }

    const assessmentValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          a.id,
          a.start_date AS startDate,
          a.end_date AS endDate,
          a.is_finalized AS isFinalized,
          a.is_public AS isPublic,
          u.username,
          f.name AS formName,
          l.name AS locationName
        FROM assessment a
        INNER JOIN "user" u ON u.id = a.user_id
        INNER JOIN form f ON f.id = a.form_id
        INNER JOIN location l ON l.id = a.location_id
        WHERE ${where.join(" AND ")}
        ORDER BY a.start_date DESC
      `,
      values,
    });
    const assessments = assessmentsSchema
      .parse(assessmentValues.values)
      .map((assessment) => ({
        id: assessment.id,
        startDate: assessment.startDate,
        endDate: assessment.endDate,
        isFinalized: assessment.isFinalized,
        isPublic: assessment.isPublic,
        user: {
          username: assessment.username,
        },
        form: {
          name: assessment.formName,
        },
        location: {
          name: assessment.locationName,
        },
      }));

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessments,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliações!",
      } as APIResponseInfo,
      data: {
        assessments: [],
      },
    };
  }
};

const fetchAdminSQLiteAssessmentUsers = async (
  _request: APIRequest,
): Promise<APIResponse<FetchAssessmentUsersResponse>> => {
  try {
    const userValues = await adminSQLiteDb.query({
      statement: `
        SELECT DISTINCT u.id, u.username
        FROM "user" u
        INNER JOIN assessment a ON a.user_id = u.id
        ORDER BY u.username ASC
      `,
    });
    const users = assessmentUsersSchema.parse(userValues.values);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        users,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliadores!",
      } as APIResponseInfo,
      data: {
        users: [],
      },
    };
  }
};

const fetchAdminSQLiteAssessmentTree = async (
  request: APIRequestParams<FetchAssessmentTreeParams>,
): Promise<APIResponse<FetchAssessmentTreeResponse>> => {
  const params = request.params!;
  try {
    const assessmentValues = await adminSQLiteDb.query({
      statement: `
        SELECT
          a.id,
          a.start_date AS startDate,
          a.end_date AS endDate,
          a.is_finalized AS isFinalized,
          a.updated_at AS updatedAt,
          a.drive_folder_url AS driveFolderUrl,
          a.form_submission_id AS formSubmissionId,
          u.id AS userId,
          u.username,
          l.id AS locationId,
          l.name AS locationName,
          l.polygon AS locationPolygon
        FROM assessment a
        INNER JOIN "user" u ON u.id = a.user_id
        INNER JOIN location l ON l.id = a.location_id
        WHERE a.id = ?
        LIMIT 1
      `,
      values: [params.assessmentId],
    });
    const assessment = assessmentSchema.parse(assessmentValues.values)[0];
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const formSubmission = await getAdminSQLiteFormSubmissionData({
      formSubmissionId: assessment.formSubmissionId,
      includeCalculations: true,
    });

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessmentTree: {
          id: assessment.id,
          startDate: assessment.startDate,
          endDate: assessment.endDate,
          isFinalized: assessment.isFinalized,
          updatedAt: assessment.updatedAt,
          driveFolderUrl: assessment.driveFolderUrl,
          location: {
            id: assessment.locationId,
            name: assessment.locationName,
            st_asgeojson: assessment.locationPolygon,
          },
          user: {
            id: assessment.userId,
            username: assessment.username,
          },
          formSubmission,
        },
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar avaliação!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const FetchAdminSQLiteIfCanSaveAssessmentParamsSchema = z.object({
  formId: z.coerce.number(),
  locationId: z.coerce.number(),
  userId: z.string(),
});

type FetchAdminSQLiteIfCanSaveAssessmentParams = z.infer<
  typeof FetchAdminSQLiteIfCanSaveAssessmentParamsSchema
>;

const fetchAdminSQLiteIfCanSaveAssessment = async (
  request: APIRequestParams<FetchAdminSQLiteIfCanSaveAssessmentParams>,
) => {
  try {
    const params = request.params;
    if (!params) {
      throw new Error("Params not found");
    }
    const formId = params.formId;
    const locationId = params.locationId;
    const userId = params.userId;

    const SQLiteForm = await adminSQLiteDb.query({
      statement: `SELECT * FROM "form" WHERE id = ? LIMIT 1`,
      values: [formId],
    });
    const SQLiteLocation = await adminSQLiteDb.query({
      statement: `SELECT * FROM "location" WHERE id = ? LIMIT 1`,
      values: [locationId],
    });
    const SQLiteUser = await adminSQLiteDb.query({
      statement: `SELECT * FROM "user" WHERE id = ? LIMIT 1`,
      values: [userId],
    });

    let canSave = false;
    if (
      SQLiteForm.values.length > 0 &&
      SQLiteLocation.values.length > 0 &&
      SQLiteUser.values.length > 0
    ) {
      canSave = true;
    }
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        canSave,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
      } as APIResponseInfo,
      data: {
        canSave: false,
      },
    };
  }
};

// #region Draft

const assessmentDraftValuesSchema = z.array(
  z.object({
    draft: z
      .string()
      .transform((draft) => JSON.parse(draft) as unknown)
      .pipe(assessmentDraftSchema),
  }),
);

const assessmentDraftIdsSchema = z.array(
  z.object({
    assessmentId: z.coerce.number(),
  }),
);

type SaveAdminSQLiteAssessmentDraftData = {
  assessmentId: number;
  draft: AssessmentDraft;
};

const saveAdminSQLiteAssessmentDraft = async (
  request: APIRequestData<SaveAdminSQLiteAssessmentDraftData>,
) => {
  const data = request.data;
  if (!data) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Dados inválidos para salvar o rascunho da avaliação!",
      } as APIResponseInfo,
      data: null,
    };
  }

  try {
    await adminSQLiteDb.run(
      `INSERT OR REPLACE INTO assessment_draft (assessment_id, draft)
       VALUES (?, ?)`,
      [data.assessmentId, JSON.stringify(data.draft)],
    );

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: null,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar rascunho da avaliação no dispositivo!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

type DeleteAdminSQLiteAssessmentDraftData = {
  assessmentId: number;
};

const deleteAdminSQLiteAssessmentDraft = async (
  request: APIRequestData<DeleteAdminSQLiteAssessmentDraftData>,
) => {
  const data = request.data;
  if (!data) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Dados inválidos para excluir o rascunho da avaliação!",
      } as APIResponseInfo,
      data: null,
    };
  }

  try {
    await adminSQLiteDb.run(
      `DELETE FROM assessment_draft WHERE assessment_id = ?`,
      [data.assessmentId],
    );

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: null,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir rascunho da avaliação do dispositivo!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

type FetchAdminSQLiteAssessmentDraftParams = {
  assessmentId: number;
};

const fetchAdminSQLiteAssessmentDraft = async (
  request: APIRequestParams<FetchAdminSQLiteAssessmentDraftParams>,
) => {
  const params = request.params;
  if (!params) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Parâmetros inválidos para consultar o rascunho da avaliação!",
      } as APIResponseInfo,
      data: null,
    };
  }

  try {
    const assessmentDraftValues = await adminSQLiteDb.query({
      statement: `
        SELECT draft
        FROM assessment_draft
        WHERE assessment_id = ?
        LIMIT 1
      `,
      values: [params.assessmentId],
    });
    const assessmentDraft = assessmentDraftValuesSchema.parse(
      assessmentDraftValues.values,
    )[0];

    if (!assessmentDraft) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Rascunho da avaliação não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: assessmentDraft.draft,
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar rascunho da avaliação no dispositivo!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

const fetchAdminSQLiteAssessmentDraftsIds = async (_request: APIRequest) => {
  try {
    const assessmentDraftValues = await adminSQLiteDb.query({
      statement: `SELECT assessment_id AS assessmentId FROM assessment_draft`,
    });
    const assessmentIds = assessmentDraftIdsSchema
      .parse(assessmentDraftValues.values)
      .map((assessmentDraft) => assessmentDraft.assessmentId);

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        assessmentIds,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar rascunhos de avaliações no dispositivo!",
      } as APIResponseInfo,
      data: {
        assessmentIds: [],
      },
    };
  }
};

// #endregion

export {
  adminSQLiteAssessmentSubmit,
  createAdminSQLiteAssessment,
  createAdminSQLiteAssessmentFromRemoteAssessment,
  fetchAdminSQLiteAssessments,
  fetchAdminSQLiteAssessmentTree,
  fetchAdminSQLiteAssessmentUsers,
  fetchAdminSQLiteHasAssessments,
  fetchAdminSQLiteIfCanSaveAssessment,
  deleteAdminSQLiteAssessment,
  deleteAdminSQLiteAssessmentDraft,
  fetchAdminSQLiteAssessmentDraft,
  fetchAdminSQLiteAssessmentDraftsIds,
  fetchAdminSQLiteAssessmentTableData,
  saveAdminSQLiteAssessmentDraft,
  updateAdminSQLiteAssessmentRemoteReference,
};
