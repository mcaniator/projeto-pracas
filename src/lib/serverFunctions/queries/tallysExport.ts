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

export const fetchTallysExport = async (
  request: APIRequestParams<FetchTallysExportParams>,
) => {
  const params = request.params!;
  const metaCategories = [
    {
      name: "Identificação da praça",
      startColumn: 1,
      endColumn: 9,
    },
    {
      name: "Identificação da levantamento",
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
    const characteristicCombinations = groupsWithCharacteristics.reduce(
      (combinations, group) =>
        combinations.flatMap((combination) =>
          group.characteristics.map(({ personCharacteristic }) => ({
            ids: [...combination.ids, personCharacteristic.id],
            names: [...combination.names, personCharacteristic.name],
          })),
        ),
      [{ ids: [], names: [] }] as { ids: number[]; names: string[] }[],
    );
    const characteristicCount = characteristicCombinations.length;

    if (characteristicCount > 0) {
      worksheet.mergeCells(
        1,
        metaQuestions.length + 1,
        1,
        metaQuestions.length + characteristicCount,
      );
      worksheet.getCell(1, metaQuestions.length + 1).value =
        "Contagem de pessoas";
    }

    metaSubcategories.forEach(({ name, startColumn, endColumn }) => {
      worksheet.mergeCells(2, startColumn, 2, endColumn);
      const cell = worksheet.getCell(2, startColumn);
      cell.value = name;
    });

    worksheet.addRow(metaQuestions);

    if (characteristicCount > 0) {
      const firstCharacteristicColumn = metaQuestions.length + 1;
      const lastCharacteristicColumn =
        firstCharacteristicColumn + characteristicCount - 1;
      worksheet.mergeCells(
        2,
        firstCharacteristicColumn,
        2,
        lastCharacteristicColumn,
      );
      worksheet.getCell(2, firstCharacteristicColumn).value =
        groupsWithCharacteristics
          .map((group) => group.personCharacteristicGroup.title)
          .join(" + ");

      characteristicCombinations.forEach((combination, index) => {
        worksheet.getCell(3, firstCharacteristicColumn + index).value =
          combination.names.join(" + ");
      });
    }

    return characteristicCombinations;
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
      const characteristicCombinations = addTallyMetadataHeader({
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
          ...characteristicCombinations.map(({ ids }) =>
            tally.personObservations.reduce(
              (total, observation) =>
                (
                  ids.every((id) =>
                    observation.characteristics.some(
                      (characteristic) =>
                        characteristic.personCharacteristicId === id,
                    ),
                  )
                ) ?
                  total + observation.quantity
                : total,
              0,
            ),
          ),
        ]);
        tallyRow.getCell(12).numFmt = "dd/mm/yyyy hh:mm";
        tallyRow.getCell(13).numFmt = "dd/mm/yyyy hh:mm";

        tallyRow.alignment = { horizontal: "center" };
        tallyRow.getCell(1).alignment = { horizontal: "right" };
        tallyRow.getCell(2).alignment = { horizontal: "left" };
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
