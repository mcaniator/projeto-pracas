import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import { prisma } from "@lib/prisma";
import { BrazilianStates } from "@prisma/client";
import ExcelJS from "exceljs";
import { z } from "zod";

import {
  APIRequestParams,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";
import {
  autoWidthWorksheetColumns,
  getWorksheetName,
} from "../../utils/exceljs";
import { getFormStructure } from "./form";
import {
  insertFormHeaderInWorkSheet,
  insertFormSubmissionDataInWorkSheet,
} from "./formSubmissionExport";

export const fetchAssessmentsExportParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  formId: z.coerce.number().int().positive().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().int().positive().optional(),
  narrowUnitId: z.coerce.number().int().optional(),
  intermediateUnitId: z.coerce.number().int().optional(),
  broadUnitId: z.coerce.number().int().optional(),
  cityId: z.coerce.number().int().positive().optional(),
  state: z.nativeEnum(BrazilianStates).optional(),
  finalizationStatus: z.coerce.number().int().optional(),
});

export type FetchAssessmentsExportParams = z.infer<
  typeof fetchAssessmentsExportParamsSchema
>;

export type FetchAssessmentsExportResponse = NonNullable<
  Awaited<ReturnType<typeof fetchAssessmentsExport>>["data"]
>;

export const fetchAssessmentsExport = async (
  request: APIRequestParams<FetchAssessmentsExportParams>,
) => {
  const params = request.params!;
  const metaCategories = [
    {
      name: "Identificação da praça",
      startColumn: 1,
      endColumn: 15,
    },
    {
      name: "Identificação da avaliação",
      startColumn: 16,
      endColumn: 20,
    },
  ];
  const metaSubcategories = [
    {
      name: "Endereço",
      startColumn: 7,
      endColumn: 15,
    },
  ];
  const metaQuestions = [
    "Identificador da praça",
    "Nome da praça",
    "Nome popular",
    "Categoria",
    "Tipo",
    "Observações",
    "Estado",
    "Cidade",
    "Rua 1",
    "Rua 2",
    "Rua 3",
    "Rua 4",
    "Região administrativa ampla",
    "Região administrativa intermediária",
    "Região administrativa estreita",
    "Identificador do levantamento",
    "Observador",
    "Data/hora inicial",
    "Data/hora final",
    "Duração (minutos)",
  ];

  const addAssessmentMetadataHeader = (worksheet: ExcelJS.Worksheet) => {
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 2,
        ySplit: 0,
        topLeftCell: "C1",
      },
    ];

    metaCategories.forEach(({ name, startColumn, endColumn }) => {
      worksheet.mergeCells(1, startColumn, 1, endColumn);
      const cell = worksheet.getCell(1, startColumn);
      cell.value = name;
      cell.font = { name: "Calibri", bold: true };
    });

    metaSubcategories.forEach(({ name, startColumn, endColumn }) => {
      worksheet.mergeCells(2, startColumn, 2, endColumn);
      const cell = worksheet.getCell(2, startColumn);
      cell.value = name;
      cell.font = { name: "Calibri", bold: true };
    });

    worksheet.addRow(metaQuestions);
  };

  try {
    let isFinalizedFilter: boolean | undefined;
    if (params.finalizationStatus === FINALIZATION_STATUS.FINALIZED) {
      isFinalizedFilter = true;
    } else if (
      params.finalizationStatus === FINALIZATION_STATUS.NOT_FINALIZED
    ) {
      isFinalizedFilter = false;
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        startDate: {
          gte: params.startDate,
          lte: params.endDate,
        },
        isFinalized: isFinalizedFilter,
        formId: params.formId,
        userId: params.userId,
        location: {
          id: params.locationId,
          cityId: params.cityId,
          narrowAdministrativeUnitId: params.narrowUnitId,
          intermediateAdministrativeUnitId: params.intermediateUnitId,
          broadAdministrativeUnitId: params.broadUnitId,
          city: {
            state: params.state,
          },
        },
      },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      select: {
        id: true,
        formSubmissionId: true,
        startDate: true,
        endDate: true,
        formId: true,
        user: {
          select: {
            username: true,
          },
        },
        form: {
          select: {
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            popularName: true,
            category: { select: { name: true } },
            type: { select: { name: true } },
            notes: true,
            firstStreet: true,
            secondStreet: true,
            thirdStreet: true,
            fourthStreet: true,
            city: { select: { name: true, state: true } },
            broadAdministrativeUnit: { select: { name: true } },
            intermediateAdministrativeUnit: { select: { name: true } },
            narrowAdministrativeUnit: { select: { name: true } },
          },
        },
      },
    });

    const assessmentsByFormId = new Map<
      number,
      {
        name: string;
        assessments: (typeof assessments)[number][];
      }
    >();

    assessments.forEach((assessment) => {
      const formGroup = assessmentsByFormId.get(assessment.formId);
      if (formGroup) {
        formGroup.assessments.push(assessment);
      } else {
        assessmentsByFormId.set(assessment.formId, {
          name: assessment.form.name,
          assessments: [assessment],
        });
      }
    });

    if (assessmentsByFormId.size === 0) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Nenhuma avaliação encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Projeto Praças";

    for (const [formId, { name, assessments }] of assessmentsByFormId) {
      const worksheet = workbook.addWorksheet(getWorksheetName(name));
      addAssessmentMetadataHeader(worksheet);
      const { categories } = await getFormStructure({
        formId,
        publicQuestionsOnly: false,
        includeCalculations: false,
      });
      insertFormHeaderInWorkSheet({ categories, workSheet: worksheet });

      for (const assessment of assessments) {
        const { location } = assessment;
        const durationInMinutes =
          assessment.endDate ?
            Math.round(
              (assessment.endDate.getTime() - assessment.startDate.getTime()) /
                60_000,
            )
          : null;

        const assessmentRow = worksheet.addRow([
          location.id,
          location.name,
          location.popularName,
          location.category?.name,
          location.type?.name,
          location.notes,
          location.city.state,
          location.city.name,
          location.firstStreet,
          location.secondStreet,
          location.thirdStreet,
          location.fourthStreet,
          location.broadAdministrativeUnit?.name,
          location.intermediateAdministrativeUnit?.name,
          location.narrowAdministrativeUnit?.name,
          assessment.id,
          assessment.user.username,
          assessment.startDate,
          assessment.endDate,
          durationInMinutes,
        ]);
        assessmentRow.getCell(18).numFmt = "dd/mm/yyyy hh:mm";
        assessmentRow.getCell(19).numFmt = "dd/mm/yyyy hh:mm";

        await insertFormSubmissionDataInWorkSheet({
          formSubmissionId: assessment.formSubmissionId,
          categories,
          workSheet: worksheet,
        });
      }

      const lastRow = worksheet.lastRow?.number;
      if (lastRow && lastRow >= 3) {
        worksheet.autoFilter = {
          from: { row: 3, column: 1 },
          to: { row: lastRow, column: worksheet.actualColumnCount },
        };
      }
    }

    workbook.eachSheet((worksheet) => {
      autoWidthWorksheetColumns(worksheet);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date();
    const fileName = `avaliacoes-${now.toISOString()}.xlsx`;
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        buffer,
        fileName,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao gerar o arquivo de avaliações.",
      } as APIResponseInfo,
      data: null,
    };
  }
};
