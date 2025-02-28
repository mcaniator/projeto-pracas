type BrazilianUFs =
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO";

const stateToFederativeUnitMap = new Map<string, string>([
  ["Acre", "AC"],
  ["Alagoas", "AL"],
  ["Amapá", "AP"],
  ["Amazonas", "AM"],
  ["Bahia", "BA"],
  ["Ceará", "CE"],
  ["Distrito Federal", "DF"],
  ["Espirito Santo", "ES"],
  ["Goiás", "GO"],
  ["Maranhão", "MA"],
  ["Mato Grosso", "MT"],
  ["Mato Grosso do Sul", "MS"],
  ["Minas Gerais", "MG"],
  ["Pará", "PA"],
  ["Paraíba", "PB"],
  ["Paraná", "PR"],
  ["Pernambuco", "PE"],
  ["Piauí", "PI"],
  ["Rio de Janeiro", "RJ"],
  ["Rio Grande do Norte", "RN"],
  ["Rio Grande do Sul", "RS"],
  ["Rondônia", "RO"],
  ["Roraima", "RR"],
  ["Santa Catarina", "SC"],
  ["São Paulo", "SP"],
  ["Sergipe", "SE"],
  ["Tocantins", "TO"],
]);

const ufToStateMap = new Map<string, string>();

stateToFederativeUnitMap.forEach((uf, state) => {
  ufToStateMap.set(uf, state);
});

export { stateToFederativeUnitMap, ufToStateMap };
export type { BrazilianUFs };
