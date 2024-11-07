"use server";

import { prisma } from "@/lib/prisma";
import { personType } from "@/lib/zodValidators";
import { CalculationTypes, WeatherConditions } from "@prisma/client";
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

const fetchAssessmentsForEvaluationExport = async (
  assessmentsIds: number[],
) => {
  const assessments = await prisma.assessment.findMany({
    where: {
      id: {
        in: assessmentsIds,
      },
    },
    include: {
      location: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      form: {
        select: {
          id: true,
          name: true,
          version: true,
          calculations: {
            include: {
              category: true,
              questions: {
                select: {
                  id: true,
                },
              },
              subcategory: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },
      response: {
        include: {
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
      },
      responseOption: {
        include: {
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
      },
    },
  });

  return assessments;
};

const exportEvaluation = async (assessmentsIds: number[]) => {
  const assessments = await fetchAssessmentsForEvaluationExport(assessmentsIds);

  // Grouping by form and formVersion. Each group will form a different table.

  const groupedByFormAndFormVersion: {
    [key: number]: {
      form: { id: number; name: string; version: number };
      assessments: {
        id: number;
        startDate: Date;
        user: { id: string; username: string };
        location: {
          id: number;
          name: string;
        };
        categories: {
          id: number;
          name: string;
          questions: {
            id: number;
            name: string;
            responses: (string | null | undefined)[];
          }[];
          calculations: {
            id: number;
            name: string;
            type: CalculationTypes;
            questionsIds: number[];
          }[];
          subcategories: {
            id: number;
            name: string;
            questions: {
              id: number;
              name: string;
              responses: (string | null | undefined)[];
            }[];
            calculations: {
              id: number;
              name: string;
              type: CalculationTypes;
              questionsIds: number[];
            }[];
          }[];
        }[];
      }[];
    };
  } = {};
  for (const assessment of assessments) {
    const key = assessment.form.id;
    if (!groupedByFormAndFormVersion[key]) {
      groupedByFormAndFormVersion[key] = {
        form: assessment.form,
        assessments: [],
      };
    }
    const currentTable = groupedByFormAndFormVersion[assessment.formId];

    if (!currentTable?.assessments.some((a) => a.id === assessment.id)) {
      currentTable?.assessments.push({
        id: assessment.id,
        startDate: assessment.startDate,
        user: { id: assessment.user.id, username: assessment.user.username },
        location: {
          id: assessment.location.id,
          name: assessment.location.name,
        },
        categories: [],
      });
    }

    const currentTableAssessment = currentTable?.assessments.find(
      (a) => a.id === assessment.id,
    );
    if (currentTableAssessment) {
      assessment.response.forEach((response) => {
        const questionCategory = response.question.category;
        if (
          !currentTableAssessment.categories.some(
            (c) => c.id === questionCategory.id,
          )
        ) {
          currentTableAssessment.categories.push({
            id: questionCategory.id,
            name: questionCategory.name,
            questions: [],
            subcategories: [],
            calculations: [],
          });
        }
        const currentTableAssessmentCategory =
          currentTableAssessment.categories.find(
            (c) => c.id === questionCategory.id,
          );
        if (!response.question.subcategory) {
          if (currentTableAssessmentCategory) {
            if (
              !currentTableAssessmentCategory.questions.some(
                (q) => q.id === response.question.id,
              )
            ) {
              currentTableAssessmentCategory.questions.push({
                id: response.question.id,
                name: response.question.name,
                responses: [],
              });
            }
            const currentTableAssessmentCategoryQuestion =
              currentTableAssessmentCategory.questions.find(
                (q) => q.id === response.question.id,
              );
            currentTableAssessmentCategoryQuestion?.responses.push(
              response.response,
            );
          }
          if (
            !currentTableAssessmentCategory?.calculations.some(
              (c) => c.id === response.question.id,
            ) &&
            assessment.form.calculations.some(
              (c) =>
                c.categoryId === response.question.categoryId &&
                !c.subcategoryId,
            )
          ) {
            currentTableAssessmentCategory?.calculations.push(
              ...assessment.form.calculations
                .filter((c) => c.categoryId === response.question.categoryId)
                .map((c) => ({
                  id: c.id,
                  name: c.name,
                  type: c.type,
                  questionsIds: c.questions.map((q) => q.id),
                })),
            );
          }
        } else {
          if (currentTableAssessmentCategory) {
            if (
              !currentTableAssessmentCategory.subcategories.some(
                (s) => s.id === response.question.subcategoryId,
              )
            ) {
              currentTableAssessmentCategory.subcategories.push({
                id: response.question.subcategory.id,
                name: response.question.subcategory.name,
                questions: [],
                calculations: [],
              });
            }
            const currentTableAssessmentCategorySubcategory =
              currentTableAssessmentCategory.subcategories.find(
                (s) => s.id === response.question.subcategoryId,
              );
            if (currentTableAssessmentCategorySubcategory) {
              if (
                !currentTableAssessmentCategorySubcategory.questions.some(
                  (q) => q.id === response.question.id,
                )
              ) {
                currentTableAssessmentCategorySubcategory.questions.push({
                  id: response.question.id,
                  name: response.question.name,
                  responses: [],
                });
              }
            }
            const currentTableAssessmentCategorySubcategoryQuestion =
              currentTableAssessmentCategorySubcategory?.questions.find(
                (q) => q.id === response.questionId,
              );
            currentTableAssessmentCategorySubcategoryQuestion?.responses.push(
              response.response,
            );
            if (
              !currentTableAssessmentCategory?.calculations.some(
                (c) => c.id === response.question.id,
              ) &&
              assessment.form.calculations.some(
                (c) =>
                  c.categoryId === response.question.categoryId &&
                  !c.subcategoryId,
              )
            ) {
              currentTableAssessmentCategory?.calculations.push(
                ...assessment.form.calculations
                  .filter((c) => c.categoryId === response.question.categoryId)
                  .map((c) => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    questionsIds: c.questions.map((q) => q.id),
                  })),
              );
            }
          }
        }
      });

      assessment.responseOption.forEach((response) => {
        const questionCategory = response.question.category;
        if (
          !currentTableAssessment.categories.some(
            (c) => c.id === questionCategory.id,
          )
        ) {
          currentTableAssessment.categories.push({
            id: questionCategory.id,
            name: questionCategory.name,
            questions: [],
            subcategories: [],
            calculations: [],
          });
        }
        const currentTableAssessmentCategory =
          currentTableAssessment.categories.find(
            (c) => c.id === questionCategory.id,
          );
        if (!response.question.subcategory) {
          if (currentTableAssessmentCategory) {
            if (
              !currentTableAssessmentCategory.questions.some(
                (q) => q.id === response.question.id,
              )
            ) {
              currentTableAssessmentCategory.questions.push({
                id: response.question.id,
                name: response.question.name,
                responses: [],
              });
            }
            const currentTableAssessmentCategoryQuestion =
              currentTableAssessmentCategory.questions.find(
                (q) => q.id === response.question.id,
              );
            currentTableAssessmentCategoryQuestion?.responses.push(
              response.option?.text,
            );
            if (
              !currentTableAssessmentCategory?.calculations.some(
                (c) => c.id === response.question.id,
              ) &&
              assessment.form.calculations.some(
                (c) =>
                  c.categoryId === response.question.categoryId &&
                  !c.subcategoryId,
              )
            ) {
              currentTableAssessmentCategory?.calculations.push(
                ...assessment.form.calculations
                  .filter((c) => c.categoryId === response.question.categoryId)
                  .map((c) => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    questionsIds: c.questions.map((q) => q.id),
                  })),
              );
            }
          }
        } else {
          if (currentTableAssessmentCategory) {
            if (
              !currentTableAssessmentCategory.subcategories.some(
                (s) => s.id === response.question.subcategoryId,
              )
            ) {
              currentTableAssessmentCategory.subcategories.push({
                id: response.question.subcategory.id,
                name: response.question.subcategory.name,
                questions: [],
                calculations: [],
              });
            }
            const currentTableAssessmentCategorySubcategory =
              currentTableAssessmentCategory.subcategories.find(
                (s) => s.id === response.question.subcategoryId,
              );
            if (currentTableAssessmentCategorySubcategory) {
              if (
                !currentTableAssessmentCategorySubcategory.questions.some(
                  (q) => q.id === response.question.id,
                )
              ) {
                currentTableAssessmentCategorySubcategory.questions.push({
                  id: response.question.id,
                  name: response.question.name,
                  responses: [],
                });
              }
            }
            const currentTableAssessmentCategorySubcategoryQuestion =
              currentTableAssessmentCategorySubcategory?.questions.find(
                (q) => q.id === response.questionId,
              );
            currentTableAssessmentCategorySubcategoryQuestion?.responses.push(
              response.option?.text,
            );
            if (
              !currentTableAssessmentCategory?.calculations.some(
                (c) => c.id === response.question.id,
              ) &&
              assessment.form.calculations.some(
                (c) =>
                  c.categoryId === response.question.categoryId &&
                  !c.subcategoryId,
              )
            ) {
              currentTableAssessmentCategory?.calculations.push(
                ...assessment.form.calculations
                  .filter((c) => c.categoryId === response.question.categoryId)
                  .map((c) => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    questionsIds: c.questions.map((q) => q.id),
                  })),
              );
            }
          }
        }
      });

      console.log(currentTableAssessment.categories[0]?.calculations);
    }
  }

  const csvObjs: {
    formName: string;
    formVersion: number;
    csvString: string;
  }[] = [];
  for (const key in groupedByFormAndFormVersion) {
    const currentGroup = groupedByFormAndFormVersion[key];
    if (currentGroup) {
      const currentGroupAssessments = currentGroup.assessments;
      const currentGroupform = currentGroup.form;

      const categoryLine = `IDENTIFICAÇÃO DA PRAÇA,,IDENTIFICAÇÃO DO LEVANTAMENTO,,,,${Object.values(
        currentGroupAssessments[0]!.categories,
      )
        .map((category) => {
          const fillCount =
            category.questions.length + category.calculations.length;
          return Array(
            fillCount +
              category.subcategories.reduce(
                (sum, subcategory) =>
                  sum +
                  subcategory.questions.length +
                  subcategory.calculations.length,
                0,
              ),
          )
            .fill(category.name)
            .join(",");
        })
        .join(",")}`;

      const subcategoryLine = currentGroupAssessments[0]!.categories
        .map((category) => {
          const blankColumns = Array(category.questions.length)
            .fill("")
            .join(",");

          const subcategoryColumns = category.subcategories
            .map((subcategory) => {
              const fillCount =
                subcategory.questions.length + subcategory.calculations.length;
              return Array(fillCount).fill(subcategory.name).join(",");
            })
            .join(",");

          return `${subcategoryColumns ? `${subcategoryColumns},${blankColumns}` : `${blankColumns}`}`;
        })
        .join(",");
      const questionsStr = currentGroupAssessments[0]?.categories
        .map((category) => {
          const subcategoriesResponses = category.subcategories
            .map((subcategory) => {
              const questions = subcategory.questions
                .map((question) => {
                  return question.name;
                })
                .join(",");

              const subcategoryCalculations = subcategory.calculations
                .map((calculation) => {
                  return calculation.name;
                })
                .join(",");
              if (subcategoryCalculations.length > 0)
                return `${questions},${subcategoryCalculations}`;
              return `${questions}`;
            })
            .join(",");
          const categoryResponses = category.questions
            .map((question) => {
              return question.name;
            })
            .join(",");
          const categoryCalculations = category.calculations
            .map((calculation) => {
              return calculation.name;
            })
            .join(",");
          if (categoryCalculations.length > 0)
            return `${subcategoriesResponses},${categoryResponses},${categoryCalculations}`;
          return `${subcategoriesResponses},${categoryResponses}`;
        })
        .join(",");
      const questionLine = `Identificador,Nome da praça,Avaliador,Dia,Data,Horário,${questionsStr}`;

      let csvContent = `${categoryLine}\n,,,,,,${subcategoryLine}\n${questionLine}\n`;

      for (const assessment of currentGroup.assessments) {
        const responseValues = assessment.categories
          .map((category) => {
            const subcategoriesResponses = category.subcategories
              .map((subcategory) => {
                return subcategory.questions
                  .map((question) => {
                    return question.responses
                      .map((response) => (response ? response : ""))
                      .join(",");
                  })
                  .join(",");
              })
              .join(",");
            const categoryResponses = category.questions
              .map((question) => {
                return question.responses
                  .map((response) => (response ? response : ""))
                  .join(",");
              })
              .join(",");
            const categoryCalculations = category.calculations
              .map((calculation) => {
                const calculationQuestions = [
                  ...category.questions.filter((q) =>
                    calculation.questionsIds.includes(q.id),
                  ),
                  ...category.subcategories.flatMap((s) =>
                    s.questions.filter((q) =>
                      calculation.questionsIds.includes(q.id),
                    ),
                  ),
                ];
                if (calculation.type === "AVERAGE") {
                  const sum = calculationQuestions.reduce((acc, q) => {
                    return (
                      acc +
                      Number(
                        q.responses.reduce((acc2, r) => {
                          const num = r && !isNaN(Number(r)) ? Number(r) : 0;
                          return acc2 + num;
                        }, 0),
                      )
                    );
                  }, 0);

                  const numberOfResponses = calculationQuestions.reduce(
                    (acc, q) => {
                      return acc + q.responses.length;
                    },
                    0,
                  );
                  return sum / numberOfResponses;
                } else if (calculation.type === "SUM") {
                  return calculationQuestions.reduce((acc, q) => {
                    return (
                      acc +
                      Number(
                        q.responses.reduce((acc2, r) => {
                          const num = r && !isNaN(Number(r)) ? Number(r) : 0;
                          return acc2 + num;
                        }, 0),
                      )
                    );
                  }, 0);
                } else {
                  //TODO - PERCENTAGE
                }

                return 0;
              })
              .join(",");
            return `${subcategoriesResponses},${categoryResponses},${categoryCalculations}`;
          })
          .join(",");
        csvContent += `${assessment.location.id},${assessment.location.name},${assessment.user.username},${assessment.startDate.toLocaleString("pt-BR", { weekday: "short" })},${assessment.startDate.toLocaleDateString()},${assessment.startDate.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })},${responseValues}\n`;
      }

      csvObjs.push({
        formName: currentGroupform.name,
        formVersion: currentGroupform.version,
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
