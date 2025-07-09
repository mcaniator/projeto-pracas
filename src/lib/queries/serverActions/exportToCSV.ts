"use server";

import { prisma } from "@/lib/prisma";
import { personType } from "@/lib/zodValidators";
import { checkIfLoggedInUserHasAnyPermission } from "@lib/queries/serverOnly/checkPermission";
import {
  createTallyStringWithoutAddedData,
  fetchAssessmentsForEvaluationExport,
  processAndFormatTallyDataLineWithAddedContent,
} from "@lib/queries/serverOnly/exportToCSV";
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
    username: string | null;
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
    username: string | null;
  };
  animalsAmount: number | null;
  groups: number | null;
  temperature: number | null;
  weatherCondition: WeatherConditions | null;
  commercialActivities: JsonValue | null;
  locationId: number;
  tallyPerson: TallyPerson[];
}

const exportRegistrationData = async (locationsIds: number[]) => {
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
        const locationString = [
          location.id,
          location.name,
          location.popularName ? location.popularName : "",
          location.category?.name ?? "",
          location?.type?.name ?? "",
          location.notes ?? "",
          `${location.firstStreet}${location.secondStreet ? " / " + location.secondStreet : ""}${location.thirdStreet ? " / " + location.thirdStreet : ""}${location.fourthStreet ? " / " + location.fourthStreet : ""}`,
          location.creationYear,
          location.lastMaintenanceYear,
          location.overseeingMayor,
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

const exportEvaluation = async (assessmentsIds: number[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
  } catch (e) {
    return { statusCode: 401, csvObjs: [] };
  }

  try {
    const assessments =
      await fetchAssessmentsForEvaluationExport(assessmentsIds);

    // Grouping by form and formVersion. Each group will form a different table.

    const groupedByFormAndFormVersion: {
      [key: number]: {
        form: { id: number; name: string; version: number };
        categoriesWithCalculations: {
          id: number;
          name: string;
          calculations: {
            id: number;
            name: string;
            type: CalculationTypes;
            questions: { id: number; name: string }[];
          }[];
          subcategories: {
            id: number;
            name: string;
            calculations: {
              id: number;
              name: string;
              type: CalculationTypes;
              questions: { id: number; name: string }[];
            }[];
          }[];
        }[];
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

            subcategories: {
              id: number;
              name: string;
              questions: {
                id: number;
                name: string;
                responses: (string | null | undefined)[];
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
          categoriesWithCalculations: [],
        };
      }
      const currentTable = groupedByFormAndFormVersion[assessment.formId];

      if (!currentTable?.assessments.some((a) => a.id === assessment.id)) {
        currentTable?.assessments.push({
          id: assessment.id,
          startDate: assessment.startDate,
          user: {
            id: assessment.user.id,
            username: assessment.user.username ?? "Indefinido",
          },
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
            }
          }
        });
      }
    }

    const formsCalculations = assessments.reduce(
      (acc, assessment) => {
        const existingForm = acc.find((a) => a.formId === assessment.formId);
        if (existingForm) {
          return acc;
        }

        const newForm = { formId: assessment.formId, categories: [] } as {
          formId: number;
          categories: {
            id: number;
            name: string;
            calculations: {
              id: number;
              name: string;
              type: CalculationTypes;
              questions: { id: number; name: string }[];
            }[];

            subcategories: {
              id: number;
              name: string;
              calculations: {
                id: number;
                name: string;
                type: CalculationTypes;
                questions: { id: number; name: string }[];
              }[];
            }[];
          }[];
        };

        for (const calculation of assessment.form.calculations) {
          if (
            !newForm.categories.some((cat) => cat.id === calculation.categoryId)
          ) {
            newForm.categories.push({
              id: calculation.categoryId,
              name: calculation.category.name,
              calculations: [] as {
                id: number;
                name: string;
                type: CalculationTypes;
                questions: { id: number; name: string }[];
              }[],
              subcategories: [] as {
                id: number;
                name: string;
                calculations: {
                  id: number;
                  name: string;
                  type: CalculationTypes;
                  questions: { id: number; name: string }[];
                }[];
              }[],
            });
          }
          if (!calculation.subcategoryId) {
            newForm.categories
              .find((cat) => cat.id === calculation.categoryId)
              ?.calculations.push({
                id: calculation.id,
                name: calculation.name,
                type: calculation.type,
                questions: calculation.questions.map((q) => ({
                  id: q.id,
                  name: q.name,
                })),
              });
          } else {
            const calculationCategory = newForm.categories.find(
              (cat) => cat.id === calculation.categoryId,
            );
            if (
              !calculationCategory?.subcategories.some(
                (sub) => sub.id === calculation.subcategoryId,
              )
            ) {
              calculationCategory?.subcategories.push({
                id: calculation.subcategoryId,
                name: calculation.subcategory!.name,
                calculations: [] as {
                  id: number;
                  name: string;
                  type: CalculationTypes;
                  questions: { id: number; name: string }[];
                }[],
              });
            }
            calculationCategory?.subcategories
              .find((sub) => sub.id === calculation.subcategoryId)
              ?.calculations.push({
                id: calculation.id,
                name: calculation.name,
                type: calculation.type,
                questions: calculation.questions.map((q) => ({
                  id: q.id,
                  name: q.name,
                })),
              });
          }
        }

        acc.push(newForm);
        return acc;
      },
      [] as {
        formId: number;
        categories: {
          id: number;
          name: string;
          calculations: {
            id: number;
            name: string;
            type: CalculationTypes;
            questions: { id: number; name: string }[];
          }[];

          subcategories: {
            id: number;
            name: string;
            calculations: {
              id: number;
              name: string;
              type: CalculationTypes;
              questions: { id: number; name: string }[];
            }[];
          }[];
        }[];
      }[],
    );

    for (const key in groupedByFormAndFormVersion) {
      const currentGroup = groupedByFormAndFormVersion[key];
      const currentFormCalculation = formsCalculations.find(
        (f) => f.formId === Number(key),
      );
      if (currentGroup && currentFormCalculation)
        currentGroup.categoriesWithCalculations =
          currentFormCalculation.categories;
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
        const currentGroupCategoriesWithCalculations =
          currentGroup.categoriesWithCalculations;
        const categoryLine = `IDENTIFICAÇÃO DA PRAÇA,,IDENTIFICAÇÃO DO LEVANTAMENTO,,,,${Object.values(
          currentGroupAssessments[0]!.categories,
        )
          .map((category) => {
            const currentCategoryCalculations =
              currentGroupCategoriesWithCalculations.find(
                (c) => c.id === category.id,
              );
            const fillCount =
              category.questions.length +
              (currentCategoryCalculations?.calculations.reduce((sum, calc) => {
                if (calc.type === "PERCENTAGE") {
                  return sum + calc.questions.length;
                }
                return (sum += 1);
              }, 0) || 0);

            return Array(
              fillCount +
                category.subcategories.reduce(
                  (sum, subcategory) => {
                    return sum + subcategory.questions.length;
                  },

                  0,
                ) +
                (currentCategoryCalculations?.subcategories.reduce(
                  (sum, subcategory) => {
                    return (
                      sum +
                      subcategory.calculations.reduce((sum, calc) => {
                        if (calc.type === "PERCENTAGE") {
                          return sum + calc.questions.length;
                        }
                        return (sum += 1);
                      }, 0)
                    );
                  },
                  0,
                ) || 0),
            )
              .fill(category.name)
              .join(",");
          })
          .join(",")}`;

        const subcategoryLine = currentGroupAssessments[0]!.categories
          .map((category) => {
            const currentCategoryCalculations =
              currentGroupCategoriesWithCalculations.find(
                (c) => c.id === category.id,
              );

            const blankColumns = Array(
              category.questions.length +
                (currentCategoryCalculations?.calculations.reduce(
                  (sum, calc) => {
                    if (calc.type === "PERCENTAGE") {
                      return sum + calc.questions.length;
                    }
                    return (sum += 1);
                  },
                  0,
                ) || 0),
            )
              .fill("")
              .join(",");

            const subcategoryColumns = category.subcategories
              .map((subcategory) => {
                const currentSubcategoryCalculations =
                  currentCategoryCalculations?.subcategories.find(
                    (s) => s.id === subcategory.id,
                  );

                const fillCount =
                  subcategory.questions.length +
                  (currentSubcategoryCalculations?.calculations.reduce(
                    (sum, calc) => {
                      if (calc.type === "PERCENTAGE") {
                        return sum + calc.questions.length;
                      }
                      return (sum += 1);
                    },
                    0,
                  ) || 0);
                return Array(fillCount).fill(subcategory.name).join(",");
              })
              .join(",");

            return `${subcategoryColumns ? `${subcategoryColumns},${blankColumns}` : `${blankColumns}`}`;
          })
          .join(",");
        const questionsStr = currentGroupAssessments[0]?.categories
          .map((category) => {
            const currentCategoryCalculations =
              currentGroupCategoriesWithCalculations.find(
                (c) => c.id === category.id,
              );
            const subcategoriesResponses = category.subcategories
              .map((subcategory) => {
                const questions = subcategory.questions
                  .map((question) => {
                    return question.name;
                  })
                  .join(",");
                const currentSubcategoryCalculations =
                  currentCategoryCalculations?.subcategories.find(
                    (s) => s.id === subcategory.id,
                  );
                const subcategoryCalculations =
                  currentSubcategoryCalculations?.calculations
                    .map((calculation) => {
                      if (calculation.type === "PERCENTAGE") {
                        return `${calculation.questions.map((q) => `%${q.name}`).join(",")}`;
                      }
                      return calculation.name;
                    })
                    .join(",");
                if (
                  subcategoryCalculations &&
                  subcategoryCalculations.length > 0
                )
                  return `${questions},${subcategoryCalculations}`;
                return `${questions}`;
              })
              .join(",");
            const categoryResponses = category.questions
              .map((question) => {
                return question.name;
              })
              .join(",");
            const categoryCalculations =
              currentCategoryCalculations?.calculations
                .map((calculation) => {
                  if (calculation.type === "PERCENTAGE") {
                    return `${calculation.questions.map((q) => `%${q.name}`).join(",")}`;
                  }
                  return calculation.name;
                })
                .join(",");
            let result = "";
            result += subcategoriesResponses;
            if (categoryResponses) {
              if (result.length > 0) result += ",";
              result += categoryResponses;
            }
            if (
              currentCategoryCalculations &&
              currentCategoryCalculations?.calculations.length > 0
            ) {
              if (result.length > 0) result += ",";
              result += categoryCalculations;
            }
            return result;
          })
          .join(",");
        const questionLine = `Identificador,Nome da praça,Avaliador,Dia,Data,Horário,${questionsStr}`;

        let csvContent = `${categoryLine}\n,,,,,,${subcategoryLine}\n${questionLine}\n`;

        for (const assessment of currentGroup.assessments) {
          const responseValues = assessment.categories
            .map((category) => {
              const currentCategoryCalculations =
                currentGroupCategoriesWithCalculations.find(
                  (c) => c.id === category.id,
                );
              const subcategoriesResponses = category.subcategories
                .map((subcategory) => {
                  const responses = subcategory.questions
                    .map((question) => {
                      return question.responses
                        .map((response) => (response ? response : ""))
                        .join(",");
                    })
                    .join(",");

                  const currentSubcategoryCalculations =
                    currentCategoryCalculations?.subcategories.find(
                      (sub) => sub.id === subcategory.id,
                    );
                  const subcategoryCalculations =
                    currentSubcategoryCalculations?.calculations
                      .map((calculation) => {
                        const calculationQuestions = [
                          ...category.questions.filter((q) =>
                            calculation.questions.some((cq) => cq.id == q.id),
                          ),
                          ...category.subcategories.flatMap((s) =>
                            s.questions.filter((q) =>
                              calculation.questions.some((cq) => cq.id == q.id),
                            ),
                          ),
                        ];
                        if (calculation.type === "AVERAGE") {
                          const sum = calculationQuestions.reduce((acc, q) => {
                            return (
                              acc +
                              Number(
                                q.responses.reduce((acc2, r) => {
                                  const num =
                                    r && !isNaN(Number(r)) ? Number(r) : 0;
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
                                  const num =
                                    r && !isNaN(Number(r)) ? Number(r) : 0;
                                  return acc2 + num;
                                }, 0),
                              )
                            );
                          }, 0);
                        } else {
                          //PERCENTAGE
                          return calculationQuestions
                            .map((question, i, qes) => {
                              return (
                                (question.responses.reduce(
                                  (sum, r) => sum + Number(r),
                                  0,
                                ) *
                                  100) /
                                qes.reduce((sum, q) => {
                                  return (
                                    sum +
                                    q.responses.reduce(
                                      (sum, r) => sum + Number(r),
                                      0,
                                    )
                                  );
                                }, 0)
                              ).toFixed(2);
                            })
                            .join(",");
                        }
                      })
                      .join(",");
                  let result = "";
                  result += responses;
                  if (subcategoryCalculations) {
                    if (result.length > 0) result += ",";
                    result += subcategoryCalculations;
                  }
                  return result;
                })
                .join(",");
              const categoryResponses = category.questions
                .map((question) => {
                  return question.responses
                    .map((response) => (response ? response : ""))
                    .join(",");
                })
                .join(",");

              const categoryCalculations =
                currentCategoryCalculations?.calculations
                  .map((calculation) => {
                    const calculationQuestions = [
                      ...category.questions.filter((q) =>
                        calculation.questions.some((cq) => cq.id == q.id),
                      ),
                      ...category.subcategories.flatMap((s) =>
                        s.questions.filter((q) =>
                          calculation.questions.some((cq) => cq.id == q.id),
                        ),
                      ),
                    ];
                    if (calculation.type === "AVERAGE") {
                      const sum = calculationQuestions.reduce((acc, q) => {
                        return (
                          acc +
                          Number(
                            q.responses.reduce((acc2, r) => {
                              const num =
                                r && !isNaN(Number(r)) ? Number(r) : 0;
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
                              const num =
                                r && !isNaN(Number(r)) ? Number(r) : 0;
                              return acc2 + num;
                            }, 0),
                          )
                        );
                      }, 0);
                    } else {
                      //PERCENTAGE
                      return calculationQuestions
                        .map((question, i, qes) => {
                          return (
                            (question.responses.reduce(
                              (sum, r) => sum + Number(r),
                              0,
                            ) *
                              100) /
                            qes.reduce((sum, q) => {
                              return (
                                sum +
                                q.responses.reduce(
                                  (sum, r) => sum + Number(r),
                                  0,
                                )
                              );
                            }, 0)
                          ).toFixed(2);
                        })
                        .join(",");
                    }

                    return 0;
                  })
                  .join(",");
              let result = "";
              result += subcategoriesResponses;
              if (categoryResponses) {
                if (result.length > 0) result += ",";
                result += categoryResponses;
              }
              if (categoryCalculations) {
                if (result.length > 0) result += ",";
                result += categoryCalculations;
              }
              return result;
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

    return { statusCode: 200, csvObjs };
  } catch (e) {
    return { statusCode: 500, csvObjs: [] };
  }
};

const exportDailyTallys = async (
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
      statusCode: 200,
      CSVstringWeekdays,
      CSVstringWeekendDays,
    };
  } catch (e) {
    return { statusCode: 500, CSVstringWeekdays: [], CSVstringWeekendDays: [] };
  }
};

const exportDailyTallysFromSingleLocation = async (tallysIds: number[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return { statusCode: 401, CSVstring: null };
  }

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

  return { statusCode: 200, CSVstring };
};

//This function below is used to export tally content without combining data. It uses old spreadsheet formation.

const exportIndividualTallysToCSV = async (tallysIds: number[]) => {
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

  const CSVstring = createTallyStringWithoutAddedData(tallys);

  return { statusCode: 200, CSVstring };
};

export {
  exportIndividualTallysToCSV,
  exportDailyTallys,
  exportDailyTallysFromSingleLocation,
  exportRegistrationData,
  exportEvaluation,
};

export {
  type FetchedSubmission,
  type TallyDataToProcessType,
  type TallyDataToProcessTypeWithoutLocation,
};
