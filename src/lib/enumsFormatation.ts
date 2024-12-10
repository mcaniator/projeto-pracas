const calculationTypesFormatter = new Map([
  ["AVERAGE", "Média"],
  ["PERCENTAGE", "Porcentagem"],
  ["SUM", "Soma"],
]);

const questionGeometryTypesFormatter = new Map([
  ["POINT", "Ponto"],
  ["POLYGON", "Polígono"],
]);

const questionTypesFormatter = new Map([
  ["WRITTEN", "Discursiva"],
  ["OPTIONS", "Optativa"],
]);

const questionResponseCharacterTypesFormatter = new Map([
  ["TEXT", "Texto"],
  ["NUMBER", "Número"],
]);

const questionOptionTypesFormatter = new Map([
  ["RADIO", "Botão radial"],
  ["CHECKBOX", "Caixa de checagem"],
]);

export {
  calculationTypesFormatter,
  questionGeometryTypesFormatter,
  questionTypesFormatter,
  questionResponseCharacterTypesFormatter,
  questionOptionTypesFormatter,
};
