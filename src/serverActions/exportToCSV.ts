"use server";

import { prisma } from "@/lib/prisma";
import {
  SortOrderType,
  personType,
  tallyDataToProcessType,
} from "@/lib/zodValidators";
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

const exportFullSpreadsheetToCSV = async (
  locationsIds: number[],
  tallysIds: number[],
  assessmentsIds: number[],
  sortCriteriaOrder: SortOrderType,
) => {
  const classifications = await prisma.classification.findMany({
    include: {
      childs: {
        include: {
          questions: true,
          answers: true,
        },
      },
      parent: true,
      questions: true,
      answers: true,
    },
  });
  classifications.sort((a, b) => a.id - b.id);

  let locations = await prisma.location.findMany({
    where: {
      id: {
        in: locationsIds,
      },
    },
    include: {
      assessments: {
        where: {
          id: {
            in: assessmentsIds,
          },
        },
        select: {
          id: true,
          form: {
            select: {
              classifications: {
                select: {
                  id: true,
                  parentId: true,
                  parent: true,
                  childs: {
                    select: {
                      id: true,
                      name: true,
                      questions: {
                        select: {
                          id: true,
                          name: true,
                          answers: {
                            select: {
                              id: true,
                              content: true,
                              assessmentId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  questions: {
                    select: {
                      id: true,
                      name: true,
                      answers: {
                        select: {
                          content: true,
                          assessmentId: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
      address: {
        include: {
          city: {
            select: {
              name: true,
            },
          },
        },
      },
      tallys: {
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
      },
    },
  });

  locations = locations.sort((a, b) => {
    for (const criteria of sortCriteriaOrder) {
      switch (criteria) {
        case "name":
          return a.name.localeCompare(b.name);
          break;
        case "id":
          return a.id - b.id;
          break;
        case "date":
          return a.createdAt.getTime() - b.createdAt.getTime();
          break;
        default:
          return 0;
      }
    }
    return 0;
  });

  let block1CSVString =
    "IDENTIFICAÇÃO PRAÇA,,,,,,,,IDENTIFICAÇÃO LEVANTAMENTO,,,,DADOS HISTÓRICOS,,,,DADOS ADMINISTRATIVOS,,,,ÁREA,,POPULAÇÃO E DENSIDADE DO ENTORNO (400m),,,,,INCLIN,SOMBRA,MORFOLOGIA,,,,TIPOLOGIA DE VIAS,,,,,\n";
  block1CSVString +=
    ",,,,,,,,,,,,,,,,,,,,,,Fonte: http://mapasinterativos.ibge.gov.br/grade/default.html,,,,,,,posição na quadra - número de vias,,,,,LARGURA,,,,\n";
  block1CSVString +=
    "Identificador,Avaliada?,Nome da Praça,Nome popular,Categoria,Tipo,Observações,Endereço,Observador(es),Data ,Início,Duração,Ano criação,Ano reforma,Prefeito,Legislação,Distrito/Regiã,Subdistrito/Bairro,Densidade ,Renda,Área útil,Classificação,Homens,Mulheres,Pop Total,Domicílios Ocupados,Densidade,% inclinação,% área de sombra,canto,centro,isolada,dividida?,VIAS (número),4m,6m,8m,10m,20m\n";

  block1CSVString += locations
    .map((location) => {
      interface StreetsJsonType {
        [key: string]: string;
      }
      let evaluated = "N";
      if (location.assessments.length > 0) {
        evaluated = "S";
      }
      let addressString = "";
      location.address.sort((a, b) => {
        if (a.neighborhood < b.neighborhood) {
          return -1;
        }
        if (a.neighborhood > b.neighborhood) {
          return 1;
        }
        return 0;
      });
      for (let i = 0; i < location.address.length; i++) {
        if (location.address[i]) {
          addressString += location.address[i]?.street;
          if (
            location.address[i + 1]?.neighborhood !==
            location.address[i]?.neighborhood
          )
            addressString += ` - ${location.address[i]?.neighborhood}`;
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
      const streetsJson: StreetsJsonType = {};
      for (const streetSize of streetSizes) {
        const streetsWithSizeValue =
          location[streetSize as keyof typeof location];
        if (typeof streetsWithSizeValue === "number") {
          totalStreets += streetsWithSizeValue;
          streetsJson[streetSize] = streetsWithSizeValue.toString();
        } else {
          streetsJson[streetSize] = "";
        }
      }
      let locationCategory = "";
      if (location.category) {
        locationCategory = location.category;
      }
      let observers = "";
      const observersArray: string[] = [];

      observers = location.tallys
        .map((tally) => {
          if (!observersArray.includes(tally.observer)) {
            observersArray.push(tally.observer);
            return tally.observer;
          }
        })
        .join(" / ");
      if (observersArray.length === 1)
        observers = observers.trim().replace(/\/\s*$/, "");

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
      });
      if (location.tallys[0]?.endDate && location.tallys[0].startDate) {
        startDateTime = hourFormatter.format(location.tallys[0].startDate);
        date = dateFormatter.format(location.tallys[0].startDate);
        const durationTimestampMs =
          location.tallys[0].endDate.getTime() -
          location.tallys[0].startDate.getTime();
        const durationHrs = Math.floor(durationTimestampMs / (1000 * 60 * 60));
        const durationMin = Math.floor(
          (durationTimestampMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        duration = `${String(durationHrs).padStart(2, "0")}:${String(durationMin).padStart(2, "0")}`;
      }

      const block1String = [
        location.id ? location.id : "",
        evaluated ? evaluated : "",
        location.name ? location.name : "",
        location.popularName ? location.popularName : "",
        locationCategoriesMap.has(locationCategory) ?
          locationCategoriesMap.get(locationCategory)
        : "",
        location.type ? LocationTypesMap.get(location.type) : "",
        location.notes ? location.notes : "",
        addressString,
        observers,
        date ? date : "",
        startDateTime ? startDateTime : "",
        duration ? duration : "",
        location.creationYear ? location.creationYear : "",
        location.lastMaintenanceYear ? location.lastMaintenanceYear : "",
        location.overseeingMayor ? location.overseeingMayor : "",
        location.legislation ? location.legislation : "",
        location.broadAdministrativeUnit?.name ?
          location.broadAdministrativeUnit.name
        : "",
        location.intermediateAdministrativeUnit?.name ?
          location.intermediateAdministrativeUnit?.name
        : "",
        "???",
        location.income ? location.income : "",
        location.usableArea ? location.usableArea : "",
        location.usableArea ?
          location.usableArea < maxPSize ? "P"
          : location.usableArea < maxMSize ? "M"
          : "G"
        : "",
        location.men ? location.men : "",
        location.women ? location.women : "",
        totalStatisticsPeople ? totalStatisticsPeople : "",
        location.occupiedHouseholds ? location.occupiedHouseholds : "",
        location.usableArea ?
          ((totalStatisticsPeople / location.usableArea) * 100).toFixed(2)
        : "",
        location.incline ? location.incline + "%" : "",
        location.shadowArea ? location.shadowArea + "%" : "",
        location.morphology && location.morphology === "CORNER" ? 1 : "",
        location.morphology && location.morphology === "CENTER" ? 1 : "",
        location.morphology && location.morphology === "ISOLATED" ? 1 : "",
        location.morphology && location.morphology === "DIVIDED" ? 1 : "",
        totalStreets ? totalStreets : "",
        streetsJson ? Object.values(streetsJson).join(",") : "",
      ].join(",");

      return block1String;
    })
    .join("\n");
  //locations.map((location) => console.log(location));

  let block2CSVString =
    "CONTAGEM DE PESSOAS DIAS DE SEMANA + FINAIS DE SEMANA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n";
  block2CSVString +=
    "HOMENS,,,,,,,,,,,,,,,,,MULHERES,,,,,,,,,,,,,,,,,,% SEXO,,% IDADE,,,,% ATIVIDADE FÍSICA,,,USUÁRIOS,,,,,,,,,DENSIDADE\n";
  block2CSVString +=
    "HA-SED,HA-CAM,HA-VIG,TOT-HA,HI-SED,HI-CAM,HI-VIG,TOT-HI,HC-SED,HC-CAM,HC-VIG,TOT-HC,HJ-SED,HJ-CAM,HJ-VIG,TOT-HJ,TOT-HOMENS,MA-SED,MA-CAM,MA-VIG,TOT-MA,MI-S,MI-C,MI-V,TOT-MI,MC-S,MC-C,MC-V,TOT-MC,MJ-S,MJ-C,MJ-V,TOT-MJ,TOT-M,TOTAL H&M,%HOMENS,%MULHERES,%ADULTO,%IDOSO,%CRIANÇA,%JOVEM,%SEDENTÁRIO,%CAMINHANDO,%VIGOROSO,PCD,Grupos,Pets,Passando,Atvidades comerciais intinerantes (Qtde),Atividades Ilícitas,%Ativ Ilic,Pessoas em situação de rua,%Pessoas em situação de rua,DENSIDADE\n";

  let includeTallys = false;
  block2CSVString += `${locations
    .map((location) => {
      let locationLines = "";
      if (location.tallys.length > 0) includeTallys = true;

      locationLines += `${createBlock2Line(location)}`;

      return locationLines;
    })
    .join("\n")}`;

  const classificationsAdded: number[] = [];
  let block3CSVString = "";
  const block3Array: string[][] = []; // -> [[LINE, LINE, ...],[LINE, LINE,...]] each array is an classification's content

  classifications.map((classification) => {
    const linesWithoutAnswers: number[] = [];
    let lineIndex = 3;
    if (classification.childs.length === 0 && !classification.parent) {
      //Here classifications without subclassifications are processed
      block3Array.push(["", "", ""]); //Adds header lines for this classification
      if (classification.questions) {
        locations.map((location) => {
          location.assessments.map((assessment) => {
            if (assessment.form?.classifications) {
              block3Array[block3Array.length - 1]?.push(""); //Adds an answers line for this assessment, even if the classification hasn't been found yet
              if (!classificationsAdded.includes(classification.id)) {
                //Here the header will be created (if this classification is found)
                for (const formClassification of assessment.form
                  ?.classifications) {
                  if (formClassification.id === classification.id) {
                    classificationsAdded.push(classification.id);
                    let addedFirstQuestion = false;
                    block3Array[block3Array.length - 1][0] =
                      `,${classification.name}`; //Adds classification name to the header
                    block3Array[block3Array.length - 1][1] = `,`; //Adds a comma to the subclassification line (this classification doesn't have a classification)
                    for (const question of classification.questions) {
                      if (addedFirstQuestion)
                        block3Array[block3Array.length - 1][0] += ","; //Adds commas to make the classification line have the same ammount of collums as it's answers
                      if (addedFirstQuestion)
                        block3Array[block3Array.length - 1][1] += ","; //Adds commas to make the subclassification line have the same ammount of collums as it's answers
                      block3Array[block3Array.length - 1][2] +=
                        `,${question.name}`; //Adds question name to the header
                      addedFirstQuestion = true;
                    }
                    break;
                  }
                }
              }

              if (classificationsAdded.includes(classification.id)) {
                //Will only enter this block if this classification has already been found within assessments
                let classificationAddedPreviouslyFound = false;
                for (const formClassification of assessment.form
                  ?.classifications) {
                  if (formClassification.id === classification.id) {
                    classificationAddedPreviouslyFound = true;
                    for (const question of formClassification.questions) {
                      let answerFound = false;
                      for (const answer of question.answers) {
                        if (answer.assessmentId === assessment.id) {
                          block3Array[block3Array.length - 1][
                            block3Array[block3Array.length - 1]?.length - 1
                          ] += `,${answer.content}`; //Adds answer content to the last line of the current classification array
                          answerFound = true;
                        }
                      }
                      if (!answerFound)
                        block3Array[block3Array.length - 1][
                          block3Array[block3Array.length - 1]?.length - 1
                        ] += `,`; //Adds an empty collumn if the answer wasn't found
                    }
                  }
                }
                if (!classificationAddedPreviouslyFound) {
                  for (let i = 0; i < classification.questions.length; i++) {
                    block3Array[block3Array.length - 1][
                      block3Array[block3Array.length - 1]?.length - 1
                    ] += `,`; //If the classification was found previously, but it isn't present in this assessment, commas will be added to fill the answers collumns
                  }
                }
              } else {
                linesWithoutAnswers.push(lineIndex); //If the classification hasn't been found yet, this line's index is stored to add commas to it in case the classification is found
              }
            }

            lineIndex++;
          });
        });
        if (classificationsAdded.includes(classification.id)) {
          //Here empty collumns will be added to assessments whitch were processed before the classification was found
          for (const line of linesWithoutAnswers) {
            for (let i = 0; i < classification.questions.length; i++) {
              block3Array[block3Array.length - 1][line] += ",";
            }
          }
        }
      }
    } else if (!classification.parent && classification.childs.length > 0) {
      const subclassificationsAdded: number[] = [];
      block3Array.push(["", "", ""]); //Adds space to the header
      for (let i = 0; i < locations.length; i++) {
        for (let j = 0; j < locations[i]?.assessments.length; j++) {
          block3Array[block3Array.length - 1]?.push(""); //Adds space to each assessment's answers
        }
      }
      locations.map((location) => {
        location.assessments.map((assessment) => {
          assessment.form?.classifications.map((formClassification) => {
            if (
              !classificationsAdded.includes(classification.id) &&
              formClassification.id === classification.id
            ) {
              //Process the classification
              block3Array[block3Array.length - 1][0] +=
                `;${classification.name}`; //Adds classification name to the header
              classificationsAdded.push(classification.id);
            }
            if (
              classificationsAdded.includes(classification.id) &&
              !subclassificationsAdded.includes(formClassification.id)
            ) {
              for (const child of classification.childs) {
                if (child.id === formClassification.id) {
                  subclassificationsAdded.push(child.id);
                }
              }
            }
          });
        });
      }); //Here all the subclassifications IDs that need to be added will be stored in subclassificationAdded
      subclassificationsAdded.sort((a, b) => a - b);
      //console.log(subclassificationsAdded);
      let addSubclassificationComma = false;
      for (const subclassificationAdded of subclassificationsAdded) {
        for (const child of classification.childs) {
          if (subclassificationAdded === child.id) {
            //Adds this subclassification's related content to the array

            let addedFirstQuestion = false;
            block3Array[block3Array.length - 1][1] += `;${child.name}`;
            for (const question of child.questions) {
              //The header is created below
              if (!addedFirstQuestion) {
                if (addSubclassificationComma)
                  block3Array[block3Array.length - 1][0] += ",";
                block3Array[block3Array.length - 1][2] += `;${question.name}`;
                addedFirstQuestion = true;
                addSubclassificationComma = true;
              } else {
                if (addSubclassificationComma)
                  block3Array[block3Array.length - 1][0] += ",";
                block3Array[block3Array.length - 1][1] += ",";
                block3Array[block3Array.length - 1][2] += `,${question.name}`;
                addSubclassificationComma = true;
              }
              //The answers are added below
              let lineIndex = 3;
              for (const location of locations) {
                for (const assessment of location.assessments) {
                  let answerFound = false;
                  for (const formClassification of assessment.form
                    ?.classifications) {
                    if (classification.id === formClassification.id) {
                      for (const formSubclassification of formClassification.childs) {
                        if (formSubclassification.id === child.id) {
                          for (const formQuestion of formSubclassification.questions) {
                            if (formQuestion.id === question.id) {
                              for (const answer of formQuestion.answers) {
                                if (answer.assessmentId === assessment.id) {
                                  block3Array[block3Array.length - 1][
                                    lineIndex
                                  ] += `,${answer.content}`;
                                  answerFound = true;
                                  break;
                                }
                                if (answerFound) break;
                              }
                            }
                            if (answerFound) break;
                          }
                        }
                        if (answerFound) break;
                      }
                    }
                    if (answerFound) break;
                  }
                  if (!answerFound) {
                    block3Array[block3Array.length - 1][lineIndex] += `,`;
                  }
                  lineIndex++;
                }
              }
            }
          }
        }
      }
    }
  });
  if (block3Array) {
    for (let j = 0; j < block3Array[0]?.length; j++) {
      for (let i = 0; i < block3Array.length; i++) {
        block3CSVString += `${block3Array[i][j]}`;
      }
      block3CSVString += "\n";
    }
  }
  const block1Lines = block1CSVString.split("\n");
  const block2Lines = block2CSVString.split("\n");
  const resultArray: string[] = [];
  for (let i = 0; i < block1Lines.length; i++) {
    const linePt1 = block1Lines[i];
    const linePt2 = block2Lines[i];
    let linePt3 = "";
    for (let j = 0; j < block3Array.length; j++) {
      linePt3 += `${block3Array[j][i]}`;
    }
    if (includeTallys) resultArray.push(`${linePt1},${linePt2}${linePt3}`);
    else resultArray.push(`${linePt1}${linePt3}`);
  }
  //console.log(block3Array);
  const result = resultArray.join("\n");
  return result;
};

const createBlock1Line = (location) => {
  interface StreetsJsonType {
    [key: string]: string;
  }
  let evaluated = "N";
  if (location.assessments.length > 0) {
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
      ((totalStatisticsPeople / location.usableArea) * 100).toFixed(2)
    : "",
    location.incline ? location.incline : "",
    location.morphology && location.morphology === "CORNER" ? 1 : "",
    location.morphology && location.morphology === "CENTER" ? 1 : "",
    location.morphology && location.morphology === "ISOLATED" ? 1 : "",
    location.morphology && location.morphology === "DIVIDED" ? 1 : "",
    totalStreets,
    streetsJson ? Object.values(streetsJson).join(",") : "",
  ].join(",");

  return block1String;
};

const createBlock2Line = (location) => {
  if (location.tallys.length === 0)
    return ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,";
  const processedData = processAndFormatTallyDataLineWithAddedContent(
    location.tallys,
  );

  if (location.usableArea) {
    return (
      processedData.tallyString +
      "," +
      ((processedData.totalPeople / location.usableArea) * 100).toFixed(2)
    );
  } else return processedData.tallyString + ",";
};

const exportAllTallysToCsv = async (
  locationsIds: number[],
  sortCriteriaOrder: SortOrderType,
) => {
  const locations = await prisma.location.findMany({
    where: {
      id: {
        in: locationsIds,
      },
    },
    select: {
      tallys: {
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
      return location.tallys;
    })
    .flat();
  return createExclusiveTallyString(allTallys, sortCriteriaOrder);
};
const exportDailyTally = async (
  locationsIds: number[],
  tallysIds: number[],
  sortCriteriaOrder: SortOrderType,
) => {
  //This function must revceive locations and it's tallys whitch were made in the same day (Currently 4 max).
  let locations = await prisma.location.findMany({
    where: {
      id: {
        in: locationsIds,
      },
    },
    include: {
      tallys: {
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
      },
    },
  });
  locations = locations.sort((a, b) => {
    for (const criteria of sortCriteriaOrder) {
      switch (criteria) {
        case "name":
          return a.name.localeCompare(b.name);
          break;
        case "id":
          return a.id - b.id;
          break;
        case "date":
          return a.createdAt.getTime() - b.createdAt.getTime();
          break;
        default:
          return 0;
      }
    }
    return 0;
  });
  let CSVstring =
    "IDENTIFICAÇÃO PRAÇA,,LEVANTAMENTO,,CONTAGEM DE PESSOAS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n";
  CSVstring +=
    ",,,,HOMENS,,,,,,,,,,,,,,,,,MULHERES,,,,,,,,,,,,,,,,,,% SEXO,,% IDADE,,,,% ATIVIDADE FÍSICA,,,USUÁRIOS,,,,,,,,\n";
  CSVstring +=
    "Identificador,Nome da Praça,Observador(es),4 horários?,HA-SED,HA-CAM,HA-VIG,TOT-HA,HI-SED,HI-CAM,HI-VIG,TOT-HI,HC-SED,HC-CAM,HC-VIG,TOT-HC,HJ-SED,HJ-CAM,HJ-VIG,TOT-HJ,TOT-HOMENS,MA-SED,MA-CAM,MA-VIG,TOT-MA,MI-S,MI-C,MI-V,TOT-MI,MC-S,MC-C,MC-V,TOT-MC,MJ-S,MJ-C,MJ-V,TOT-MJ,TOT-M,TOTAL H&M,%HOMENS,%MULHERES,%ADULTO,%IDOSO,%CRIANÇA,%JOVEM,%SEDENTÁRIO,%CAMINHANDO,%VIGOROSO,PCD,Grupos,Pets,Passando,Qtde Atvividades comerciais intinerantes,Atividades Ilícitas,%Ativ Ilic,Pessoas em situação de rua,% Pessoas em situação de rua\n";
  CSVstring += locations
    .map((location) => {
      const observersArray: string[] = [];
      let observers = location.tallys
        .map((tally) => {
          if (!observersArray.includes(tally.observer)) {
            observersArray.push(tally.observer);
            return tally.observer;
          }
        })
        .join(" / ");
      if (observersArray.length === 1)
        observers = observers.trim().replace(/\/\s*$/, "");
      let fourTallys = 0;
      if (location.tallys.length == 4) fourTallys = 1;
      const dataLine = processAndFormatTallyDataLineWithAddedContent(
        location.tallys,
      ).tallyString;
      return `${location.id},${location.name},${observers},${fourTallys},${dataLine}`;
    })
    .join("\n");
  return CSVstring;
};

const processAndFormatTallyDataLineWithAddedContent = (
  tallys: tallyDataToProcessType[],
) => {
  if (tallys.length === 0)
    return {
      tallyString: ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
      totalPeople: 0,
    };
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
  tallyMap.set("Groups", 0); //?? o que é isso?
  tallyMap.set("Pets", 0);
  tallyMap.set("isTraversing", 0);
  tallyMap.set("commercialActivities", 0);
  tallyMap.set("isInApparentIllicitActivity", 0);
  tallyMap.set("%isInApparentIllicitActivity", "0.00%");
  tallyMap.set("isPersonWithoutHousing", 0);
  tallyMap.set("%isPersonWithoutHousing", "0.00%");
  for (const tally of tallys) {
    if (tally.groups) {
      tallyMap.set("Groups", tallyMap.get("Groups") + tally.groups);
    }
    if (tally.animalsAmount) {
      tallyMap.set("Pets", tallyMap.get("Pets") + tally.animalsAmount);
    }
    if (tally.commercialActivities) {
      tallyMap.set(
        "commercialActivities",
        tallyMap.get("commercialActivities") + tally.commercialActivities,
      );
    }

    for (const tallyPerson of tally.tallyPerson) {
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
    }
  }
  //Calculating data
  let totalPeople = 0;
  totalPeople = z.number().parse(tallyMap.get("Tot-H&M"));
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
const exportTallyToCSV = async (
  tallysIds: number[],
  sortCriteriaOrder: SortOrderType,
) => {
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

  return createExclusiveTallyString(tallys, sortCriteriaOrder);
};

const createExclusiveTallyString = (
  tallys: tallyDataToProcessType[],
  sortCriteriaOrder: SortOrderType,
) => {
  tallys = tallys.sort((a, b) => {
    for (const criteria of sortCriteriaOrder) {
      switch (criteria) {
        case "name":
          return a.location.name.localeCompare(b.location.name);
          break;
        case "id":
          return a.locationId - b.locationId;
          break;
        case "date":
          return a.startDate.getTime() - b.startDate.getTime();
          break;
        default:
          return 0;
      }
    }
    return 0;
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
  if (!tally.tallyPerson) {
    return {
      tallyString: ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,",
      totalPeople: 0,
    };
  }
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
  let totalPeople = 0;
  totalPeople = z.number().parse(tallyMap.get("Tot-H&M"));
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
export {
  exportFullSpreadsheetToCSV,
  exportTallyToCSV,
  exportAllTallysToCsv,
  exportDailyTally,
};
