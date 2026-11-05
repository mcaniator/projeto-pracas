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
import { insertFormSubmissionDataInWorkSheet } from "./formSubmissionExport";
import {
  TALLY_EXPORT_META_QUESTIONS,
  addTallyMetadataHeader,
} from "./tallysExportHeader";

export const fetchTallysExportParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  tallyProtocolId: z.coerce.number().int().positive().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().int().positive().optional(),
  narrowUnitId: z.coerce.number().int().optional(),
  intermediateUnitId: z.coerce.number().int().optional(),
  broadUnitId: z.coerce.number().int().optional(),
  cityId: z.coerce.number().int().positive().optional(),
  state: z.nativeEnum(BrazilianStates).optional(),
  finalizationStatus: z.coerce.number().int().optional(),
});

export type FetchTallysExportParams = z.infer<
  typeof fetchTallysExportParamsSchema
>;

export type FetchTallysExportResponse = NonNullable<
  Awaited<ReturnType<typeof fetchTallysExport>>["data"]
>;

export const nonTotalCellFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFF2CB" },
};

export const totalCellFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFE598" },
};

export const mainTotalCellFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFD965" },
};

export const fetchTallysExport = async (
  request: APIRequestParams<FetchTallysExportParams>,
) => {
  const params = request.params!;
  try {
    let isFinalizedFilter: boolean | undefined;
    if (params.finalizationStatus === FINALIZATION_STATUS.FINALIZED) {
      isFinalizedFilter = true;
    } else if (
      params.finalizationStatus === FINALIZATION_STATUS.NOT_FINALIZED
    ) {
      isFinalizedFilter = false;
    }

    const tallys = await prisma.tally.findMany({
      where: {
        startDate: {
          gte: params.startDate,
          lte: params.endDate,
        },
        isFinalized: isFinalizedFilter,
        tallyProtocolId: params.tallyProtocolId,
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
        tallyProtocolId: true,
        user: {
          select: {
            username: true,
          },
        },
        tallyProtocol: {
          select: {
            name: true,
            form: {
              select: {
                id: true,
              },
            },
            tallyProtocolGroups: {
              orderBy: { position: "asc" },
              select: {
                personCharacteristicGroup: {
                  select: { title: true, isTagGroup: true },
                },
                characteristics: {
                  orderBy: { position: "asc" },
                  select: {
                    personCharacteristic: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
        personObservations: {
          select: {
            quantity: true,
            characteristics: {
              select: { personCharacteristicId: true },
            },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            popularName: true,
            category: { select: { name: true } },
            type: { select: { name: true } },
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

    const tallysByProtocolId = new Map<
      number,
      {
        name: string;
        tallyProtocolGroups: (typeof tallys)[number]["tallyProtocol"]["tallyProtocolGroups"];
        tallys: (typeof tallys)[number][];
      }
    >();

    tallys.forEach((tally) => {
      const tallyGroup = tallysByProtocolId.get(tally.tallyProtocolId);
      if (tallyGroup) {
        tallyGroup.tallys.push(tally);
      } else {
        tallysByProtocolId.set(tally.tallyProtocolId, {
          name: tally.tallyProtocol.name,
          tallyProtocolGroups: tally.tallyProtocol.tallyProtocolGroups,
          tallys: [tally],
        });
      }
    });

    if (tallysByProtocolId.size === 0) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Nenhuma contagem encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Projeto Praças";

    for (const [
      ,
      { name, tallyProtocolGroups, tallys },
    ] of tallysByProtocolId) {
      const worksheet = workbook.addWorksheet(getWorksheetName(name));
      const formId = tallys[0]?.tallyProtocol.form?.id;
      const formCategories =
        formId ?
          (
            await getFormStructure({
              formId,
              publicQuestionsOnly: false,
              includeCalculations: false,
            })
          ).categories
        : [];
      const { exportColumns, percentageColumns } = addTallyMetadataHeader({
        worksheet,
        tallyProtocolGroups,
        assessmentCategories: formCategories,
        assessmentQuestionCount: formCategories.reduce(
          (count, category) =>
            count +
            category.categoryChildren.reduce(
              (childCount, child) =>
                childCount +
                ("questions" in child ? child.questions.length : 1),
              0,
            ),
          0,
        ),
        mainTotalCellFill,
        nonTotalCellFill,
        totalCellFill,
      });
      const assessmentQuestionCount =
        worksheet.actualColumnCount -
        TALLY_EXPORT_META_QUESTIONS.length -
        exportColumns.length -
        percentageColumns.length;
      const firstCountColumn =
        TALLY_EXPORT_META_QUESTIONS.length + assessmentQuestionCount + 1;

      for (const tally of tallys) {
        const { location } = tally;
        const durationInMinutes =
          tally.endDate ?
            Math.round(
              (tally.endDate.getTime() - tally.startDate.getTime()) / 60_000,
            )
          : null;

        const totalPeople = tally.personObservations.reduce(
          (total, observation) => total + observation.quantity,
          0,
        );
        const countValues = exportColumns.map((column) => {
          return tally.personObservations.reduce(
            (total, observation) =>
              (
                column.ids.every((id) =>
                  observation.characteristics.some(
                    (characteristic) =>
                      characteristic.personCharacteristicId === id,
                  ),
                )
              ) ?
                total + observation.quantity
              : total,
            0,
          );
        });
        const percentageValues = percentageColumns.map((column) => {
          const characteristicCount = tally.personObservations.reduce(
            (total, observation) =>
              (
                observation.characteristics.some(
                  (characteristic) =>
                    characteristic.personCharacteristicId ===
                    column.characteristicId,
                )
              ) ?
                total + observation.quantity
              : total,
            0,
          );

          return totalPeople > 0 ? characteristicCount / totalPeople : 0;
        });

        const tallyRow = worksheet.addRow([
          location.id,
          location.name,
          location.popularName,
          location.category?.name,
          location.type?.name,
          location.city.state,
          location.city.name,
          location.firstStreet,
          location.broadAdministrativeUnit?.name,
          tally.id,
          tally.user.username,
          tally.startDate,
          tally.endDate,
          durationInMinutes,
          ...Array<null>(assessmentQuestionCount).fill(null),
          ...countValues,
          ...percentageValues,
        ]);
        tallyRow.getCell(12).numFmt = "dd/mm/yyyy hh:mm";
        tallyRow.getCell(13).numFmt = "dd/mm/yyyy hh:mm";
        exportColumns.forEach((column, index) => {
          if (column.type !== "total") {
            tallyRow.getCell(firstCountColumn + index).fill = nonTotalCellFill;
          } else if (column.label === "TOTAL") {
            tallyRow.getCell(firstCountColumn + index).fill = mainTotalCellFill;
          } else {
            tallyRow.getCell(firstCountColumn + index).fill = totalCellFill;
          }
        });
        percentageValues.forEach((_, index) => {
          const cell = tallyRow.getCell(
            firstCountColumn + exportColumns.length + index,
          );
          cell.numFmt = "0%";
          cell.fill = mainTotalCellFill;
        });

        tallyRow.alignment = { horizontal: "center" };
        tallyRow.getCell(1).alignment = { horizontal: "right" };
        tallyRow.getCell(2).alignment = { horizontal: "left" };

        // Add right border to the last column of each category
        [
          9,
          14,
          ...(assessmentQuestionCount > 0 ? [firstCountColumn - 1] : []),
          ...exportColumns.flatMap((column, index) =>
            column.type === "total" ? [firstCountColumn + index] : [],
          ),
          ...(percentageColumns.length > 0 ?
            [
              firstCountColumn +
                exportColumns.length +
                percentageColumns.length -
                1,
            ]
          : []),
        ].forEach((column) => {
          tallyRow.getCell(column).border = {
            ...tallyRow.getCell(column).border,
            right: {
              style: "medium",
              color: { argb: "000000" },
            },
          };
        });

        if (exportColumns.length > 0) {
          const lastCharacteristicColumn =
            firstCountColumn + exportColumns.length - 1;
          tallyRow.getCell(lastCharacteristicColumn).border = {
            ...tallyRow.getCell(lastCharacteristicColumn).border,
            right: {
              style: "medium",
              color: { argb: "000000" },
            },
          };
        }

        if (formCategories.length > 0 && tally.formSubmissionId) {
          await insertFormSubmissionDataInWorkSheet({
            formSubmissionId: tally.formSubmissionId,
            categories: formCategories,
            workSheet: worksheet,
            startColumn: TALLY_EXPORT_META_QUESTIONS.length + 1,
          });
        }
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
      const lastRow = worksheet.lastRow?.number ?? 0;

      for (let rowNumber = 1; rowNumber <= lastRow; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        row.font = {
          ...row.font,
          size: rowNumber <= 2 ? 11 : 10,
          name: "Calibri",
          bold: rowNumber <= 3,
        };

        if (rowNumber <= 2) {
          row.alignment = {
            ...row.alignment,
            horizontal: "center",
          };
        }
      }

      autoWidthWorksheetColumns(worksheet);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date();
    const fileName = `contagens-${now.toISOString()}.xlsx`;
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
        message: "Erro ao gerar o arquivo de contagens.",
      } as APIResponseInfo,
      data: null,
    };
  }
};
