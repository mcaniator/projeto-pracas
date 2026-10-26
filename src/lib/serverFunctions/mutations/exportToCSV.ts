import { BooleanResponseValue } from "@/lib/enums/formSubmissionResponse";
import {
  dateFormatter,
  hourFormatter,
  weekdayFormatter,
} from "@/lib/formatters/dateFormatters";
import { prisma } from "@/lib/prisma";
import { APIRequestData } from "@/lib/types/backendCalls/APIResponse";
import { FormItemUtils } from "@/lib/utils/formTreeUtils";
import { QuestionResponseCharacterTypes, QuestionTypes } from "@prisma/client";
import { formatCSVField } from "@serverOnly/exportToCSV";
import { z } from "zod";

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
  characterType: QuestionResponseCharacterTypes;
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

export const exportRegistrationDataSchema = z.object({
  locationsIds: z.array(z.coerce.number()),
});
export type ExportRegistrationData = z.infer<
  typeof exportRegistrationDataSchema
>;
export type ExportRegistrationResponse = NonNullable<
  Awaited<ReturnType<typeof _exportRegistrationData>>["data"]
>;

const _exportRegistrationData = async (
  request: APIRequestData<ExportRegistrationData>,
) => {
  const { locationsIds } = request.data!;
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
    let CSVstring = "IDENTIFICAÇÃO PRAÇA;;;;;;;DADOS HISTÓRICOS;;;\n";
    CSVstring += ";;;;;;;;;;\n";
    CSVstring +=
      "Identificador;Nome da Praça;Nome popular;Categoria;Tipo;Observações;Endereço;Ano criação;Ano reforma;Legislação\n";
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
            `${formatCSVField(location.firstStreet)}${formatCSVField(location.secondStreet ? " / " + location.secondStreet : "")}${formatCSVField(location.thirdStreet ? " / " + location.thirdStreet : "")}${formatCSVField(location.fourthStreet ? " / " + location.fourthStreet : "")}${formatCSVField(location.broadAdministrativeUnit ? " - " + location.broadAdministrativeUnit.name : "")}${formatCSVField(location.intermediateAdministrativeUnit ? " - " + location.intermediateAdministrativeUnit.name : "")}${formatCSVField(location.narrowAdministrativeUnit ? " - " + location.narrowAdministrativeUnit.name : "")} - ${formatCSVField(location.city.name)} - ${formatCSVField(location.city.state)}`,
          ),
          location.creationYear,
          location.lastMaintenanceYear,
          location.legislation,
        ].join(";");

        return locationString;
      })
      .join("\n");

    return {
      responseInfo: { statusCode: 200 },
      data: { CSVstring },
    };
  } catch (e) {
    return {
      responseInfo: { statusCode: 500 },
      data: { CSVstring: null },
    };
  }
};

export const exportAssessmentsDataSchema = z.object({
  assessmentIds: z.array(z.coerce.number()),
});
export type ExportAssessmentsData = z.infer<typeof exportAssessmentsDataSchema>;
export type ExportAssessmentsResponse = NonNullable<
  Awaited<ReturnType<typeof _exportAssessments>>["data"]
>;

export const _exportAssessments = async (
  request: APIRequestData<ExportAssessmentsData>,
) => {
  const { assessmentIds } = request.data!;
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
        formSubmissionId: true,
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

    const formSubmissionIds = assessments.map(
      (assessment) => assessment.formSubmissionId,
    );
    const responses = await prisma.response.findMany({
      where: {
        formSubmissionId: { in: formSubmissionIds },
      },
      select: {
        id: true,
        questionId: true,
        formSubmissionId: true,
        response: true,
      },
    });

    const responsesOptions = await prisma.responseOption.findMany({
      where: {
        formSubmissionId: { in: formSubmissionIds },
      },
      select: {
        id: true,
        questionId: true,
        formSubmissionId: true,
        overrideValue: true,
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
        //TODO: do not use isSubcategoryType, because it will infer that item is a "SubcategoryItem", which is a type used in the form editor.
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
              //TODO: do not use isSubcategoryType, because it will infer that c is a "SubcategoryItem", which is a type used in the form editor.
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
        //TODO: do not use isQuestionType, because it will infer that item is a "QuestionItem", which is a type used in the form editor.
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
            characterType: dbQuestion.characterType,
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
                //TODO: do not use isSubcategoryType, because it will infer that c is a "SubcategoryItem", which is a type used in the form editor.
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
          //TODO: do not use isSubcategoryType, because it will infer that child is a "SubcategoryItem", which is a type used in the form editor.
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
        "Identificador da praça;Nome da praça;Identificador da avaliação;Avaliador;Dia;Data;Horário;Duração (minutos)";

      for (const category of categories) {
        // Here we create the first line of the CSV: categories
        for (const child of category.categoryChildren) {
          //TODO: do not use isSubcategoryType, because it will infer that child is a "SubcategoryItem", which is a type used in the form editor.
          if (FormItemUtils.isSubcategoryType(child)) {
            child.questions.forEach(() => {
              CSVHeader += `;${formatCSVField(category.name)}`;
            });
          } else {
            CSVHeader += `;${formatCSVField(category.name)}`;
          }
        }
      }
      CSVHeader += "\n;;;;;;;";
      for (const category of categories) {
        // Here we create the second line of the CSV: subcategories
        for (const child of category.categoryChildren) {
          //TODO: do not use isSubcategoryType, because it will infer that child is a "SubcategoryItem", which is a type used in the form editor.
          if (FormItemUtils.isSubcategoryType(child)) {
            child.questions.forEach(() => {
              CSVHeader += `;${formatCSVField(child.name)}`;
            });
          } else {
            CSVHeader += `;`;
          }
        }
      }
      CSVHeader += "\n;;;;;;;";
      for (const category of categories) {
        // Here we create the third line of the CSV: questions
        for (const child of category.categoryChildren) {
          //TODO: do not use isSubcategoryType, because it will infer that child is a "SubcategoryItem", which is a type used in the form editor.
          if (FormItemUtils.isSubcategoryType(child)) {
            for (const question of child.questions) {
              CSVHeader += `;${formatCSVField(question.name)}`;
            }
          } else {
            CSVHeader += `;${formatCSVField(child.name)}`;
          }
        }
      }

      let CSVAssessments = "";
      for (const assessment of assessments) {
        if (assessment.form.id !== formId) {
          continue;
        }
        // General data of the assessment
        CSVAssessments += `\n${assessment.location.id};${formatCSVField(assessment.location.name)};${assessment.id};${formatCSVField(assessment.user.username)};${weekdayFormatter.format(assessment.startDate)};${dateFormatter.format(assessment.startDate)};${hourFormatter.format(assessment.startDate)};${assessment.endDate ? (assessment.endDate.getTime() - assessment.startDate.getTime()) / 60000 : "Não finalizada!"}`;
        // Responses of the assessment
        for (const category of categories) {
          for (const child of category.categoryChildren) {
            //TODO: do not use isSubcategoryType, because it will infer that child is a "SubcategoryItem", which is a type used in the form editor.
            if (FormItemUtils.isSubcategoryType(child)) {
              for (const question of child.questions) {
                let responseValue = "";
                if (question.questionType === "WRITTEN") {
                  responseValue =
                    responses.find(
                      (r) =>
                        r.formSubmissionId === assessment.formSubmissionId &&
                        r.questionId === question.questionId,
                    )?.response || "";
                } else if (question.questionType === "OPTIONS") {
                  responseValue =
                    responsesOptions
                      .filter(
                        (r) =>
                          r.formSubmissionId === assessment.formSubmissionId &&
                          r.questionId === question.questionId,
                      )
                      .map((r) => {
                        const resolvedValue =
                          r.overrideValue && r.overrideValue.length > 0 ?
                            r.overrideValue
                          : r.option?.text;
                        if (question.characterType === "PERCENTAGE") {
                          return resolvedValue + "%";
                        }
                        return resolvedValue;
                      })
                      .join(" / ") || "";
                } else if (question.questionType === "BOOLEAN") {
                  const checked =
                    responses.find(
                      (r) =>
                        r.formSubmissionId === assessment.formSubmissionId &&
                        r.questionId === question.questionId,
                    )?.response === BooleanResponseValue.TRUE;
                  if (checked) {
                    responseValue = "Sim";
                  } else {
                    responseValue = "Não";
                  }
                }
                CSVAssessments += `;${formatCSVField(responseValue)}`;
              }
              //TODO: do not use isQuestionType, because it will infer that child is a "QuestionItem", which is a type used in the form editor.
            } else if (FormItemUtils.isQuestionType(child)) {
              let responseValue = "";
              if (child.questionType === "WRITTEN") {
                responseValue =
                  responses.find(
                    (r) =>
                      r.formSubmissionId === assessment.formSubmissionId &&
                      r.questionId === child.questionId,
                  )?.response || "";
                if (child.characterType === "PERCENTAGE") {
                  responseValue += "%";
                }
              } else if (child.questionType === "OPTIONS") {
                responseValue =
                  responsesOptions
                    .filter(
                      (r) =>
                        r.formSubmissionId === assessment.formSubmissionId &&
                        r.questionId === child.questionId,
                    )
                    .map((r) => {
                      const resolvedValue =
                        r.overrideValue && r.overrideValue.length > 0 ?
                          r.overrideValue
                        : r.option?.text;
                      if (child.characterType === "PERCENTAGE") {
                        return resolvedValue + "%";
                      }
                      return resolvedValue;
                    })
                    .join(" / ") || "";
              } else if (child.questionType === "BOOLEAN") {
                const checked =
                  responses.find(
                    (r) =>
                      r.formSubmissionId === assessment.formSubmissionId &&
                      r.questionId === child.questionId,
                  )?.response === BooleanResponseValue.TRUE;
                if (checked) {
                  responseValue = "Sim";
                } else {
                  responseValue = "Não";
                }
              }
              CSVAssessments += `;${formatCSVField(responseValue)}`;
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
      responseInfo: { statusCode: 200 },
      data: { csvObjs },
    };
  } catch (e) {
    return {
      responseInfo: { statusCode: 500 },
      data: { csvObjs: [] },
    };
  }
};

export { _exportRegistrationData };
