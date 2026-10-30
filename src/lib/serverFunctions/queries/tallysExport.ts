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
  personCharacteristicGroup: { title: string };
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
  }: {
    worksheet: ExcelJS.Worksheet;
    tallyProtocolGroups: TallyProtocolGroupForExport[];
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

    if (characteristicCount > 0) {
      worksheet.mergeCells(
        1,
        metaQuestions.length + 1,
        1,
        metaQuestions.length + characteristicCount,
      );
      worksheet.getCell(1, metaQuestions.length + 1).value =
        "CONTAGEM DE PESSOAS";
    }

    metaSubcategories.forEach(({ name, startColumn, endColumn }) => {
      worksheet.mergeCells(2, startColumn, 2, endColumn);
      const cell = worksheet.getCell(2, startColumn);
      cell.value = name;
    });

    worksheet.addRow(metaQuestions);

    if (characteristicCount > 0) {
      const firstCharacteristicColumn = metaQuestions.length + 1;
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
          worksheet.getCell(3, firstCharacteristicColumn + index).value =
            column.type === "total" ? column.label : column.names.join(" + ");
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
            worksheet.getCell(3, currentColumn).value =
              column.type === "total" ? column.label : column.names.join(" + ");
            currentColumn += 1;
          });
        });
      }
    }

    // Add right border to the last column of each category in the first three rows
    const categoryBoundaryColumns = [
      9,
      14,
      ...exportColumns.flatMap((column, index) =>
        column.type === "total" ? [metaQuestions.length + index + 1] : [],
      ),
      ...(characteristicCount > 0 ?
        [metaQuestions.length + characteristicCount]
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

    return exportColumns;
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
            tallyProtocolGroups: {
              orderBy: { position: "asc" },
              select: {
                personCharacteristicGroup: {
                  select: { title: true },
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
      const exportColumns = addTallyMetadataHeader({
        worksheet,
        tallyProtocolGroups,
      });

      for (const tally of tallys) {
        const { location } = tally;
        const durationInMinutes =
          tally.endDate ?
            Math.round(
              (tally.endDate.getTime() - tally.startDate.getTime()) / 60_000,
            )
          : null;

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
          ...exportColumns.map((column) => {
            if (column.type === "total") {
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
            }

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
          }),
        ]);
        tallyRow.getCell(12).numFmt = "dd/mm/yyyy hh:mm";
        tallyRow.getCell(13).numFmt = "dd/mm/yyyy hh:mm";

        tallyRow.alignment = { horizontal: "center" };
        tallyRow.getCell(1).alignment = { horizontal: "right" };
        tallyRow.getCell(2).alignment = { horizontal: "left" };

        // Add right border to the last column of each category
        [
          9,
          14,
          ...exportColumns.flatMap((column, index) =>
            column.type === "total" ? [metaQuestions.length + index + 1] : [],
          ),
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
            metaQuestions.length + exportColumns.length;
          tallyRow.getCell(lastCharacteristicColumn).border = {
            ...tallyRow.getCell(lastCharacteristicColumn).border,
            right: {
              style: "medium",
              color: { argb: "000000" },
            },
          };
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
