import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import type { CategoryItem } from "@/lib/types/forms/formStructure";
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

type TallyProtocolGroupForExport = {
  personCharacteristicGroup: { title: string; isTagGroup: boolean };
  characteristics: {
    personCharacteristic: { id: number; name: string };
  }[];
};

type TallyExportColumn =
  | { type: "combination"; ids: number[]; names: string[] }
  | {
      type: "total";
      ids: number[];
      label: string;
      mainCharacteristicId: number;
    };

type TallyExportPercentageColumn = {
  groupIndex: number;
  characteristicId: number;
  characteristicName: string;
};

const nonTotalCellFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFF2CB" },
};

const totalCellFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFE598" },
};

const mainTotalCellFill: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFD965" },
};

export const fetchTallysExport = async (
  request: APIRequestParams<FetchTallysExportParams>,
) => {
  const params = request.params!;
  const metaCategories = [
    {
      name: "IDENTIFICAÇÃO DA PRAÇA",
      startColumn: 1,
      endColumn: 9,
    },
    {
      name: "IDENTIFICAÇÃO DO LEVANTAMENTO",
      startColumn: 10,
      endColumn: 14,
    },
  ];
  const metaSubcategories = [
    {
      name: "Endereço",
      startColumn: 6,
      endColumn: 9,
    },
  ];
  const metaQuestions = [
    "Identificador da praça",
    "Nome da praça",
    "Nome popular",
    "Categoria",
    "Tipo",
    "Estado",
    "Cidade",
    "Rua 1",
    "Região administrativa ampla",
    "Identificador da contagem",
    "Observador",
    "Data/hora inicial",
    "Data/hora final",
    "Duração (minutos)",
  ];

  const addTallyMetadataHeader = ({
    worksheet,
    tallyProtocolGroups,
    assessmentCategories,
    assessmentQuestionCount,
  }: {
    worksheet: ExcelJS.Worksheet;
    tallyProtocolGroups: TallyProtocolGroupForExport[];
    assessmentCategories: CategoryItem[];
    assessmentQuestionCount: number;
  }) => {
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
    });

    const groupsWithCharacteristics = tallyProtocolGroups.filter(
      (group) => group.characteristics.length > 0,
    );
    const sexGroup = groupsWithCharacteristics.find((group) => {
      const characteristicNames = group.characteristics.map(
        ({ personCharacteristic }) =>
          personCharacteristic.name.trim().toLowerCase(),
      );
      return (
        characteristicNames.includes("homem") &&
        characteristicNames.includes("mulher")
      );
    });
    const secondaryGroups = groupsWithCharacteristics.filter(
      (group) => group !== sexGroup,
    );
    const exportColumns: TallyExportColumn[] = [];

    if (!sexGroup) {
      const combinations = groupsWithCharacteristics.reduce(
        (currentCombinations, group) =>
          currentCombinations.flatMap((combination) =>
            group.characteristics.map(
              ({ personCharacteristic: characteristic }) => ({
                ids: [...combination.ids, characteristic.id],
                names: [...combination.names, characteristic.name],
              }),
            ),
          ),
        [{ ids: [], names: [] }] as { ids: number[]; names: string[] }[],
      );

      combinations.forEach((combination) => {
        exportColumns.push({
          type: "combination",
          ids: combination.ids,
          names: combination.names,
        });
      });
    }

    sexGroup?.characteristics.forEach(({ personCharacteristic }) => {
      const mainName = personCharacteristic.name.trim().toLowerCase();
      if (mainName !== "homem" && mainName !== "mulher") return;

      const combinations = secondaryGroups.reduce(
        (currentCombinations, group) =>
          currentCombinations.flatMap((combination) =>
            group.characteristics.map(
              ({ personCharacteristic: secondary }) => ({
                ids: [...combination.ids, secondary.id],
                names: [...combination.names, secondary.name],
              }),
            ),
          ),
        [{ ids: [], names: [] }] as { ids: number[]; names: string[] }[],
      );

      const primarySecondaryGroup = secondaryGroups[0];
      const remainingSecondaryGroups = secondaryGroups.slice(1);

      primarySecondaryGroup?.characteristics.forEach(
        ({ personCharacteristic: primary }) => {
          combinations
            .filter((combination) => combination.ids.includes(primary.id))
            .forEach((combination) => {
              exportColumns.push({
                type: "combination",
                ids: [personCharacteristic.id, ...combination.ids],
                names: combination.names,
              });
            });

          exportColumns.push({
            type: "total",
            ids: [personCharacteristic.id, primary.id],
            label: `TOTAL ${primary.name}`,
            mainCharacteristicId: personCharacteristic.id,
          });
        },
      );

      remainingSecondaryGroups.forEach((group) => {
        group.characteristics.forEach(({ personCharacteristic: secondary }) => {
          combinations
            .filter((combination) => combination.ids.includes(secondary.id))
            .forEach((combination) => {
              if (
                exportColumns.some(
                  (column) =>
                    column.type === "combination" &&
                    column.ids.length === combination.ids.length + 1 &&
                    column.ids[0] === personCharacteristic.id &&
                    column.ids
                      .slice(1)
                      .every((id) => combination.ids.includes(id)),
                )
              ) {
                return;
              }

              exportColumns.push({
                type: "combination",
                ids: [personCharacteristic.id, ...combination.ids],
                names: combination.names,
              });
            });
          exportColumns.push({
            type: "total",
            ids: [personCharacteristic.id, secondary.id],
            label: `TOTAL ${secondary.name}`,
            mainCharacteristicId: personCharacteristic.id,
          });
        });
      });
      exportColumns.push({
        type: "total",
        ids: [personCharacteristic.id],
        label: "TOTAL",
        mainCharacteristicId: personCharacteristic.id,
      });
    });

    const characteristicCount = exportColumns.length;
    const percentageGroups = groupsWithCharacteristics.filter(
      (group) => !group.personCharacteristicGroup.isTagGroup,
    );
    const percentageColumns: TallyExportPercentageColumn[] =
      percentageGroups.flatMap((group) =>
        group.characteristics.map(({ personCharacteristic }) => ({
          groupIndex: percentageGroups.indexOf(group),
          characteristicId: personCharacteristic.id,
          characteristicName: personCharacteristic.name,
        })),
      );
    const percentageCount = percentageColumns.length;

    metaSubcategories.forEach(({ name, startColumn, endColumn }) => {
      worksheet.mergeCells(2, startColumn, 2, endColumn);
      const cell = worksheet.getCell(2, startColumn);
      cell.value = name;
    });

    worksheet.addRow(metaQuestions);
    if (assessmentQuestionCount > 0) {
      insertFormHeaderInWorkSheet({
        categories: assessmentCategories,
        workSheet: worksheet,
      });
    }

    const firstCountColumn = metaQuestions.length + assessmentQuestionCount + 1;
    if (characteristicCount > 0) {
      worksheet.mergeCells(
        1,
        firstCountColumn,
        1,
        firstCountColumn + characteristicCount - 1,
      );
      worksheet.getCell(1, firstCountColumn).value = "CONTAGEM";
    }
    if (percentageCount > 0) {
      const firstPercentageColumn = firstCountColumn + characteristicCount;
      worksheet.mergeCells(
        1,
        firstPercentageColumn,
        1,
        firstPercentageColumn + percentageCount - 1,
      );
      worksheet.getCell(1, firstPercentageColumn).value = "PORCENTAGEM";
    }

    if (characteristicCount > 0) {
      const firstCharacteristicColumn = firstCountColumn;
      if (!sexGroup) {
        worksheet.mergeCells(
          2,
          firstCharacteristicColumn,
          2,
          firstCharacteristicColumn + characteristicCount - 1,
        );
        worksheet.getCell(2, firstCharacteristicColumn).value =
          groupsWithCharacteristics
            .map((group) => group.personCharacteristicGroup.title)
            .join(" + ");
        exportColumns.forEach((column, index) => {
          const cell = worksheet.getCell(3, firstCharacteristicColumn + index);
          cell.value =
            column.type === "total" ? column.label : column.names.join(" + ");
          if (column.type !== "total") {
            cell.fill = nonTotalCellFill;
          } else if (column.label === "TOTAL") {
            cell.fill = mainTotalCellFill;
          } else {
            cell.fill = totalCellFill;
          }
        });
      } else {
        let currentColumn = firstCharacteristicColumn;
        sexGroup.characteristics.forEach(({ personCharacteristic }) => {
          const mainName = personCharacteristic.name.trim().toLowerCase();
          if (mainName !== "homem" && mainName !== "mulher") return;

          const blockColumns = exportColumns.filter(
            (column) =>
              (column.type === "combination" &&
                column.ids[0] === personCharacteristic.id) ||
              (column.type === "total" &&
                column.mainCharacteristicId === personCharacteristic.id),
          );
          worksheet.mergeCells(
            2,
            currentColumn,
            2,
            currentColumn + blockColumns.length - 1,
          );
          worksheet.getCell(2, currentColumn).value = personCharacteristic.name;

          blockColumns.forEach((column) => {
            const cell = worksheet.getCell(3, currentColumn);
            cell.value =
              column.type === "total" ? column.label : column.names.join(" + ");
            if (column.type !== "total") {
              cell.fill = nonTotalCellFill;
            } else if (column.label === "TOTAL") {
              cell.fill = mainTotalCellFill;
            } else {
              cell.fill = totalCellFill;
            }
            currentColumn += 1;
          });
        });
      }
    }

    const firstPercentageColumn = firstCountColumn + characteristicCount;
    let currentPercentageColumn = firstPercentageColumn;
    percentageGroups.forEach((group, groupIndex) => {
      const groupColumns = percentageColumns.filter(
        (column) => column.groupIndex === groupIndex,
      );
      if (groupColumns.length === 0) return;

      worksheet.mergeCells(
        2,
        currentPercentageColumn,
        2,
        currentPercentageColumn + groupColumns.length - 1,
      );
      worksheet.getCell(2, currentPercentageColumn).value =
        group.personCharacteristicGroup.title;

      groupColumns.forEach((column) => {
        const cell = worksheet.getCell(3, currentPercentageColumn);
        cell.value = `% ${column.characteristicName}`;
        cell.fill = mainTotalCellFill;
        currentPercentageColumn += 1;
      });
    });

    // Add right border to the last column of each category in the first three rows
    const categoryBoundaryColumns = [
      9,
      14,
      ...(assessmentQuestionCount > 0
        ? [firstCountColumn - 1]
      : []),
      ...exportColumns.flatMap((column, index) =>
        column.type === "total" ? [firstCountColumn + index] : [],
      ),
      ...(characteristicCount > 0 ?
        [firstCountColumn + characteristicCount - 1]
      : []),
      ...(percentageCount > 0 ?
        [firstCountColumn + characteristicCount + percentageCount - 1]
      : []),
    ];
    for (let rowNumber = 1; rowNumber <= 3; rowNumber += 1) {
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

    return { exportColumns, percentageColumns };
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
      });
      const assessmentQuestionCount =
        worksheet.actualColumnCount -
        metaQuestions.length -
        exportColumns.length -
        percentageColumns.length;
      const firstCountColumn =
        metaQuestions.length + assessmentQuestionCount + 1;

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
          ...(assessmentQuestionCount > 0
            ? [firstCountColumn - 1]
          : []),
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
            startColumn: metaQuestions.length + 1,
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
