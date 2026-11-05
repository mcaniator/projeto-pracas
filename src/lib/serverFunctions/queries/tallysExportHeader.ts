import type { CategoryItem } from "@/lib/types/forms/formStructure";
import ExcelJS from "exceljs";

import { insertFormHeaderInWorkSheet } from "./formSubmissionExport";

export type TallyProtocolGroupForExport = {
  personCharacteristicGroup: { title: string; isTagGroup: boolean };
  characteristics: {
    personCharacteristic: { id: number; name: string };
  }[];
};

export type TallyExportColumn =
  | { type: "combination"; ids: number[]; names: string[] }
  | {
      type: "total";
      ids: number[];
      label: string;
      mainCharacteristicId: number;
    };

export type TallyExportPercentageColumn = {
  groupIndex: number;
  characteristicId: number;
  characteristicName: string;
};

export const TALLY_EXPORT_META_QUESTIONS = [
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
] as const;


export const addTallyMetadataHeader = ({
  worksheet,
  tallyProtocolGroups,
  assessmentCategories,
  assessmentQuestionCount,
  mainTotalCellFill,
  nonTotalCellFill,
  totalCellFill,
}: {
  worksheet: ExcelJS.Worksheet;
  tallyProtocolGroups: TallyProtocolGroupForExport[];
  assessmentCategories: CategoryItem[];
  assessmentQuestionCount: number;
  mainTotalCellFill: ExcelJS.Fill;
  nonTotalCellFill: ExcelJS.Fill;
  totalCellFill: ExcelJS.Fill;
}) => {
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
          group.characteristics.map(({ personCharacteristic: secondary }) => ({
            ids: [...combination.ids, secondary.id],
            names: [...combination.names, secondary.name],
          })),
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

  worksheet.addRow(TALLY_EXPORT_META_QUESTIONS);
  if (assessmentQuestionCount > 0) {
    insertFormHeaderInWorkSheet({
      categories: assessmentCategories,
      workSheet: worksheet,
    });
  }

  const firstCountColumn =
    TALLY_EXPORT_META_QUESTIONS.length + assessmentQuestionCount + 1;
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

  const categoryBoundaryColumns = [
    9,
    14,
    ...(assessmentQuestionCount > 0 ? [firstCountColumn - 1] : []),
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
