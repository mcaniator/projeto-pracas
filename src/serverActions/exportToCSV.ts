"use server";

import { prisma } from "@/lib/prisma";
import { personType } from "@/lib/zodValidators";
import { Location, WeatherConditions } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

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

const exportRegistrationData = async (locationsIds: number[]) => {
  const locations = await prisma.location.findMany({
    where: {
      id: {
        in: locationsIds,
      },
    },
  });
  locations.sort((a, b) => {
    if (a.name < b.name) return -1;
    else {
      if (a.name > b.name) return 1;
      else return 0;
    }
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

const exportEvaluation = async (responsesWithType: FetchedSubmission[]) => {
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
      const sortedGroupedDataByLocationDateUser: {
        [
          key: string
        ]: (typeof groupedDataByLocationDateUser)[keyof typeof groupedDataByLocationDateUser];
      } = {};

      Object.keys(groupedDataByLocationDateUser)
        .sort()
        .forEach((key) => {
          const currentGroup = groupedDataByLocationDateUser[key];
          if (currentGroup)
            sortedGroupedDataByLocationDateUser[key] = currentGroup;
        });
      for (const key in sortedGroupedDataByLocationDateUser) {
        const groupedData = sortedGroupedDataByLocationDateUser[key];
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
) => {
  const locationObjs = await prisma.location.findMany({
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

  locationObjs.sort((a, b) => {
    if (a.name < b.name) return -1;
    else {
      if (a.name > b.name) return 1;
      else return 0;
    }
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

const exportDailyTallysFromSingleLocation = async (tallysIds: number[]) => {
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
    if (a.location.name < b.location.name) return -1;
    else {
      if (a.location.name > b.location.name) return 1;
      else return 0;
    }
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
const exportAllIndividualTallysToCsv = async (locationsIds: number[]) => {
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
  return createTallyStringWithoutAddedData(allTallys);
};

const exportIndividualTallysToCSV = async (tallysIds: number[]) => {
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

  return createTallyStringWithoutAddedData(tallys);
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
  totalPeople = Number(tallyMap.get("Tot-H&M"));
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
) => {
  tallys = tallys.sort((a, b) => {
    if (a.location.name < b.location.name) return -1;
    else {
      if (a.location.name > b.location.name) return 1;
      else return 0;
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
        totalPeople = Number(tallyMap.get("Tot-H&M"));
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
