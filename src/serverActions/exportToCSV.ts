"use server";

import { prisma } from "@/lib/prisma";
import { personType, tallyDataToProcessType } from "@/lib/zodValidators";
import { number, z } from "zod";

const weatherConditionMap = new Map([
  ["SUNNY", "Com sol"],
  ["CLOUDY", "Nublado"],
]);
const locationCategoriesMap = new Map([
  ["FOR_SOCIAL_PRACTICES", "espaços livres públicos de uso coletivo"],
  [
    "OPEN_SPACE_FOR_NON_COLLECTIVE_USE",
    "espaços livres públicos de uso não coletivo",
  ],
]);
const LocationTypesMap = new Map([
  ["CENTRAL_AND_LARGE_FLOWERBEDS", "Cantos de flores"],
  ["COURT_EDGE", "Borda de quadra"],
  ["GARDEN", "Jardim"],
  ["SQUARE", "Praça"],
  ["OVERLOOK", "OVERLOOK"],
  ["PARK", "Parque"],
  ["FENCED_PARK", "FENCED_PARK"],
  ["UNOCCUPIED_PLOT", "UNOCCUPIED_PLOT"],
  [
    "REMNANTS_OF_ROAD_CONSTRUCTION_AND_LAND_DIVISION",
    "REMNANTS_OF_ROAD_CONSTRUCTION_AND_LAND_DIVISION",
  ],
  ["ROUNDABOUTS", "ROUNDABOUTS"],
  ["INTERCHANGE", "INTERCHANGE"],
]);
/*const block1Map = new Map([
  ["location.id", "Identificador"],
  ["location.name","Nome"],
  ["evaluated","Avaliada?"],
  ["location.category","Categorias"],
  ["location.type","Tipo"],
  ["location.notes","Obs"],
  ["location.popularName","Nome popular"],
  ["location.address","Endereço"],
  ["location.creationYear","Ano criação"],
  ["location.lastMaintenanceYear","Ano reforma"],
  ["location.overseeingMayor","Prefeito"],
  ["location.legislation","Legislação"]
])*/
const maxPSize = 1000;
const maxMSize = 1400;
const streetSizes = [
  "streets4mWide",
  "streets6mWide",
  "streets8mWide",
  "streets10mWide",
  "streets20mWide",
];
const genders = ["MALE", "FEMALE"];
const ageGroups = ["ADULT", "ELDERLY", "CHILD", "TEEN"];
const acitvities = ["SEDENTARY", "WALKING", "STRENUOUS"];
const otherPropertiesToCalcualtePercentage = [
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
];
const booleanPersonProperties: (keyof personType)[] = [
  "isPersonWithImpairment",
  "isTraversing",
  "isInApparentIllicitActivity",
  "isPersonWithoutHousing",
];

const exportFullSpreadsheetToCSV = async (locationsIds: number[]) => {
  let block1CSVString =
    "IDENTIFICAÇÃO PRAÇA,,,IDENTIFICAÇÃO,,,,,DADOS HISTÓRICOS,,,,DADOS DE PLANEJAMENTO,,,ÁREA,,POPULAÇÃO E DENSIDADE DO ENTORNO (400m),,,,,INCLIN,MORFOLOGIA,,,,TIPOLOGIA DE VIAS,,,,,,\n";
  block1CSVString +=
    ",,,,,,,,,,,,,,,,,Fonte: http://mapasinterativos.ibge.gov.br/grade/default.html,,,,,,posição na quadra - número de vias,,,,,LARGURA,,,,,\n";
  block1CSVString +=
    "Identificador,Nome da Praça,Avaliada?,Categorias,Tipo,Observações,Nome popular,Endereço,Ano criação,Ano reforma,Prefeito,Legislação,Bairro,Densidade ,Renda,Área útil,Classificação,Homens,Mulheres,Pop Total,Domicílios Ocupados,Densidade,inclinação (%),canto,centro,isolada,dividida,VIAS (número),4m,6m,8m,10m,20m,\n";

  const locations = await prisma.location.findMany({
    where: {
      id: {
        in: locationsIds,
      },
    },
    include: {
      assessment: true,
      address: true,
    },
  });
  block1CSVString += locations
    .map((location) => createBlock1(location))
    .join("\n");
  console.log(block1CSVString);
};
const createBlock1 = (location) => {
  interface StreetsJsonType {
    [key: string]: string;
  }
  let evaluated = "N";
  if (location.assessment) {
    evaluated = "S";
  }
  let addressString = "";
  for (let i = 0; i < location.address.length; i++) {
    if (location.address[i]) {
      addressString += location.address[i].street;
      addressString += ` - ${location.address[i].neighborhood}`;
      if (location.address[i + 1]) addressString += " / ";
    }
  }
  if (location.address[0]) {
    if (location.address[0].city)
      addressString += ` - ${location.address[0].city.name}`;
    if (location.address[0].state)
      addressString += ` - ${location.address[0].state}`;
  }

  let totalStatisticsPeople;
  location.men && location.women ?
    (totalStatisticsPeople = location.men + location.women)
  : location.men ? (totalStatisticsPeople = location.men)
  : location.women ? (totalStatisticsPeople = location.women)
  : (totalStatisticsPeople = 0);

  let totalStreets = 0;
  let streetsJson: StreetsJsonType = {};
  for (const streetSize of streetSizes) {
    if (location[streetSize] !== null) {
      totalStreets += location[streetSize];
      streetsJson[streetSize] = location[streetSize].toString();
    } else {
      streetsJson[streetSize] = "";
    }
  }
  //const block1String = `${location.id},${location.name},${evaluated},${locationCategoriesMap.get(location.category)},${location.type},${location.notes},${location.popularName},${location.address.street}-${location.address.neighborhood}-${location.address.city.name}-${location.address.state},${location.creationYear},${location.lastMaintenanceYear},${location.overseeingMayor},${location.legislation}`;
  const block1String = [
    location.id ? location.id : "",
    location.name ? location.name : "",
    evaluated ? evaluated : "",
    locationCategoriesMap.has(location.category) ?
      locationCategoriesMap.get(location.category)
    : "",
    location.type ? LocationTypesMap.get(location.type) : "",
    location.notes ? location.notes : "",
    location.popularName ? location.popularName : "",
    addressString,
    location.creationYear ? location.creationYear : "",
    location.lastMaintenanceYear ? location.lastMaintenanceYear : "",
    location.overseeingMayor ? location.overseeingMayor : "",
    location.legislation ? location.legislation : "",
    location.address[0] ?
      location.address[0].neighborhood ?
        location.address[0].neighborhood
      : ""
    : "",
    location.householdDensity ? location.householdDensity : "",
    location.income ? location.income : "",
    location.usableArea ? location.usableArea : "",
    location.usableArea ?
      location.usableArea < maxPSize ? "P"
      : location.usableArea < maxMSize ? "M"
      : "G"
    : "",
    location.men ? location.men : "",
    location.women ? location.women : "",
    totalStatisticsPeople,
    location.occupiedHouseholds ? location.occupiedHouseholds : "",
    location.usableArea ?
      (totalStatisticsPeople / location.usableArea) * 100
    : "",
    location.incline ? location.incline : "",
    location.morphology && location.morphology === "CORNER" ? 1 : "",
    location.morphology && location.morphology === "CENTER" ? 1 : "",
    location.morphology && location.morphology === "ISOLATED" ? 1 : "",
    location.morphology && location.morphology === "DIVIDED" ? 1 : "",
    totalStreets,
    streetsJson ? Object.values(streetsJson).join(",") : "",
  ].join(",");
  //console.log(block1String);
  return block1String;
};

const exportAllTallysToCsv = async (locationsIds: number[]) => {
  const locations = await prisma.location.findMany({
    where: {
      id: {
        in: locationsIds,
      },
    },
    select: {
      tally: {
        include: {
          location: {
            select: {
              name: true,
            },
          },
          tallyPerson: {
            select: {
              person: {
                select: {
                  ageGroup: true,
                  gender: true,
                  activity: true,
                  isTraversing: true,
                  isPersonWithImpairment: true,
                  isInApparentIllicitActivity: true,
                  isPersonWithoutHousing: true,
                },
              },
              quantity: true,
            },
          },
        },
      },
    },
  });
  const allTallys = locations
    .map((location) => {
      return location.tally;
    })
    .flat();
  return createExclusiveTallyString(allTallys);
};
const exportTallyToCSV = async (tallysIds: number[]) => {
  const tallys = await prisma.tally.findMany({
    where: {
      id: {
        in: tallysIds,
      },
    },
    include: {
      location: {
        select: {
          name: true,
        },
      },
      tallyPerson: {
        select: {
          person: {
            select: {
              ageGroup: true,
              gender: true,
              activity: true,
              isTraversing: true,
              isPersonWithImpairment: true,
              isInApparentIllicitActivity: true,
              isPersonWithoutHousing: true,
            },
          },
          quantity: true,
        },
      },
    },
  });

  return createExclusiveTallyString(tallys);
};

const createExclusiveTallyString = (tallys: tallyDataToProcessType[]) => {
  tallys = tallys.sort((a, b) => {
    const nameComparison = a.location.name.localeCompare(b.location.name);
    if (nameComparison != 0) {
      return nameComparison;
    } else if (a.locationId != b.locationId) {
      return a.locationId - b.locationId;
    } else {
      return a.startDate.getTime() - b.startDate.getTime();
    }
  });
  let CSVstring =
    "IDENTIFICAÇÃO PRAÇA,,IDENTIFICAÇÃO LEVANTAMENTO,,,,,,,CONTAGEM DE PESSOAS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n";
  CSVstring +=
    ",,,,,,,,,HOMENS,,,,,,,,,,,,,,,,,MULHERES,,,,,,,,,,,,,,,,,,% SEXO,,% IDADE,,,,% ATIVIDADE FÍSICA,,,USUÁRIOS,,,,,,,,\n";
  CSVstring +=
    "Identificador;Nome da Praça;Observador;Dia;Data;Início;Duração;Temperatura;Com sol/Nublado;HA-SED;HA-CAM;HA-VIG;TOT-HA;HI-SED;HI-CAM;HI-VIG;TOT-HI;HC-SED;HC-CAM;HC-VIG;TOT-HC;HJ-SED;HJ-CAM;HJ-VIG;TOT-HJ;TOT-HOMENS;MA-SED;MA-CAM;MA-VIG;TOT-MA;MI-SED;MI-CAM;MI-VIG;TOT-MI;MC-SED;MC-CAM;MC-VIG;TOT-MC;MJ-SED;MJ-CAM;MJ-VIG;TOT-MJ;TOT-M;TOTAL H&M;%HOMENS;%MULHERES;%ADULTO;%IDOSO;%CRIANÇA;%JOVEM;%SEDENTÁRIO;%CAMINHANDO;%VIGOROSO;PCD;Grupos;Pets;Passando;Qtde Atvividades comerciais intinerantes;Atividades Ilícitas;%Ativ Ilic;Pessoas em situação de rua;% Pessoas em situação de rua\n";

  CSVstring += tallys
    .map((tally) => {
      let startDateTime;
      let date;
      let duration;
      const hourFormatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        weekday: "short",
      });
      if (tally.endDate && tally.startDate) {
        startDateTime = hourFormatter.format(tally.startDate);
        date = dateFormatter.format(tally.startDate);
        const durationTimestampMs =
          tally.endDate.getTime() - tally.startDate.getTime();
        const durationHrs = Math.floor(durationTimestampMs / (1000 * 60 * 60));
        const durationMin = Math.floor(
          (durationTimestampMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        duration = `${String(durationHrs).padStart(2, "0")}:${String(durationMin).padStart(2, "0")}`;
      }
      const tallyString = processAndFormatTallyData(tally).tallyString;
      return (
        `${tally.locationId};${tally.location.name};${tally.observer};${date};${startDateTime};${duration};${tally.temperature};${weatherConditionMap.get(tally.weatherCondition)};` +
        tallyString
      );
    })
    .join("\n");
  return CSVstring;
};

const processAndFormatTallyData = (tally: tallyDataToProcessType) => {
  const tallyMap = new Map();
  for (const gender of genders) {
    for (const ageGroup of ageGroups) {
      for (const activity of acitvities) {
        tallyMap.set(`${gender}-${ageGroup}-${activity}`, 0);
      }
      tallyMap.set(`Tot-${gender}-${ageGroup}`, 0);
    }
    tallyMap.set(`Tot-${gender}`, 0);
  }
  tallyMap.set("Tot-H&M", 0);
  tallyMap.set("%MALE", "0.00%");
  tallyMap.set("%FEMALE", "0.00%");
  for (const ageGroup of ageGroups) {
    tallyMap.set(`%${ageGroup}`, "0.00%");
  }
  for (const activity of acitvities) {
    tallyMap.set(`%${activity}`, "0.00%");
  }
  tallyMap.set("isPersonWithImpairment", 0);
  tallyMap.set("Groups", tally.groups); //?? o que é isso?
  tallyMap.set("Pets", tally.animalsAmount);
  tallyMap.set("isTraversing", 0);
  tallyMap.set("Itinerant commercial activities", 0);
  tallyMap.set("isInApparentIllicitActivity", 0);
  tallyMap.set("%isInApparentIllicitActivity", "0.00%");
  tallyMap.set("isPersonWithoutHousing", 0);
  tallyMap.set("%isPersonWithoutHousing", "0.00%");

  tally.tallyPerson.map((tallyPerson) => {
    const key = `${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}-${tallyPerson.person.activity}`;
    tallyMap.set(key, tallyMap.get(key) + tallyPerson.quantity);
    tallyMap.set(
      `Tot-${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}`,
      tallyMap.get(
        `Tot-${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}`,
      ) + tallyPerson.quantity,
    );
    tallyMap.set(
      `Tot-${tallyPerson.person.gender}`,
      tallyMap.get(`Tot-${tallyPerson.person.gender}`) + tallyPerson.quantity,
    );
    tallyMap.set("Tot-H&M", tallyMap.get("Tot-H&M") + tallyPerson.quantity);
    booleanPersonProperties.map((property) => {
      if (tallyPerson.person[property]) {
        tallyMap.set(property, tallyMap.get(property) + tallyPerson.quantity);
      }
    });
  });

  const totalPeople = z.number().parse(tallyMap.get("Tot-H&M"));
  if (totalPeople != 0) {
    for (const gender of genders) {
      tallyMap.set(
        `%${gender}`,
        ((tallyMap.get(`Tot-${gender}`) / totalPeople) * 100).toFixed(2) + "%",
      );
    }
    for (const ageGroup of ageGroups) {
      let totalAgeGroup = 0;
      for (const gender of genders) {
        for (const activity of acitvities) {
          totalAgeGroup += tallyMap.get(`${gender}-${ageGroup}-${activity}`);
        }
      }
      tallyMap.set(
        `%${ageGroup}`,
        ((totalAgeGroup / totalPeople) * 100).toFixed(2) + "%",
      );
    }
    for (const activity of acitvities) {
      let activityTotal = 0;
      for (const gender of genders) {
        for (const ageGroup of ageGroups) {
          activityTotal += tallyMap.get(`${gender}-${ageGroup}-${activity}`);
        }
      }
      tallyMap.set(
        `%${activity}`,
        ((activityTotal / tallyMap.get(`Tot-H&M`)) * 100).toFixed(2) + "%",
      );
    }
    for (const property of otherPropertiesToCalcualtePercentage) {
      tallyMap.set(
        `%${property}`,
        ((tallyMap.get(`${property}`) / totalPeople) * 100).toFixed(2) + "%",
      );
    }
  }

  return {
    tallyString: `${[...tallyMap.values()].join(";")}`,
    totalPeople: totalPeople,
  };
};
export { exportFullSpreadsheetToCSV, exportTallyToCSV, exportAllTallysToCsv };
