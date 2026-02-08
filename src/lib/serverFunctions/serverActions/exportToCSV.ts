"use server";

import {
  dateFormatter,
  hourFormatter,
  weekdayFormatter,
} from "@/lib/formatters/dateFormatters";
import { prisma } from "@/lib/prisma";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import { QuestionTypes } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import {
  createTallyStringWithoutAddedData,
  processAndFormatTallyDataLineWithAddedContent,
} from "@serverOnly/exportToCSV";
import {
  Tally,
  locationArrayExportDailyTallysSchema,
  tallyArraySchema,
} from "@zodValidators";

type AssessmentExportSubcategoryItem = {
  id: number;
  subcategoryId: number;
  name: string;
  position: number;
  questions: AssessmentExportQuestionItem[];
};
type AssessmentExportQuestionItem = {
  id: number;
  questionId: number;
  name: string;
  position: number;
  questionType: QuestionTypes;
};

type AssessmentExportCategoryItem = {
  id: number;
  categoryId: number;
  name: string;
  position: number;
  categoryChildren: (
    | AssessmentExportQuestionItem
    | AssessmentExportSubcategoryItem
  )[];
};

// Function to format a field for CSV
const formatCSVField = (val?: string | null) => {
  if (val === null || val === undefined) return "";

  let str = String(val);

  // If the field contains a comma, quotation marks, or a line break, we need to escape it
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    // Duplicate the existing quotation marks and wrap the entire field in quotation marks
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const _exportRegistrationData = async (locationsIds: number[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
  } catch (e) {
    return {
      statusCode: 401,
      CSVstring: null,
    };
  }
  try {
    const locations = await prisma.location.findMany({
      where: {
        id: {
          in: locationsIds,
        },
      },
      include: {
        category: true,
        type: true,
        city: {
          select: {
            name: true,
            state: true,
          },
        },
        narrowAdministrativeUnit: {
          select: {
            name: true,
          },
        },
        intermediateAdministrativeUnit: {
          select: {
            name: true,
          },
        },
        broadAdministrativeUnit: {
          select: {
            name: true,
          },
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
    let CSVstring = "IDENTIFICAÇÃO PRAÇA,,,,,,,DADOS HISTÓRICOS,,,\n";
    CSVstring += ",,,,,,,,,,\n";
    CSVstring +=
      "Identificador,Nome da Praça,Nome popular,Categoria,Tipo,Observações,Endereço,Ano criação,Ano reforma,Legislação\n";
    CSVstring += locations
      .map((location) => {
        const locationString = [
          location.id,
          formatCSVField(location.name),
          formatCSVField(location.popularName),
          formatCSVField(location.category?.name),
          formatCSVField(location?.type?.name),
          formatCSVField(location.notes),
          formatCSVField(
            `${location.firstStreet}${location.secondStreet ? " / " + location.secondStreet : ""}${location.thirdStreet ? " / " + location.thirdStreet : ""}${location.fourthStreet ? " / " + location.fourthStreet : ""}${location.broadAdministrativeUnit ? " - " + location.broadAdministrativeUnit.name : ""}${location.intermediateAdministrativeUnit ? " - " + location.intermediateAdministrativeUnit.name : ""}${location.narrowAdministrativeUnit ? " - " + location.narrowAdministrativeUnit.name : ""} - ${location.city.name} - ${location.city.state}`,
          ),
          location.creationYear,
          location.lastMaintenanceYear,
          location.legislation,
        ].join(",");

        return locationString;
      })
      .join("\n");

    return { statusCode: 200, CSVstring };
  } catch (e) {
    return { statusCode: 500, CSVstring: null };
  }
};

export const _exportAssessments = async (assessmentIds: number[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
  } catch (e) {
    return { statusCode: 401, csvObjs: [] };
  }

  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        id: {
          in: assessmentIds,
        },
      },
      orderBy: [{ id: "asc" }, { startDate: "asc" }],
      select: {
        id: true,
        endDate: true,
        startDate: true,
        user: {
          select: {
            username: true,
            id: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        form: {
          select: {
            id: true,
            name: true,
            calculations: {
              select: {
                expression: true,
                targetQuestionId: true,
              },
            },
            formItems: {
              orderBy: { position: "asc" },
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    notes: true,
                  },
                },
                subcategory: {
                  select: {
                    id: true,
                    name: true,
                    notes: true,
                    categoryId: true,
                  },
                },
                question: {
                  select: {
                    id: true,
                    name: true,
                    notes: true,
                    questionType: true,
                    characterType: true,
                    optionType: true,
                    options: { select: { text: true, id: true } },
                    categoryId: true,
                    subcategoryId: true,
                    geometryTypes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const responses = await prisma.response.findMany({
      where: {
        assessmentId: { in: assessmentIds },
      },
      select: {
        id: true,
        questionId: true,
        assessmentId: true,
        response: true,
      },
    });

    const responsesOptions = await prisma.responseOption.findMany({
      where: {
        assessmentId: { in: assessmentIds },
      },
      select: {
        id: true,
        questionId: true,
        assessmentId: true,
        option: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });

    const forms = new Map<number, string>();

    assessments.forEach((assessment) =>
      forms.set(assessment.form.id, assessment.form.name),
    );

    const categoriesByFormId = new Map<
      number,
      AssessmentExportCategoryItem[]
    >();

    //TODO: CHANGE TO EXPORT MULTIPLE TABLES, ONE FOR EACH FORM MODEL

    for (const assessment of assessments) {
      const form = assessment.form;
      if (categoriesByFormId.has(form.id)) {
        continue;
      }
      const categories: AssessmentExportCategoryItem[] = [];

      const sortedFormItems = form.formItems.sort((a, b) => {
        const rankDiff =
          FormItemUtils.getItemRankForSorting(a) -
          FormItemUtils.getItemRankForSorting(b);
        if (rankDiff !== 0) return rankDiff;

        return a.position - b.position;
      });

      for (const item of sortedFormItems) {
        // CATEGORY
        if (FormItemUtils.isCategoryType(item)) {
          if (!categories.find((c) => c.categoryId === item.categoryId)) {
            categories.push({
              id: item.id,
              categoryId: item.categoryId,
              name: item.category.name,
              position: item.position,
              categoryChildren: [],
            });
          }
          continue;
        }

        // SUBCATEGORY
        else if (FormItemUtils.isSubcategoryType(item)) {
          const dbSubcategory = item.subcategory;
          if (!dbSubcategory) {
            throw new Error("Subcategory form item without subcategory data");
          }
          const category = categories.find(
            (c) => c.categoryId === dbSubcategory.categoryId,
          );
          if (!category) {
            throw new Error("Subcategory's category not found");
          }

          let subcategory = category.categoryChildren.find(
            (c): c is AssessmentExportSubcategoryItem =>
              FormItemUtils.isSubcategoryType(c) &&
              c.subcategoryId === item.subcategoryId,
          );

          if (!subcategory) {
            subcategory = {
              id: item.id,
              position: item.position,
              subcategoryId: item.subcategoryId,
              name: dbSubcategory.name,
              questions: [],
            };
            category.categoryChildren.push(subcategory);
          }
          continue;
        }

        // QUESTION
        else if (FormItemUtils.isQuestionType(item)) {
          const dbQuestion = item.question;
          if (!dbQuestion) {
            throw new Error("Question form item without question data");
          }

          const question: AssessmentExportQuestionItem = {
            id: item.id,
            position: item.position,
            questionId: item.questionId,
            name: dbQuestion.name,
            questionType: dbQuestion.questionType,
          };
          const category = categories.find(
            (c) => c.categoryId === dbQuestion.categoryId,
          );
          if (!category) {
            throw new Error("Question's category not found");
          }

          if (dbQuestion.subcategoryId) {
            // question is inserted in a subcategory
            const subcategory = category.categoryChildren.find(
              (c): c is AssessmentExportSubcategoryItem =>
                FormItemUtils.isSubcategoryType(c) &&
                c.subcategoryId === dbQuestion.subcategoryId,
            );
            if (subcategory) {
              subcategory.questions.push(question);
            }
          } else {
            // question inserted directly in category
            category.categoryChildren.push(question);
          }
          continue;
        }
      }

      // Sorting by position
      categories.sort((a, b) => a.position - b.position);
      categories.forEach((cat) => {
        cat.categoryChildren.sort((a, b) => a.position - b.position);
        cat.categoryChildren.forEach((child) => {
          if (FormItemUtils.isSubcategoryType(child))
            child.questions.sort((a, b) => a.position - b.position);
        });
      });

      categoriesByFormId.set(form.id, categories);
    }

    const csvObjs: {
      formName: string;
      csvString: string;
    }[] = [];
    // Here we create the one CSV per form, with all the assessments that were made with that form, and the same structure of categories, subcategories and questions as defined in the form model
    for (const formId of forms.keys()) {
      const categories = categoriesByFormId.get(formId);
      if (!categories) {
        throw new Error("Form structure not found for form id " + formId);
      }

      let CSVHeader =
        "Identificador da praça,Nome da praça,Identificador da avaliação,Avaliador,Dia,Data,Horário,Duração (minutos)";

      for (const category of categories) {
        // Here we create the first line of the CSV: categories
        for (const child of category.categoryChildren) {
          if (FormItemUtils.isSubcategoryType(child)) {
            child.questions.forEach(() => {
              CSVHeader += `,${category.name}`;
            });
          } else {
            CSVHeader += `,${category.name}`;
          }
        }
      }
      CSVHeader += "\n,,,,,,,";
      for (const category of categories) {
        // Here we create the second line of the CSV: subcategories
        for (const child of category.categoryChildren) {
          if (FormItemUtils.isSubcategoryType(child)) {
            child.questions.forEach(() => {
              CSVHeader += `,${child.name}`;
            });
          } else {
            CSVHeader += `,`;
          }
        }
      }
      CSVHeader += "\n,,,,,,,";
      for (const category of categories) {
        // Here we create the third line of the CSV: questions
        for (const child of category.categoryChildren) {
          if (FormItemUtils.isSubcategoryType(child)) {
            for (const question of child.questions) {
              CSVHeader += `,${question.name}`;
            }
          } else {
            CSVHeader += `,${child.name}`;
          }
        }
      }

      let CSVAssessments = "";
      for (const assessment of assessments) {
        if (assessment.form.id !== formId) {
          continue;
        }
        // General data of the assessment
        CSVAssessments += `\n${assessment.location.id},${assessment.location.name},${assessment.id},${assessment.user.username},${weekdayFormatter.format(assessment.startDate)},${dateFormatter.format(assessment.startDate)},${hourFormatter.format(assessment.startDate)},${assessment.endDate ? (assessment.endDate.getTime() - assessment.startDate.getTime()) / 60000 : "Não finalizada!"}`;
        // Responses of the assessment
        for (const category of categories) {
          for (const child of category.categoryChildren) {
            if (FormItemUtils.isSubcategoryType(child)) {
              for (const question of child.questions) {
                let responseValue = "";
                if (question.questionType === "WRITTEN") {
                  responseValue =
                    responses.find(
                      (r) =>
                        r.assessmentId === assessment.id &&
                        r.questionId === question.questionId,
                    )?.response || "";
                } else if (question.questionType === "OPTIONS") {
                  responseValue =
                    responsesOptions
                      .filter(
                        (r) =>
                          r.assessmentId === assessment.id &&
                          r.questionId === question.questionId,
                      )
                      .map((r) => r.option?.text)
                      .join(" / ") || "";
                }
                CSVAssessments += `,${formatCSVField(responseValue)}`;
              }
            } else if (FormItemUtils.isQuestionType(child)) {
              let responseValue = "";
              if (child.questionType === "WRITTEN") {
                responseValue =
                  responses.find(
                    (r) =>
                      r.assessmentId === assessment.id &&
                      r.questionId === child.questionId,
                  )?.response || "";
              } else if (child.questionType === "OPTIONS") {
                responseValue =
                  responsesOptions.find(
                    (r) =>
                      r.assessmentId === assessment.id &&
                      r.questionId === child.questionId,
                  )?.option?.text || "";
              }
              CSVAssessments += `,${formatCSVField(responseValue)}`;
            }
          }
        }
      }

      const CSVresult = CSVHeader + CSVAssessments;

      csvObjs.push({
        formName: forms.get(formId) || "Formulário sem nome",
        csvString: CSVresult,
      });
    }

    return {
      statusCode: 200,
      csvObjs: csvObjs,
    };
  } catch (e) {
    return { statusCode: 500, csvObjs: [] };
  }
};

const _exportDailyTallys = async (
  locationIds: number[],
  tallysIds: number[],
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return { statusCode: 401, CSVstringWeekdays: [], CSVstringWeekendDays: [] };
  }

  try {
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
            user: {
              select: {
                username: true,
              },
            },
            location: true,
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

    const parsedLocationObjs =
      locationArrayExportDailyTallysSchema.safeParse(locationObjs);
    if (!parsedLocationObjs.success) {
      return {
        statusCode: 400,
        CSVstringWeekdays: [],
        CSVstringWeekendDays: [],
      };
    }

    let maxWeekdays = 0;
    let maxWeekendDays = 0;
    const locationsWithTallyGroupsByDate = parsedLocationObjs.data.map(
      (location) => {
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
        const weekendDays =
          tallyGroupsByDateAndDayClassication.weekendDays.length;
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
      },
    );
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
          const tallys: Tally[] = [];
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
          const tallys: Tally[] = [];
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
      statusCode: 200,
      CSVstringWeekdays,
      CSVstringWeekendDays,
    };
  } catch (e) {
    return { statusCode: 500, CSVstringWeekdays: [], CSVstringWeekendDays: [] };
  }
};

const _exportDailyTallysFromSingleLocation = async (tallysIds: number[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return { statusCode: 401, CSVstring: null };
  }

  const unparsedTallys = await prisma.tally.findMany({
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
        },
      },
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  const parsedTallys = tallyArraySchema.safeParse(unparsedTallys);

  if (!parsedTallys.success) {
    return { statusCode: 400, CSVstring: "" };
  }

  let tallys = parsedTallys.data;

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
  let index = 0;
  for (const tally of tallys) {
    if (!tallyGroupsByLocation[index]) {
      tallyGroupsByLocation[index] = [];
    }
    const currentGroup = tallyGroupsByLocation[index];
    if (currentGroup) {
      currentGroup.push(tally);
    }
    index++;
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

  return { statusCode: 200, CSVstring };
};

//This function below is used to export tally content without combining data. It uses old spreadsheet formation.

const _exportIndividualTallysToCSV = async (tallysIds: number[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return { statusCode: 401, CSVstring: null };
  }

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
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  const parsedTallys = tallyArraySchema.safeParse(tallys);
  if (!parsedTallys.success) {
    return { statusCode: 400, CSVstring: "" };
  }

  const CSVstring = createTallyStringWithoutAddedData(parsedTallys.data);

  return { statusCode: 200, CSVstring };
};

export {
  _exportIndividualTallysToCSV,
  _exportDailyTallys,
  _exportDailyTallysFromSingleLocation,
  _exportRegistrationData,
};
