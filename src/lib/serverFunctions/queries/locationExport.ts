import { prisma } from "@lib/prisma";
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

const locationIdsFromQuery = z.preprocess(
  (value) =>
    typeof value === "string" ? value.split(",").filter(Boolean) : value,
  z.array(z.coerce.number().int().positive()).min(1),
);

export const fetchLocationExportParamsSchema = z.object({
  locationsIds: locationIdsFromQuery,
});

export type FetchLocationExportParams = z.infer<
  typeof fetchLocationExportParamsSchema
>;

export type FetchLocationExportResponse = NonNullable<
  Awaited<ReturnType<typeof fetchLocationExport>>["data"]
>;

export const fetchLocationExport = async (
  request: APIRequestParams<FetchLocationExportParams>,
) => {
  const params = request.params!;

  try {
    const locations = await prisma.location.findMany({
      where: {
        id: {
          in: params.locationsIds,
        },
      },
      select: {
        id: true,
        name: true,
        popularName: true,
        firstStreet: true,
        secondStreet: true,
        thirdStreet: true,
        fourthStreet: true,
        category: {
          select: {
            name: true,
          },
        },
        type: {
          select: {
            name: true,
          },
        },
        city: {
          select: {
            name: true,
            state: true,
          },
        },
        broadAdministrativeUnit: {
          select: {
            name: true,
          },
        },
        intermediateAdministrativeUnit: {
          select: {
            name: true,
          },
        },
        narrowAdministrativeUnit: {
          select: {
            name: true,
          },
        },
        formSubmission: {
          select: {
            id: true,
            form: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (locations.length === 0) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Nenhuma praça encontrada para exportação.",
        } as APIResponseInfo,
        data: null,
      };
    }

    locations.sort((firstLocation, secondLocation) =>
      firstLocation.name.localeCompare(secondLocation.name),
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Projeto Praças";

    const headers = [
      "Identificador",
      "Nome da Praça",
      "Nome popular",
      "Categoria",
      "Tipo",
      "Endereço",
    ];

    const locationsByForm = new Map<
      number | null,
      {
        formName?: string;
        locations: typeof locations;
      }
    >();

    locations.forEach((location) => {
      const formId = location.formSubmission?.form.id ?? null;
      const formGroup = locationsByForm.get(formId);
      if (formGroup) {
        formGroup.locations.push(location);
      } else {
        locationsByForm.set(formId, {
          formName: location.formSubmission?.form.name,
          locations: [location],
        });
      }
    });

    for (const [
      formId,
      { formName, locations: formLocations },
    ] of locationsByForm) {
      const worksheetName =
        formId === null ? "Dados cadastrais" : `${formName} (${formId})`;
      const worksheet = workbook.addWorksheet(getWorksheetName(worksheetName));

      worksheet.mergeCells(1, 1, 1, headers.length);
      worksheet.getCell(1, 1).value = "IDENTIFICAÇÃO PRAÇA";
      worksheet.addRow([]);
      worksheet.addRow(headers);

      let formCategories;
      if (formId !== null) {
        formCategories = (
          await getFormStructure({
            formId,
            publicQuestionsOnly: false,
            includeCalculations: false,
          })
        ).categories;
        insertFormHeaderInWorkSheet({
          categories: formCategories,
          workSheet: worksheet,
        });
      }

      for (const location of formLocations) {
        const streets = [
          location.firstStreet,
          location.secondStreet,
          location.thirdStreet,
          location.fourthStreet,
        ].filter(Boolean);
        const administrativeUnits = [
          location.broadAdministrativeUnit?.name,
          location.intermediateAdministrativeUnit?.name,
          location.narrowAdministrativeUnit?.name,
        ].filter(Boolean);
        const address = [
          streets.join(" / "),
          ...administrativeUnits,
          location.city.name,
          location.city.state,
        ]
          .filter(Boolean)
          .join(" - ");

        worksheet.addRow([
          location.id,
          location.name,
          location.popularName,
          location.category?.name,
          location.type?.name,
          address,
        ]);

        if (formCategories && location.formSubmission) {
          await insertFormSubmissionDataInWorkSheet({
            formSubmissionId: location.formSubmission.id,
            categories: formCategories,
            workSheet: worksheet,
            startColumn: headers.length + 1,
          });
        }
      }

      const lastRow = worksheet.lastRow?.number ?? 0;
      if (lastRow >= 3) {
        worksheet.autoFilter = {
          from: { row: 3, column: 1 },
          to: { row: lastRow, column: worksheet.actualColumnCount },
        };
      }

      worksheet.getRow(1).font = {
        name: "Calibri",
        size: 11,
        bold: true,
      };
      worksheet.getRow(1).alignment = { horizontal: "center" };
      worksheet.getRow(3).font = {
        name: "Calibri",
        size: 11,
        bold: true,
      };
      worksheet.getRow(3).alignment = { horizontal: "center" };

      for (let rowNumber = 4; rowNumber <= lastRow; rowNumber += 1) {
        worksheet.getRow(rowNumber).font = {
          name: "Calibri",
          size: 10,
        };
      }

      autoWidthWorksheetColumns(worksheet);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date();
    const fileName = `informacoes-cadastro-pracas-${now.toISOString()}.xlsx`;

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
        message: "Erro ao gerar o arquivo de dados cadastrais.",
      } as APIResponseInfo,
      data: null,
    };
  }
};
