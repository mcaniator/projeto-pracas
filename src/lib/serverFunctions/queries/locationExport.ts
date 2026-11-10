import { prisma } from "@lib/prisma";
import ExcelJS from "exceljs";
import { z } from "zod";

import {
  APIRequestParams,
  APIResponseInfo,
} from "../../types/backendCalls/APIResponse";
import type { CategoryItem } from "../../types/forms/formStructure";
import {
  autoWidthWorksheetColumns,
  getWorksheetName,
} from "../../utils/exceljs";
import { FormItemUtils } from "../../utils/formTreeUtils";
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

const getCategoryBoundaryColumns = ({
  categories,
  startColumn,
}: {
  categories: CategoryItem[];
  startColumn: number;
}) => {
  let currentColumn = startColumn;

  return categories.flatMap((category) => {
    const categoryQuestionCount = category.categoryChildren.reduce(
      (count, child) =>
        count +
        (FormItemUtils.isSubcategoryType(child) ? child.questions.length : 1),
      0,
    );
    if (categoryQuestionCount === 0) return [];

    currentColumn += categoryQuestionCount;
    return [currentColumn - 1];
  });
};

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
      "Identificador da praça",
      "Nome da praça",
      "Nome popular",
      "Categoria",
      "Tipo",
      "Estado",
      "Cidade",
      "Rua 1",
      "Rua 2",
      "Rua 3",
      "Rua 4",
      "Região administrativa ampla",
      "Região administrativa intermediária",
      "Região administrativa estreita",
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
        formId === null ? "Dados cadastrais" : `${formName}`;
      const worksheet = workbook.addWorksheet(getWorksheetName(worksheetName));

      worksheet.mergeCells(1, 1, 1, headers.length);
      worksheet.getCell(1, 1).value = "IDENTIFICAÇÃO PRAÇA";
      worksheet.addRow([]);
      worksheet.mergeCells(2, 7, 2, headers.length);
      worksheet.getCell(2, 7).value = "Endereço";
      worksheet.addRow(headers);

      let formCategories;
      let categoryBoundaryColumns = [headers.length];
      if (formId !== null) {
        formCategories = (
          await getFormStructure({
            formId,
            publicQuestionsOnly: false,
            includeCalculations: false,
          })
        ).categories;
        categoryBoundaryColumns = [
          ...categoryBoundaryColumns,
          ...getCategoryBoundaryColumns({
            categories: formCategories,
            startColumn: headers.length + 1,
          }),
        ];
        insertFormHeaderInWorkSheet({
          categories: formCategories,
          workSheet: worksheet,
        });
      }

      worksheet.getRow(2).eachCell((cell) => {
        if (cell.value === null || cell.value === undefined) return;

        cell.font = { ...cell.font, bold: true };
        cell.alignment = { ...cell.alignment, horizontal: "center" };
      });

      for (const location of formLocations) {
        worksheet.addRow([
          location.id,
          location.name,
          location.popularName,
          location.category?.name,
          location.type?.name,
          location.city.state,
          location.city.name,
          location.firstStreet,
          location.secondStreet,
          location.thirdStreet,
          location.fourthStreet,
          location.broadAdministrativeUnit?.name,
          location.intermediateAdministrativeUnit?.name,
          location.narrowAdministrativeUnit?.name,
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

      for (let rowNumber = 1; rowNumber <= lastRow; rowNumber += 1) {
        categoryBoundaryColumns.forEach((column) => {
          worksheet.getCell(rowNumber, column).border = {
            ...worksheet.getCell(rowNumber, column).border,
            right: {
              style: "medium",
              color: { argb: "000000" },
            },
          };
        });
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
