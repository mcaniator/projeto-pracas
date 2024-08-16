"use server";

import { prisma } from "@/lib/prisma";
import { personType } from "@/lib/zodValidators";
import { Location, WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";

type SortOrderType = "id" | "name" | "date";
type AnswerType = "RESPONSE" | "RESPONSE_OPTION";
interface FetchedSubmission {
  id: number;
  createdAt: Date;
  formVersion: number;
  form: {
    id: number;
    name: string;
  };
  user: {
    id: string;
    username: string;
  };
  type: AnswerType;
}

interface TallyPerson {
  person: personType;
  quantity: number;
}
interface TallyDataToProcessType {
  startDate: Date;
  endDate: Date | null;
  user: {
    username: string;
  };
  animalsAmount: number | null;
  groups: number | null;
  temperature: number | null;
  weatherCondition: WeatherConditions | null;
  commercialActivities: JsonValue | null;
  locationId: number;
  location: {
    name: string;
  };
  tallyPerson: TallyPerson[];
}
interface TallyDataToProcessTypeWithoutLocation {
  startDate: Date;
  endDate: Date | null;
  user: {
    username: string;
  };
  animalsAmount: number | null;
  groups: number | null;
  temperature: number | null;
  weatherCondition: WeatherConditions | null;
  commercialActivities: JsonValue | null;
  locationId: number;
  tallyPerson: TallyPerson[];
}
interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
}
interface EvaluationDataType {
  type: string;
  location: Location;
  createdAt: Date;
  question: {
    id: number;
    name: string;
    category: Category;
    subcategory: Subcategory | null;
  };
  value: string | null | undefined;
  user: {
    id: string;
    username: string;
  };
}

interface groupedDataType {
  [key: string]: {
    form: {
      id: number;
      version: number;
      name: string;
      createdAt: Date;
    };
    formVersion: number;
    data: EvaluationDataType[];
  };
}

const hourFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
});

const dateWithWeekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  weekday: "short",
});
const weatherConditionMap = new Map([
  ["SUNNY", "Com sol"],
  ["CLOUDY", "Nublado"],
]);
const locationCategoriesMap = new Map([
  ["OPEN_SPACE_FOR_COLLECTIVE_USE", "ELP"],
  [
    "OPEN_SPACE_FOR_COLLECTIVE_USE_IN_RESTRICTED_AREA",
    "ELP em área de acesso restriro (condomínimos)",
  ],
]);
const LocationTypesMap = new Map([
  ["MICRO_SQUARE", "Micro Praça (menor 500m²)"],
  ["SQUARE", "Praça"],
  ["SPORTS_SQUARE ", "Praça de Esportes"],
  ["OVERLOOK", "Mirante"],
  ["COURTYARD", "Pátio"],
  ["GARDEN", "Jardim"],
  ["CHURCHYARD", "Ardo/Largo de Igreja"],
  ["PARK", "Parque"],
  ["BOTANICAL_GARDEN", "Jardim Botânico"],
  ["FOREST_GARDEN", "Horto Florestal"],
  ["AMATEUR_SOCCER_FIELDS", "Campos de futebol de várzea"],
]);

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

/*const exportFullSpreadsheetToCSV = async (
  locationsIds: number[],
  tallysGroups: number[],
  assessmentsIds: number[],
  sortCriteriaOrder: SortOrderType,
) => {
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
        take: 1,
        select: {
          id: true,
          startDate: true,
          endDate: true,
          form: {
            select: {
              questions: {
                select: {
                  id: true,
                  name: true,
                },
              },
              classifications: {
                select: {
                  id: true,
                  parentId: true,
                  parent: true,
                  childs: {
                    select: {
                      id: true,
                      name: true,
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
          tallyGroup: {
            in: tallysGroups,
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
        case "id":
          return a.id - b.id;
        case "date":
          return a.createdAt.getTime() - b.createdAt.getTime();
        default:
          return 0;
      }
    }
    return 0;
  });

  const classificationsIdsToFetch: number[] = [];
  const questionsIdsToFetch: number[] = [];
  for (const location of locations) {
    const assessment = location.assessments[0];
    if (assessment) {
      for (const classification of assessment.form.classifications) {
        if (!classificationsIdsToFetch.includes(classification.id)) {
          classificationsIdsToFetch.push(classification.id);
        }
      }
      for (const question of assessment.form.questions) {
        if (!questionsIdsToFetch.includes(question.id)) {
          questionsIdsToFetch.push(question.id);
        }
      }
    }
  }

  const classifications = await prisma.classification.findMany({
    where: {
      id: {
        in: classificationsIdsToFetch,
      },
    },
    include: {
      childs: {
        include: {
          questions: {
            where: {
              id: {
                in: questionsIdsToFetch,
              },
            },
            select: {
              id: true,
              name: true,
              answers: {
                select: {
                  assessmentId: true,
                  content: true,
                },
              },
            },
          },
        },
      },
      parent: {
        select: {
          id: true,
        },
      },
      questions: {
        where: {
          id: {
            in: questionsIdsToFetch,
          },
        },
        select: {
          id: true,
          name: true,
          answers: {
            select: {
              assessmentId: true,
              content: true,
            },
          },
        },
      },
    },
  });
  classifications.sort((a, b) => a.id - b.id);

  let block1CSVString =
    "IDENTIFICAÇÃO PRAÇA,,,,,,,,IDENTIFICAÇÃO LEVANTAMENTO,,,,DADOS HISTÓRICOS,,,,DADOS ADMINISTRATIVOS,,,,ÁREA,,POPULAÇÃO E DENSIDADE DO ENTORNO (400m),,,,,INCLIN,SOMBRA,MORFOLOGIA,,,,TIPOLOGIA DE VIAS,,,,,\n";
  block1CSVString +=
    ",,,,,,,,,,,,,,,,,,,,,,Fonte: http://mapasinterativos.ibge.gov.br/grade/default.html,,,,,,,posição na quadra - número de vias,,,,,LARGURA,,,,\n";
  block1CSVString +=
    "Identificador,Avaliada?,Nome da Praça,Nome popular,Categoria,Tipo,Observações,Endereço,Observador(es),Data ,Início,Duração,Ano criação,Ano reforma,Prefeito,Legislação,Distrito/Região,Subdistrito/Bairro,Densidade ,Renda,Área útil,Classificação,Homens,Mulheres,Pop Total,Domicílios Ocupados,Densidade,% inclinação,% área de sombra,canto,centro,isolada,dividida?,VIAS (número),4m,6m,8m,10m,20m\n";

  block1CSVString += locations
    .map((location) => {
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
          addressString += ` - ${brazilianStatesMap.get(location.address[0].state)}`;
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

      const observers = location.tallys
        .map((tally) => tally.observer)
        .filter((observer, index, self) => self.indexOf(observer) === index)
        .join(" / ");

      let startDateTime;
      let date;
      let duration;

      if (location.assessments[0]?.endDate) {
        startDateTime = hourFormatter.format(location.assessments[0].startDate);
        date = dateFormatter.format(location.assessments[0].startDate);
        const durationTimestampMs =
          location.assessments[0].endDate.getTime() -
          location.assessments[0].startDate.getTime();
        const durationHrs = Math.floor(durationTimestampMs / (1000 * 60 * 60));
        const durationMin = Math.floor(
          (durationTimestampMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        duration = `${String(durationHrs).padStart(2, "0")}:${String(durationMin).padStart(2, "0")}`;
      }

      const block1String = [
        location.id,
        evaluated,
        location.name,
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
        location.density ? location.density : "",
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

  let block2CSVString =
    "CONTAGEM DE PESSOAS DIAS DE SEMANA + FINAIS DE SEMANA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n";
  block2CSVString +=
    "HOMENS,,,,,,,,,,,,,,,,,MULHERES,,,,,,,,,,,,,,,,,,% SEXO,,% IDADE,,,,% ATIVIDADE FÍSICA,,,USUÁRIOS,,,,,,,,,DENSIDADE\n";
  block2CSVString +=
    "HA-SED,HA-CAM,HA-VIG,TOT-HA,HI-SED,HI-CAM,HI-VIG,TOT-HI,HC-SED,HC-CAM,HC-VIG,TOT-HC,HJ-SED,HJ-CAM,HJ-VIG,TOT-HJ,TOT-HOMENS,MA-SED,MA-CAM,MA-VIG,TOT-MA,MI-S,MI-C,MI-V,TOT-MI,MC-S,MC-C,MC-V,TOT-MC,MJ-S,MJ-C,MJ-V,TOT-MJ,TOT-M,TOTAL H&M,%HOMENS,%MULHERES,%ADULTO,%IDOSO,%CRIANÇA,%JOVEM,%SEDENTÁRIO,%CAMINHANDO,%VIGOROSO,PCD,Grupos,Pets,Passando,Atvidades comerciais intinerantes (Qtde),Atividades Ilícitas,%Ativ Ilic,Pessoas em situação de rua,%Pessoas em situação de rua,DENSIDADE\n";

  let includeTallys = false;
  block2CSVString += `${locations
    .map((location) => {
      if (location.tallys.length > 0) includeTallys = true;

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
    })
    .join("\n")}`;

  const classificationsAdded: number[] = [];

  const block3Array: string[][] = []; // -> [[LINE, LINE, ...],[LINE, LINE,...]] each array is an classification's content
  for (const classification of classifications) {
    const linesWithoutAnswers: number[] = [];
    let lineIndex = 3;
    const linesArray: string[] = ["", "", ""]; //Adds header lines
    if (classification.childs.length === 0 && !classification.parent) {
      //Here classifications without subclassifications are processed
      if (classification.questions) {
        for (const location of locations) {
          const assessment = location.assessments[0];
          linesArray.push(""); //Adds an answers line for this location, even if the classification hasn't been found yet, or even there isn't an assessment in this location
          let classificationAddedPreviouslyFound = false;
          if (assessment && assessment.form.classifications) {
            if (!classificationsAdded.includes(classification.id)) {
              //Here the header will be created (if this classification is found)
              for (const formClassification of assessment.form
                .classifications) {
                if (formClassification.id === classification.id) {
                  classificationsAdded.push(classification.id);
                  let addedFirstQuestion = false;
                  linesArray[0] = `,${classification.name}`; //Adds classification name to the header
                  linesArray[1] = `,`; //Adds a comma to the subclassification line (this classification doesn't have a classification)
                  for (const question of classification.questions) {
                    if (addedFirstQuestion) linesArray[0] += ","; //Adds commas to make the classification line have the same ammount of collums as it's answers
                    if (addedFirstQuestion) linesArray[1] += ","; //Adds commas to make the subclassification line have the same ammount of collums as it's answers
                    linesArray[2] += `,${question.name}`; //Adds question name to the header
                    addedFirstQuestion = true;
                  }
                  break;
                }
              }
            }

            if (classificationsAdded.includes(classification.id)) {
              //Will only enter this block if this classification has already been found within assessments

              for (const formClassification of assessment.form
                .classifications) {
                if (formClassification.id === classification.id) {
                  classificationAddedPreviouslyFound = true;
                  for (const question of classification.questions) {
                    let answerFound = false;
                    for (const answer of question.answers) {
                      if (answer.assessmentId === assessment.id) {
                        linesArray[linesArray.length - 1] +=
                          `,${answer.content}`; //Adds answer content to the last line of the current classification array
                        answerFound = true;
                      }
                    }
                    if (!answerFound) linesArray[linesArray.length - 1] += `,`; //Adds an empty collumn if the answer wasn't found
                  }
                }
              }
              if (!classificationAddedPreviouslyFound) {
                for (let i = 0; i < classification.questions.length; i++) {
                  linesArray[linesArray.length - 1] += `,`; //If the classification was found previously, but it isn't present in this assessment, commas will be added to fill the answers collumns
                }
              }
            } else {
              linesWithoutAnswers.push(lineIndex); //If the classification hasn't been found yet, this line's index is stored to add commas to it in case the classification is found
            }
          }
          if (!assessment) {
            if (!classificationsAdded.includes(classification.id)) {
              linesWithoutAnswers.push(lineIndex); //If the classification hasn't been found yet, this line's index is stored to add commas to it in case the classification is found
            }
            if (!classificationAddedPreviouslyFound) {
              for (let i = 0; i < classification.questions.length; i++) {
                linesArray[linesArray.length - 1] += `,`; //If the classification was found previously, but it isn't present in this assessment, commas will be added to fill the answers collumns
              }
            }
          }
          lineIndex++;
        }
        if (classificationsAdded.includes(classification.id)) {
          //Here empty collumns will be added to assessments which were processed before the classification was found
          for (const line of linesWithoutAnswers) {
            for (let i = 0; i < classification.questions.length; i++) {
              linesArray[line] += ",";
            }
          }
        }
      }
    } else if (!classification.parent && classification.childs.length > 0) {
      //Here classifications with subclassifications are processed
      const subclassificationsAdded: number[] = [];
      for (let i = 0; i < locations.length; i++) {
        linesArray.push(""); //Adds space to each assessment's answers
      }
      for (const location of locations) {
        const assessment = location.assessments[0];
        if (assessment) {
          if (assessment.form.classifications) {
            for (const formClassification of assessment.form.classifications) {
              if (
                !classificationsAdded.includes(classification.id) &&
                formClassification.id === classification.id
              ) {
                //Process the classification
                linesArray[0] += `;${classification.name}`; //Adds classification name to the header
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
            }
          }
        }
      } //Here all the subclassifications IDs that need to be added will be stored in subclassificationAdded
      subclassificationsAdded.sort((a, b) => a - b);
      let addSubclassificationComma = false;
      for (const subclassificationAdded of subclassificationsAdded) {
        for (const child of classification.childs) {
          if (subclassificationAdded === child.id) {
            //Adds this subclassification's related content to the array

            let addedFirstQuestion = false;
            linesArray[1] += `;${child.name}`;
            for (const question of child.questions) {
              //Questions are processed here
              //The header is created below
              if (!addedFirstQuestion) {
                if (addSubclassificationComma) linesArray[0] += ",";
                linesArray[2] += `;${question.name}`;
                addedFirstQuestion = true;
                addSubclassificationComma = true;
              } else {
                if (addSubclassificationComma) linesArray[0] += ",";
                linesArray[1] += ",";
                linesArray[2] += `,${question.name}`;
                addSubclassificationComma = true;
              }
              //The answers are added below
              let lineIndex = 3;
              for (const location of locations) {
                const assessment = location.assessments[0];
                if (assessment) {
                  if (assessment.form.questions) {
                    let answerFound = false;
                    for (const formQuestion of assessment.form.questions) {
                      if (formQuestion.id === question.id) {
                        for (const answer of question.answers) {
                          if (answer.assessmentId === assessment.id) {
                            linesArray[lineIndex] += `,${answer.content}`;
                            answerFound = true;
                          }
                        }
                      }
                    }
                    if (!answerFound) {
                      linesArray[lineIndex] += `,`;
                    }
                  }
                } else {
                  linesArray[lineIndex] += ",";
                }
                lineIndex++;
              }
            }
          }
        }
      }
    }
    block3Array.push(linesArray);
  }

  const block4Array: string[] = [
    "CONTROLE DE CONTAGEM DE PESSOAS,,,,,,,,,,,,,,,",
    "SEMANA 01,,,,SEMANA 02,,,,FIM SEMANA 01,,,,FIM SEMANA 02,,,",
    "8:00,11:30,15:00,18:30,8:00,11:30,15:00,18:30,8:00,11:30,15:00,18:30,8:00,11:30,15:00,18:30",
  ];

  const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  });
  for (const location of locations) {
    const tallys = location.tallys;
    const weekTallys: tallyDataToProcessType[] = [];
    const weekendTallys: tallyDataToProcessType[] = [];
    for (const tally of tallys) {
      if (
        dayFormatter.format(tally.startDate) == "sáb." ||
        dayFormatter.format(tally.startDate) == "dom."
      )
        weekendTallys.push(tally);
      else weekTallys.push(tally);
    }
    weekTallys.sort((a, b) => {
      return a.startDate.getTime() - b.startDate.getTime();
    });
    weekendTallys.sort((a, b) => {
      return a.startDate.getTime() - b.startDate.getTime();
    });
    const initialWeekDay = dateFormatter.format(weekTallys[0]?.startDate);
    const initialWeekendDay = dateFormatter.format(weekendTallys[0]?.startDate);
    const weekday1Tallys: tallyDataToProcessType[] = [];
    const weekday2Tallys: tallyDataToProcessType[] = [];
    const weekendDay1Tallys: tallyDataToProcessType[] = [];
    const weekendDay2Tallys: tallyDataToProcessType[] = [];
    for (const tally of weekTallys) {
      if (dateFormatter.format(tally.startDate) === initialWeekDay) {
        weekday1Tallys.push(tally);
      } else {
        weekday2Tallys.push(tally);
      }
    }
    for (const tally of weekendTallys) {
      if (dateFormatter.format(tally.startDate) === initialWeekendDay) {
        weekendDay1Tallys.push(tally);
      } else {
        weekendDay2Tallys.push(tally);
      }
    }
    let line: string = "";
    const tallysMatrix = [
      weekday1Tallys,
      weekday2Tallys,
      weekendDay1Tallys,
      weekendDay2Tallys,
    ];
    let firstCollumnAdded = false;
    for (const dayTallysArray of tallysMatrix) {
      let tallyIndex = 0;
      let analysedTally = dayTallysArray[tallyIndex];
      let tallyHours = analysedTally?.startDate.getHours();

      if (tallyHours === 7 || tallyHours === 8 || tallyHours === 9) {
        if (analysedTally) {
          if (!firstCollumnAdded) {
            line += `${processAndFormatTallyDataLineWithAddedContent([analysedTally]).totalPeople}`;
            firstCollumnAdded = true;
          } else
            line += `,${processAndFormatTallyDataLineWithAddedContent([analysedTally]).totalPeople}`;
        }

        tallyIndex++;
        analysedTally = dayTallysArray[tallyIndex];
        tallyHours = analysedTally?.startDate.getHours();
      } else {
        if (!firstCollumnAdded) {
          line += "";
          firstCollumnAdded = true;
        } else {
          line += ",";
        }
      }
      if (
        tallyHours === 10 ||
        tallyHours === 11 ||
        tallyHours === 12 ||
        tallyHours === 13
      ) {
        if (analysedTally)
          line += `,${processAndFormatTallyDataLineWithAddedContent([analysedTally]).totalPeople}`;
        tallyIndex++;
        analysedTally = dayTallysArray[tallyIndex];
        tallyHours = analysedTally?.startDate.getHours();
      } else {
        line += ",";
      }
      if (
        tallyHours === 13 ||
        tallyHours === 14 ||
        tallyHours === 15 ||
        tallyHours === 16
      ) {
        if (analysedTally)
          line += `,${processAndFormatTallyDataLineWithAddedContent([analysedTally]).totalPeople}`;
        tallyIndex++;
        analysedTally = dayTallysArray[tallyIndex];
        tallyHours = analysedTally?.startDate.getHours();
      } else {
        line += ",";
      }
      if (
        tallyHours === 17 ||
        tallyHours === 18 ||
        tallyHours === 19 ||
        tallyHours === 20
      ) {
        if (analysedTally)
          line += `,${processAndFormatTallyDataLineWithAddedContent([analysedTally]).totalPeople}`;
      } else {
        line += ",";
      }
    }
    block4Array.push(line);
  }
  const block1Lines = block1CSVString.split("\n");
  const block2Lines = block2CSVString.split("\n");
  const resultArray: string[] = [];
  for (let i = 0; i < block1Lines.length; i++) {
    const linePt1 = block1Lines[i];
    const linePt2 = block2Lines[i];
    let linePt3 = "";
    if (block3Array) {
      for (let j = 0; j < block3Array.length; j++) {
        const block3ArrayElement = block3Array[j];
        if (block3ArrayElement && block3ArrayElement[i]) {
          const block3ArrayInnerElement = block3ArrayElement[i];
          linePt3 += `${block3ArrayInnerElement}`;
        }
      }
    }

    const linePt4 = block4Array[i];
    if (includeTallys)
      resultArray.push(`${linePt1},${linePt2}${linePt3},,${linePt4}`);
    else resultArray.push(`${linePt1}${linePt3}`);
  }

  const result = resultArray.join("\n");
  return result;
};*/

const exportRegistrationData = async (
  locationsIds: number[],
  sortCriteriaOrder: SortOrderType[],
) => {
  const locations = await prisma.location.findMany({
    where: {
      id: {
        in: locationsIds,
      },
    },
  });

  let CSVstring = "IDENTIFICAÇÃO PRAÇA,,,,,,,DADOS HISTÓRICOS,,,,\n";
  CSVstring += ",,,,,,,,,,,\n";
  CSVstring +=
    "Identificador,Nome da Praça,Nome popular,Categoria,Tipo,Observações,Endereço,Ano criação,Ano reforma,Prefeito,Legislação\n";
  CSVstring += locations
    .map((location) => {
      let locationCategory = "";
      if (location.category) {
        locationCategory = locationCategoriesMap.get(location.category) || "";
      }
      const locationString = [
        location.id,
        location.name,
        location.popularName ? location.popularName : "",
        locationCategory,
        location.type ? LocationTypesMap.get(location.type) : "",
        location.notes ? location.notes : "",
        `${location.firstStreet} / ${location.secondStreet}`,
        location.creationYear?.toLocaleDateString("pt-BR", { year: "numeric" }),
        location.lastMaintenanceYear?.toLocaleDateString("pt-BR", {
          year: "numeric",
        }),
        location.overseeingMayor,
        location.legislation,
      ].join(",");

      return locationString;
    })
    .join("\n");

  return CSVstring;
};

const exportEvaluation = async (
  locationsIds: number[],
  responsesWithType: FetchedSubmission[],
) => {
  const responsesIds = responsesWithType
    .filter((response) => response.type === "RESPONSE")
    .map((response) => response.id);
  const responsesOptionsIds = responsesWithType
    .filter((response) => response.type === "RESPONSE_OPTION")
    .map((response) => response.id);

  const responses = await prisma.response.findMany({
    where: {
      id: {
        in: responsesIds,
      },
    },
    include: {
      location: true,
      form: true,
      question: {
        include: {
          category: true,
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      },
      user: {
        select: {
          username: true,
          id: true,
        },
      },
    },
  });
  const responseOptions = await prisma.responseOption.findMany({
    where: {
      id: {
        in: responsesOptionsIds,
      },
    },
    include: {
      location: true,
      form: true,
      question: {
        include: {
          category: true,
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      },
      option: true,
      user: {
        select: {
          username: true,
          id: true,
        },
      },
    },
  });

  // Grouping by form and formVersion. Each group will form a different table.
  const groupedDataByFormAndFormVersion: groupedDataType = {};
  responses.forEach((response) => {
    const key = `${response.form.id}-${response.formVersion}`;
    if (!groupedDataByFormAndFormVersion[key]) {
      groupedDataByFormAndFormVersion[key] = {
        form: response.form,
        formVersion: response.formVersion,
        data: [],
      };
    }
    groupedDataByFormAndFormVersion[key].data.push({
      type: "response",
      location: response.location,
      createdAt: response.createdAt,
      question: response.question,
      value: response.response,
      user: response.user,
    });
  });

  responseOptions.forEach((responseOption) => {
    const key = `${responseOption.form.id}-${responseOption.formVersion}`;
    if (!groupedDataByFormAndFormVersion[key]) {
      groupedDataByFormAndFormVersion[key] = {
        form: responseOption.form,
        formVersion: responseOption.formVersion,
        data: [],
      };
    }
    groupedDataByFormAndFormVersion[key].data.push({
      type: "responseOption",
      location: responseOption.location,
      createdAt: responseOption.createdAt,
      question: responseOption.question,
      value: responseOption.option?.text,
      user: responseOption.user,
    });
  });

  const csvObjs: {
    formName: string;
    formVersion: number;
    csvString: string;
  }[] = [];
  for (const key in groupedDataByFormAndFormVersion) {
    const currentGroup = groupedDataByFormAndFormVersion[key];
    if (currentGroup) {
      const categories: {
        [key: number]: {
          name: string;
          questionCount: number;
          processedQuestions: Set<number>;
        };
      } = {};
      const subcategories: {
        [key: number]: {
          name: string;
          questionCount: number;
          processedQuestions: Set<number>;
        };
      } = {};
      const questions: { [key: number]: string } = {};

      const { form, formVersion, data } = currentGroup;

      data.forEach((response) => {
        const question = response.question;

        if (!categories[question.category.id]) {
          categories[question.category.id] = {
            name: question.category.name,
            questionCount: 0,
            processedQuestions: new Set(),
          };
        }
        const currentCategory = categories[question.category.id];
        if (currentCategory) {
          if (!currentCategory.processedQuestions.has(question.id)) {
            currentCategory.questionCount += 1;
            currentCategory.processedQuestions.add(question.id);
          }
        }

        if (question.subcategory) {
          if (!subcategories[question.subcategory.id]) {
            subcategories[question.subcategory.id] = {
              name: question.subcategory.name,
              questionCount: 0,
              processedQuestions: new Set(),
            };
          }

          const currentSubcategory = subcategories[question.subcategory.id];
          if (currentSubcategory) {
            if (!currentSubcategory.processedQuestions.has(question.id)) {
              currentSubcategory.questionCount += 1;
              currentSubcategory.processedQuestions.add(question.id);
            }
          }
        }

        if (!questions[question.id]) {
          questions[question.id] = question.name;
        }
      });

      const categoryLine = `IDENTIFICAÇÃO DA PRAÇA,,IDENTIFICAÇÃO DO LEVANTAMENTO,,,,${Object.values(
        categories,
      )
        .map((category) =>
          Array(category.questionCount).fill(category.name).join(","),
        )
        .join(",")}`;

      const subcategoryLine = `,,,,,,${Object.values(subcategories)
        .map((subcategory) =>
          Array(subcategory.questionCount).fill(subcategory.name).join(","),
        )
        .join(",")}`;
      const questionLine = `Identificador,Nome da praça,Avaliador,Dia,Data,Horário,${Object.values(questions).join(",")}`;

      let csvContent = `${categoryLine}\n${subcategoryLine}\n${questionLine}\n`;

      const groupedDataByLocationDateUser: {
        [key: string]: EvaluationDataType[];
      } = {}; //Each group will form a line.

      data.forEach((response) => {
        const key = `${response.location.id}-${response.createdAt.toISOString()}-${response.user.id}`;
        if (!groupedDataByLocationDateUser[key]) {
          groupedDataByLocationDateUser[key] = [];
        }
        groupedDataByLocationDateUser[key].push(response);
      });

      for (const key in groupedDataByLocationDateUser) {
        const groupedData = groupedDataByLocationDateUser[key];
        if (groupedData) {
          const firstResponse = groupedData[0];
          if (firstResponse) {
            const locationId = firstResponse.location.id;
            const locationName = firstResponse.location.name;
            const username = firstResponse.user.username;
            const dateTime = new Date(firstResponse.createdAt);
            const weekday = dateTime.toLocaleString("pt-BR", {
              weekday: "short",
            });
            const date = dateTime.toLocaleDateString();
            const time = dateTime.toLocaleTimeString();

            const responseValues = Object.keys(questions).map((questionId) => {
              const currentQuestionResponses = groupedData.filter(
                (response) => response.question.id === parseInt(questionId),
              );
              if (currentQuestionResponses.length > 0) {
                return currentQuestionResponses
                  .filter(
                    (response) =>
                      response.value !== null && response.value !== undefined,
                  )
                  .map((response) => response.value)
                  .join(" / ");
              }
              return "";
            });
            csvContent += `${locationId},${locationName},${username},${weekday},${date},${time},${responseValues.join(",")}\n`;
          }
        }
      }

      csvObjs.push({
        formName: form.name,
        formVersion: formVersion,
        csvString: csvContent,
      });
    }
  }

  return csvObjs;
};

const exportDailyTallys = async (
  locationIds: number[],
  tallysIds: number[],
  sortCriteriaOrder: SortOrderType[],
) => {
  let locationObjs = await prisma.location.findMany({
    where: {
      id: {
        in: locationIds,
      },
    },
    select: {
      name: true,
      id: true,
      createdAt: true,
      tally: {
        where: {
          id: {
            in: tallysIds,
          },
        },
        include: {
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
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  locationObjs = locationObjs.sort((a, b) => {
    for (const criteria of sortCriteriaOrder) {
      switch (criteria) {
        case "name":
          return a.name.localeCompare(b.name);
        case "id":
          return a.id - b.id;
        case "date":
          return a.createdAt.getTime() - b.createdAt.getTime();
        default:
          return 0;
      }
    }
    return 0;
  });

  let maxWeekdays = 0;
  let maxWeekendDays = 0;
  const locationsWithTallyGroupsByDate = locationObjs.map((location) => {
    const tallyGroupsByDate = location.tally.reduce<{
      [key: string]: typeof location.tally;
    }>((acc, tally) => {
      const weekday = tally.startDate.toLocaleString("pt-BR", {
        weekday: "short",
      });
      const year = tally.startDate.getFullYear();
      const month = String(tally.startDate.getMonth() + 1).padStart(2, "0");
      const day = String(tally.startDate.getDate()).padStart(2, "0");
      const key = `${weekday}-${year}-${month}-${day}`;
      if (key) {
        if (!acc[key]) {
          acc[key] = [];
        }
        const currentAccElement = acc[key];
        if (currentAccElement) {
          currentAccElement.push(tally);
        }
      }
      return acc;
    }, {});

    const tallyGroupsByDateAndDayClassication: {
      weekendDays: (typeof tallyGroupsByDate)[];
      weekdays: (typeof tallyGroupsByDate)[];
    } = { weekendDays: [], weekdays: [] };
    for (const tallyGroupByDateKey of Object.keys(tallyGroupsByDate)) {
      const dayName = tallyGroupByDateKey.split("-")[0];
      if (dayName === "dom." || dayName === "sáb.") {
        const tallyGroupToSort = tallyGroupsByDate[tallyGroupByDateKey];
        if (tallyGroupToSort) {
          tallyGroupsByDateAndDayClassication.weekendDays.push({
            [tallyGroupByDateKey]: tallyGroupToSort,
          });
        }
      } else {
        const tallyGroupToSort = tallyGroupsByDate[tallyGroupByDateKey];
        if (tallyGroupToSort) {
          tallyGroupsByDateAndDayClassication.weekdays.push({
            [tallyGroupByDateKey]: tallyGroupToSort,
          });
        }
      }
    }
    tallyGroupsByDateAndDayClassication.weekdays.sort((a, b) => {
      const keyA = Object.keys(a)[0];
      const keyB = Object.keys(b)[0];
      if (keyA && keyB) {
        const objArrayA = a[keyA];
        const objArrayB = b[keyB];
        if (objArrayA && objArrayB) {
          const objA = objArrayA[0];
          const objB = objArrayB[0];
          if (objA && objB) {
            return objA.startDate.getTime() - objB.startDate.getTime();
          } else {
            return 0;
          }
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    tallyGroupsByDateAndDayClassication.weekendDays.sort((a, b) => {
      const keyA = Object.keys(a)[0];
      const keyB = Object.keys(b)[0];
      if (keyA && keyB) {
        const objArrayA = a[keyA];
        const objArrayB = b[keyB];
        if (objArrayA && objArrayB) {
          const objA = objArrayA[0];
          const objB = objArrayB[0];
          if (objA && objB) {
            return objA.startDate.getTime() - objB.startDate.getTime();
          } else {
            return 0;
          }
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    const weekdays = tallyGroupsByDateAndDayClassication.weekdays.length;
    const weekendDays = tallyGroupsByDateAndDayClassication.weekendDays.length;
    if (maxWeekdays < weekdays) maxWeekdays = weekdays;
    if (maxWeekendDays < weekendDays) maxWeekendDays = weekendDays;
    return {
      location: {
        id: location.id,
        name: location.name,
        createdAt: location.createdAt,
      },
      tallyGroupsByDateAndDayClassication,
    };
  });
  const CSVstringWeekdays: string[] = [];
  const CSVstringWeekendDays: string[] = [];
  for (let i = 0; i < maxWeekdays; i++) {
    let CSVstring =
      "IDENTIFICAÇÃO PRAÇA,,LEVANTAMENTO,,,,CONTAGEM DE PESSOAS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n";
    CSVstring +=
      ",,,,,,HOMENS,,,,,,,,,,,,,,,,,MULHERES,,,,,,,,,,,,,,,,,,% SEXO,,% IDADE,,,,% ATIVIDADE FÍSICA,,,USUÁRIOS,,,,,,,,\n";
    CSVstring += `Identificador,Nome da Praça,Observador(es),Dia,Data,Nº horários,HA-SED,HA-CAM,HA-VIG,TOT-HA,HI-SED,HI-CAM,HI-VIG,TOT-HI,HC-SED,HC-CAM,HC-VIG,TOT-HC,HJ-SED,HJ-CAM,HJ-VIG,TOT-HJ,TOT-HOMENS,MA-SED,MA-CAM,MA-VIG,TOT-MA,MI-S,MI-C,MI-V,TOT-MI,MC-S,MC-C,MC-V,TOT-MC,MJ-S,MJ-C,MJ-V,TOT-MJ,TOT-M,TOTAL H&M,%HOMENS,%MULHERES,%ADULTO,%IDOSO,%CRIANÇA,%JOVEM,%SEDENTÁRIO,%CAMINHANDO,%VIGOROSO,PCD,Grupos,Pets,Passando,Qtde Atvividades comerciais intinerantes,Atividades Ilícitas,%Ativ Ilic,Pessoas em situação de rua,% Pessoas em situação de rua\n`;
    CSVstring += locationsWithTallyGroupsByDate
      .map((locationObj) => {
        let observers = "";
        const tallys: TallyDataToProcessTypeWithoutLocation[] = [];
        const tallyWithKey =
          locationObj.tallyGroupsByDateAndDayClassication.weekdays[0];
        locationObj.tallyGroupsByDateAndDayClassication.weekdays.shift();
        let day = "";
        let date = "";
        let tallysInAday = "";
        if (tallyWithKey) {
          const key = Object.keys(tallyWithKey)[0];
          if (key) {
            const tallysToPush = tallyWithKey[key];
            if (tallysToPush) {
              tallys.push(...tallysToPush);
              observers = tallysToPush
                .map((tally) => tally.user.username)
                .filter(
                  (observer, index, self) => self.indexOf(observer) === index,
                )
                .join(" / ");
              day =
                tallysToPush[0]?.startDate.toLocaleString("pt-BR", {
                  weekday: "short",
                }) || "";
              date =
                tallysToPush[0]?.startDate.toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                }) || "";
              tallysInAday = tallysToPush.length.toString();
            }
          }
        }
        const dataLine =
          processAndFormatTallyDataLineWithAddedContent(tallys).tallyString;

        return `${locationObj.location.id},${locationObj.location.name},${observers},${day},${date},${tallysInAday},${dataLine}`;
      })
      .join("\n");

    CSVstringWeekdays.push(CSVstring);
  }
  for (let i = 0; i < maxWeekendDays; i++) {
    let CSVstring =
      "IDENTIFICAÇÃO PRAÇA,,LEVANTAMENTO,,,,CONTAGEM DE PESSOAS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n";
    CSVstring +=
      ",,,,,,HOMENS,,,,,,,,,,,,,,,,,MULHERES,,,,,,,,,,,,,,,,,,% SEXO,,% IDADE,,,,% ATIVIDADE FÍSICA,,,USUÁRIOS,,,,,,,,\n";
    CSVstring += `Identificador,Nome da Praça,Observador(es),Dia,Data,Nº horários,HA-SED,HA-CAM,HA-VIG,TOT-HA,HI-SED,HI-CAM,HI-VIG,TOT-HI,HC-SED,HC-CAM,HC-VIG,TOT-HC,HJ-SED,HJ-CAM,HJ-VIG,TOT-HJ,TOT-HOMENS,MA-SED,MA-CAM,MA-VIG,TOT-MA,MI-S,MI-C,MI-V,TOT-MI,MC-S,MC-C,MC-V,TOT-MC,MJ-S,MJ-C,MJ-V,TOT-MJ,TOT-M,TOTAL H&M,%HOMENS,%MULHERES,%ADULTO,%IDOSO,%CRIANÇA,%JOVEM,%SEDENTÁRIO,%CAMINHANDO,%VIGOROSO,PCD,Grupos,Pets,Passando,Qtde Atvividades comerciais intinerantes,Atividades Ilícitas,%Ativ Ilic,Pessoas em situação de rua,% Pessoas em situação de rua\n`;
    CSVstring += locationsWithTallyGroupsByDate
      .map((locationObj) => {
        let observers = "";
        const tallys: TallyDataToProcessTypeWithoutLocation[] = [];
        const tallyWithKey =
          locationObj.tallyGroupsByDateAndDayClassication.weekendDays[0];
        locationObj.tallyGroupsByDateAndDayClassication.weekendDays.shift();
        let day = "";
        let date = "";
        let tallysInAday = "";
        if (tallyWithKey) {
          const key = Object.keys(tallyWithKey)[0];
          if (key) {
            const tallysToPush = tallyWithKey[key];
            if (tallysToPush) {
              tallys.push(...tallysToPush);
              observers = tallysToPush
                .map((tally) => tally.user.username)
                .filter(
                  (observer, index, self) => self.indexOf(observer) === index,
                )
                .join(" / ");
              day =
                tallysToPush[0]?.startDate.toLocaleString("pt-BR", {
                  weekday: "short",
                }) || "";
              date =
                tallysToPush[0]?.startDate.toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                }) || "";
              tallysInAday = tallysToPush.length.toString();
            }
          }
        }
        const dataLine =
          processAndFormatTallyDataLineWithAddedContent(tallys).tallyString;

        return `${locationObj.location.id},${locationObj.location.name},${observers},${day},${date},${tallysInAday},${dataLine}`;
      })
      .join("\n");

    CSVstringWeekendDays.push(CSVstring);
  }
  return {
    CSVstringWeekdays,
    CSVstringWeekendDays,
  };
};

const exportDailyTallysFromSingleLocation = async (
  tallysIds: number[],
  sortCriteriaOrder: SortOrderType[],
) => {
  let tallys = await prisma.tally.findMany({
    where: {
      id: {
        in: tallysIds,
      },
    },
    include: {
      location: {
        select: {
          name: true,
          id: true,
          createdAt: true,
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
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  let CSVstring =
    "IDENTIFICAÇÃO PRAÇA,,LEVANTAMENTO,,,,CONTAGEM DE PESSOAS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n";
  CSVstring +=
    ",,,,,,HOMENS,,,,,,,,,,,,,,,,,MULHERES,,,,,,,,,,,,,,,,,,% SEXO,,% IDADE,,,,% ATIVIDADE FÍSICA,,,USUÁRIOS,,,,,,,,\n";
  CSVstring +=
    "Identificador,Nome da Praça,Observador(es),Dia,Data,Nº observações,HA-SED,HA-CAM,HA-VIG,TOT-HA,HI-SED,HI-CAM,HI-VIG,TOT-HI,HC-SED,HC-CAM,HC-VIG,TOT-HC,HJ-SED,HJ-CAM,HJ-VIG,TOT-HJ,TOT-HOMENS,MA-SED,MA-CAM,MA-VIG,TOT-MA,MI-S,MI-C,MI-V,TOT-MI,MC-S,MC-C,MC-V,TOT-MC,MJ-S,MJ-C,MJ-V,TOT-MJ,TOT-M,TOTAL H&M,%HOMENS,%MULHERES,%ADULTO,%IDOSO,%CRIANÇA,%JOVEM,%SEDENTÁRIO,%CAMINHANDO,%VIGOROSO,PCD,Grupos,Pets,Passando,Qtde Atvividades comerciais intinerantes,Atividades Ilícitas,%Ativ Ilic,Pessoas em situação de rua,% Pessoas em situação de rua\n";

  tallys = tallys.sort((a, b) => {
    for (const criteria of sortCriteriaOrder) {
      switch (criteria) {
        case "name":
          return a.location.name.localeCompare(b.location.name);
        case "id":
          return a.location.id - b.location.id;
        case "date":
          return (
            a.location.createdAt.getTime() - b.location.createdAt.getTime()
          );
        default:
          return 0;
      }
    }
    return 0;
  });
  const tallyGroupsByLocation: { [key: number]: typeof tallys } = {};
  for (const tally of tallys) {
    if (!tallyGroupsByLocation[tally.location.id]) {
      tallyGroupsByLocation[tally.location.id] = [];
    }
    const currentGroup = tallyGroupsByLocation[tally.location.id];
    if (currentGroup) {
      currentGroup.push(tally);
    }
  }

  CSVstring += Object.entries(tallyGroupsByLocation)
    .map(([locationId, value]) => {
      value = value.sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime(),
      );
      const tallysGroupsByDate = value.reduce<{ [key: string]: typeof tallys }>(
        (acc, tally) => {
          const year = tally.startDate.getFullYear();
          const month = String(tally.startDate.getMonth() + 1).padStart(2, "0");
          const day = String(tally.startDate.getDate()).padStart(2, "0");
          const key = `${year}-${month}-${day}`;
          if (key) {
            if (!acc[key]) {
              acc[key] = [];
            }
            const currentAccElement = acc[key];
            if (currentAccElement) {
              currentAccElement.push(tally);
            }
          }
          return acc;
        },
        {},
      );

      return Object.entries(tallysGroupsByDate)
        .map(([, tallyGroup]) => {
          const observers = tallyGroup
            .map((tally) => tally.user.username)
            .filter((observer, index, self) => self.indexOf(observer) === index)
            .join(" / ");
          const dataLine =
            processAndFormatTallyDataLineWithAddedContent(
              tallyGroup,
            ).tallyString;
          return `${locationId},${tallyGroup[0]?.location.name},${observers},${tallyGroup[0]?.startDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "2-digit" })},${tallyGroup.length},${dataLine}`;
        })
        .join("\n");
    })
    .join("\n");

  return CSVstring;
};

//These 2 functions below are used to export tally content without combining data. They use old spreadsheet formation.
const exportAllIndividualTallysToCsv = async (
  locationsIds: number[],
  sortCriteriaOrder: SortOrderType[],
) => {
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
          user: {
            select: {
              username: true,
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
  return createTallyStringWithoutAddedData(allTallys, sortCriteriaOrder);
};

const exportIndividualTallysToCSV = async (
  tallysIds: number[],
  sortCriteriaOrder: SortOrderType[],
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
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return createTallyStringWithoutAddedData(tallys, sortCriteriaOrder);
};

//Functions below are used to process  and format tally content and are called by other functions
const processAndFormatTallyDataLineWithAddedContent = (
  tallys: TallyDataToProcessTypeWithoutLocation[],
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
  tallyMap.set("Groups", 0);
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
    if (
      tally.commercialActivities &&
      Object.keys(tally.commercialActivities).length > 0
    ) {
      let totalCommericalActivities = 0;
      Object.entries(tally.commercialActivities).forEach(([, value]) => {
        if (value) {
          totalCommericalActivities += value;
        }
      });
      tallyMap.set(
        "commercialActivities",
        tallyMap.get("commercialActivities") + totalCommericalActivities,
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

const createTallyStringWithoutAddedData = (
  tallys: TallyDataToProcessType[],
  sortCriteriaOrder: SortOrderType[],
) => {
  tallys = tallys.sort((a, b) => {
    for (const criteria of sortCriteriaOrder) {
      switch (criteria) {
        case "name":
          return a.location.name.localeCompare(b.location.name);
        case "id":
          return a.locationId - b.locationId;
        case "date":
          return a.startDate.getTime() - b.startDate.getTime();
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
      const startDateTime = hourFormatter.format(tally.startDate);
      const date = dateWithWeekdayFormatter.format(tally.startDate);
      let duration = "Horário do fim da contagem não definido";
      if (tally.endDate) {
        const durationTimestampMs =
          tally.endDate.getTime() - tally.startDate.getTime();
        const durationHrs = Math.floor(durationTimestampMs / (1000 * 60 * 60));
        const durationMin = Math.floor(
          (durationTimestampMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        duration = `${String(durationHrs).padStart(2, "0")}:${String(durationMin).padStart(2, "0")}`;
      }
      let tallyString = "";
      if (!tally.tallyPerson) {
        tallyString = ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,";
      } else {
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
        tallyMap.set("Groups", tally.groups);
        tallyMap.set("Pets", tally.animalsAmount);
        tallyMap.set("isTraversing", 0);
        tallyMap.set("commercialActivities", 0);
        tallyMap.set("isInApparentIllicitActivity", 0);
        tallyMap.set("%isInApparentIllicitActivity", "0.00%");
        tallyMap.set("isPersonWithoutHousing", 0);
        tallyMap.set("%isPersonWithoutHousing", "0.00%");

        if (
          tally.commercialActivities &&
          Object.keys(tally.commercialActivities).length > 0
        ) {
          let totalCommericalActivities = 0;
          Object.entries(tally.commercialActivities).forEach(([, value]) => {
            if (value) {
              totalCommericalActivities += value;
            }
          });
          tallyMap.set("commercialActivities", totalCommericalActivities);
        }

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
            tallyMap.get(`Tot-${tallyPerson.person.gender}`) +
              tallyPerson.quantity,
          );
          tallyMap.set(
            "Tot-H&M",
            tallyMap.get("Tot-H&M") + tallyPerson.quantity,
          );
          booleanPersonProperties.map((property) => {
            if (tallyPerson.person[property]) {
              tallyMap.set(
                property,
                tallyMap.get(property) + tallyPerson.quantity,
              );
            }
          });
        });
        let totalPeople = 0;
        totalPeople = z.number().parse(tallyMap.get("Tot-H&M"));
        if (totalPeople != 0) {
          for (const gender of genders) {
            tallyMap.set(
              `%${gender}`,
              ((tallyMap.get(`Tot-${gender}`) / totalPeople) * 100).toFixed(2) +
                "%",
            );
          }
          for (const ageGroup of ageGroups) {
            let totalAgeGroup = 0;
            for (const gender of genders) {
              for (const activity of acitvities) {
                totalAgeGroup += tallyMap.get(
                  `${gender}-${ageGroup}-${activity}`,
                );
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
                activityTotal += tallyMap.get(
                  `${gender}-${ageGroup}-${activity}`,
                );
              }
            }
            tallyMap.set(
              `%${activity}`,
              ((activityTotal / tallyMap.get(`Tot-H&M`)) * 100).toFixed(2) +
                "%",
            );
          }
          for (const property of otherPropertiesToCalcualtePercentage) {
            tallyMap.set(
              `%${property}`,
              ((tallyMap.get(`${property}`) / totalPeople) * 100).toFixed(2) +
                "%",
            );
          }
        }
        tallyString = `${[...tallyMap.values()].join(";")}`;
      }
      let weatherCondition = "";
      if (tally.weatherCondition) {
        weatherCondition =
          weatherConditionMap.get(tally.weatherCondition) || "";
      }
      return (
        `${tally.locationId},${tally.location.name},${tally.user.username},${date},${startDateTime},${duration},${tally.temperature ? tally.temperature : "-"},${weatherCondition},` +
        tallyString
      );
    })
    .join("\n");
  return CSVstring;
};

export {
  exportIndividualTallysToCSV,
  exportAllIndividualTallysToCsv,
  exportDailyTallys,
  exportDailyTallysFromSingleLocation,
  exportRegistrationData,
  exportEvaluation,
};

export { type FetchedSubmission };
