"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import {
  FormToEditPage,
  handleDelete,
  updateForm,
} from "@/serverActions/formUtil";
import { QuestionResponseCharacterTypes } from "@prisma/client";
import { IconSquareRoundedMinus } from "@tabler/icons-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { CalculationCreationModal } from "./calculationCreationModal";
import { CalculationEditModal } from "./calculationEditModal";
import {
  AddCalculationToAddObj,
  DisplayCalculation,
  DisplayQuestion,
} from "./client";

const initialState = {
  statusCode: 0,
};

const calculationTypesPortugueseMap = new Map([
  ["AVERAGE", "Média"],
  ["SUM", "Soma"],
  ["PERCENTAGE", "Porcentagem"],
]);

const CalculationComponent = ({
  questions,
  calculation,
  isInitialCalculation,
  removeCalculationToAdd,
  removeInitialCalculation,
  handleUpdateCalculationToAdd,
  handleUpdateInitialCalculation,
}: {
  questions: {
    id: number;
    name: string;
    characterType: QuestionResponseCharacterTypes;
  }[];
  calculation: DisplayCalculation;
  isInitialCalculation: boolean;
  removeCalculationToAdd: (id: number) => void;
  removeInitialCalculation: (id: number) => void;
  handleUpdateCalculationToAdd: (calculation: DisplayCalculation) => void;
  handleUpdateInitialCalculation: (calculation: DisplayCalculation) => void;
}) => {
  return (
    <li className="flex w-full flex-row items-center">
      <span className={isInitialCalculation ? "p-2" : "p-2 text-blue-500"}>
        {calculation.name} -{" "}
        {calculationTypesPortugueseMap.get(calculation.type)}
      </span>
      <span className="ml-auto space-x-2 px-3 py-2">
        <CalculationEditModal
          category={calculation.category}
          subcategory={calculation.subcategory}
          questions={questions}
          calculation={calculation}
          isInitialCalculation={isInitialCalculation}
          handleUpdateCalculationToAdd={handleUpdateCalculationToAdd}
          handleUpdateInitialCalculation={handleUpdateInitialCalculation}
        />

        <Button
          className="items-center p-2"
          variant={"destructive"}
          onPress={() =>
            isInitialCalculation ?
              removeInitialCalculation(calculation.id)
            : removeCalculationToAdd(calculation.id)
          }
        >
          <IconSquareRoundedMinus />
        </Button>
      </span>
    </li>
  );
};
const FormUpdater = ({
  form,
  questionsToAdd,
  calculationsToAdd,
  initialCalculations,
  cancelAddQuestion,
  questionsToRemove,
  handleQuestionsToRemove,
  addCalculationToAdd,
  removeCalculationToAdd,
  removeInitialCalculation,
  handleUpdateCalculationToAdd,
  handleUpdateInitialCalculation,
}: {
  form: FormToEditPage;
  questionsToAdd: DisplayQuestion[];
  calculationsToAdd: DisplayCalculation[];
  initialCalculations: DisplayCalculation[];
  cancelAddQuestion: (questionId: number) => void;
  questionsToRemove: DisplayQuestion[];
  handleQuestionsToRemove: (questionId: number) => void;
  addCalculationToAdd: (calculation: AddCalculationToAddObj) => void;
  removeCalculationToAdd: (id: number) => void;
  removeInitialCalculation: (id: number) => void;
  handleUpdateCalculationToAdd: (calculation: DisplayCalculation) => void;
  handleUpdateInitialCalculation: (calculation: DisplayCalculation) => void;
}) => {
  const [, formAction] = useActionState(updateForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [categoriesToAdd, setCategoriesToAdd] = useState<
    {
      id: number;
      name: string;
      subcategories: { id: number; name: string }[];
    }[]
  >([]);

  const initialCategoriesMap = new Map<
    number,
    {
      id: number;
      name: string;
      subcategories: { id: number; name: string }[];
    }
  >();

  form.questions.forEach((question) => {
    if (!initialCategoriesMap.has(question.category.id)) {
      initialCategoriesMap.set(question.category.id, {
        id: question.category.id,
        name: question.category.name,
        subcategories: [],
      });
    }

    if (question.subcategory) {
      const existingCategory = initialCategoriesMap.get(question.category.id)!;
      const subcategoryExists = existingCategory.subcategories.some(
        (subcategory) => subcategory.id === question.subcategory?.id,
      );

      if (!subcategoryExists) {
        existingCategory.subcategories.push({
          id: question.subcategory.id,
          name: question.subcategory.name,
        });
      }
    }
  });
  useEffect(() => {
    setCategoriesToAdd(() => {
      const categoriesToAddMap = new Map<
        number,
        {
          id: number;
          name: string;
          subcategories: { id: number; name: string }[];
        }
      >();

      questionsToAdd.forEach((question) => {
        let existingCategory = categoriesToAddMap.get(question.category.id)!;
        if (!existingCategory) {
          existingCategory = {
            id: question.category.id,
            name: question.category.name,
            subcategories: [],
          };
          categoriesToAddMap.set(question.category.id, existingCategory);
        }

        if (question.subcategory) {
          if (
            existingCategory &&
            !existingCategory.subcategories.some(
              (subcategory) => subcategory.id === question.subcategory?.id,
            )
          ) {
            existingCategory.subcategories.push({
              id: question.subcategory.id,
              name: question.subcategory.name,
            });
          }
        }
      });

      return Array.from(categoriesToAddMap.values());
    });
  }, [questionsToAdd, form]);

  useEffect(() => {}, [questionsToAdd.length]);

  const categories: {
    id: number;
    name: string;
    questions: {
      id: number;
      name: string;
      characterType: QuestionResponseCharacterTypes;
    }[];
    subcategories: {
      id: number;
      name: string;
      categoryId: number;
      questions: {
        id: number;
        name: string;
        characterType: QuestionResponseCharacterTypes;
      }[];
    }[];
  }[] = [];

  form.questions.forEach((question) => {
    let categoryGroup = categories.find(
      (category) => category.id === question.category.id,
    );
    if (!categoryGroup) {
      categoryGroup = {
        id: question.category.id,
        name: question.category.name,

        subcategories: [],
        questions: [],
      };
      categories.push(categoryGroup);
    }
    if (question.subcategory) {
      let subcategoryGroup = categoryGroup.subcategories.find(
        (subcategory) => subcategory.id === question.subcategory?.id,
      );
      if (!subcategoryGroup) {
        subcategoryGroup = {
          id: question.subcategory.id,
          name: question.subcategory.name,
          categoryId: question.subcategory.categoryId,

          questions: [],
        };
        categoryGroup.subcategories.push(subcategoryGroup);
      }
      subcategoryGroup.questions.push({
        id: question.id,
        name: question.name,
        characterType: question.characterType,
      });
    } else {
      categoryGroup.questions.push({
        id: question.id,
        name: question.name,
        characterType: question.characterType,
      });
    }
  });

  // TODO: add error handling
  return (
    <div className={"flex h-full min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-full flex-col gap-5 overflow-auto text-white">
        <div
          className={
            "flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <form
            ref={formRef}
            action={formAction}
            className={"flex flex-col gap-2"}
            onSubmit={() =>
              setTimeout(() => {
                formRef.current?.reset();
              }, 1)
            }
          >
            <Input
              type="hidden"
              name="formId"
              id={"formId"}
              className={"hidden"}
              defaultValue={form.id}
            />

            <div>
              <label htmlFor={"name"}>Nome:</label>
              <Input
                type="text"
                name="name"
                required
                id={"name"}
                defaultValue={form.name === null ? "" : form.name}
              />
              <div>Versão: {form.version}</div>
            </div>

            <div className="mb-2 flex items-center justify-between rounded p-2">
              <Button variant={"admin"} type="submit" className={"w-min"}>
                <span className={"-mb-1"}>Enviar</span>
              </Button>

              <Link href={"/admin/forms"}>
                <Button
                  variant={"destructive"}
                  onPress={() => void handleDelete(form.id)}
                  className={"w-min"}
                >
                  <span className={"-mb-1"}>Deletar</span>
                </Button>
              </Link>
            </div>
          </form>
          <div>Perguntas nesse formulário:</div>
          <div className="flex flex-col gap-3 overflow-auto">
            {categories.map((category) => {
              return (
                <div
                  key={category.id}
                  className="rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner"
                >
                  <div className="flex gap-2">
                    <h4 className="text-2xl">{category.name}</h4>
                    <span className="ml-auto px-3">
                      <CalculationCreationModal
                        addCalculationToAdd={addCalculationToAdd}
                        category={{ id: category.id, name: category.name }}
                        subcategory={null}
                        questions={category.questions
                          .filter(
                            (question) =>
                              !questionsToRemove.some(
                                (questionToRemove) =>
                                  questionToRemove.id === question.id,
                              ),
                          )
                          .concat(
                            questionsToAdd.filter((question) => {
                              return question.category.id === category.id;
                            }),
                          )
                          .concat(
                            category.subcategories.flatMap(
                              (subcateogry) => subcateogry.questions,
                            ),
                          )}
                      />
                    </span>
                  </div>

                  <ul className="list-disc p-3">
                    {category.questions.map((question) => {
                      const isInToRemove = questionsToRemove.some(
                        (q) => q.id === question.id,
                      );
                      if (!isInToRemove) {
                        return (
                          <li
                            key={question.id}
                            className="flex w-full flex-row items-center justify-between"
                          >
                            <span className="p-2">{question.name}</span>
                            <Button
                              className="items-center p-2"
                              variant={"destructive"}
                              onPress={() =>
                                void handleQuestionsToRemove(question.id)
                              }
                            >
                              <IconSquareRoundedMinus />
                            </Button>
                          </li>
                        );
                      }
                      return null;
                    })}
                    {questionsToAdd
                      .filter(
                        (questionToAdd) =>
                          questionToAdd.category.id === category.id &&
                          !questionToAdd.subcategory,
                      )
                      .map((question) => {
                        return (
                          <li
                            key={question.id}
                            className="flex w-full flex-row items-center justify-between"
                          >
                            <span className="p-2 text-blue-500">
                              {question.name}
                            </span>
                            <Button
                              className="items-center p-2"
                              variant={"destructive"}
                              onPress={() => cancelAddQuestion(question.id)}
                            >
                              <IconSquareRoundedMinus />
                            </Button>
                          </li>
                        );
                      })}
                  </ul>
                  {(calculationsToAdd.filter(
                    (calculation) =>
                      calculation.category.id === category.id &&
                      !calculation.subcategory,
                  ).length > 0 ||
                    initialCalculations.filter(
                      (calculation) =>
                        calculation.category.id === category.id &&
                        !calculation.subcategory,
                    ).length > 0) && <h6>Calculos</h6>}
                  <ul>
                    {initialCalculations
                      .filter(
                        (calculation) =>
                          calculation.category.id === category.id &&
                          !calculation.subcategory,
                      )
                      .map((calculation) => {
                        return (
                          <CalculationComponent
                            key={calculation.name}
                            isInitialCalculation={true}
                            questions={category.questions
                              .filter(
                                (question) =>
                                  !questionsToRemove.some(
                                    (questionToRemove) =>
                                      questionToRemove.id === question.id,
                                  ),
                              )
                              .concat(
                                questionsToAdd.filter((question) => {
                                  return (
                                    question.category.id === category.id &&
                                    !question.subcategory
                                  );
                                }),
                              )
                              .concat(
                                category.subcategories.flatMap(
                                  (subcateogry) => subcateogry.questions,
                                ),
                              )}
                            calculation={calculation}
                            removeCalculationToAdd={removeCalculationToAdd}
                            removeInitialCalculation={removeInitialCalculation}
                            handleUpdateCalculationToAdd={
                              handleUpdateCalculationToAdd
                            }
                            handleUpdateInitialCalculation={
                              handleUpdateInitialCalculation
                            }
                          />
                        );
                      })}
                  </ul>
                  <ul>
                    {calculationsToAdd
                      .filter(
                        (calculation) =>
                          calculation.category.id === category.id &&
                          !calculation.subcategory,
                      )
                      .map((calculation) => {
                        return (
                          <CalculationComponent
                            key={calculation.name}
                            isInitialCalculation={false}
                            questions={category.questions
                              .filter(
                                (question) =>
                                  !questionsToRemove.some(
                                    (questionToRemove) =>
                                      questionToRemove.id === question.id,
                                  ),
                              )
                              .concat(
                                questionsToAdd.filter((question) => {
                                  return (
                                    question.category.id === category.id &&
                                    !question.subcategory
                                  );
                                }),
                              )
                              .concat(
                                category.subcategories.flatMap(
                                  (subcateogry) => subcateogry.questions,
                                ),
                              )}
                            calculation={calculation}
                            removeCalculationToAdd={removeCalculationToAdd}
                            removeInitialCalculation={removeInitialCalculation}
                            handleUpdateCalculationToAdd={
                              handleUpdateCalculationToAdd
                            }
                            handleUpdateInitialCalculation={
                              handleUpdateInitialCalculation
                            }
                          />
                        );
                      })}
                  </ul>
                  {category.subcategories.map((subcategory) => {
                    return (
                      <div key={subcategory.id}>
                        <div className="flex gap-2">
                          <h5 className="text-xl">{subcategory.name}</h5>
                          <span className="ml-auto px-3">
                            <CalculationCreationModal
                              addCalculationToAdd={addCalculationToAdd}
                              category={{
                                id: category.id,
                                name: category.name,
                              }}
                              subcategory={{
                                id: subcategory.id,
                                name: subcategory.name,
                              }}
                              questions={subcategory.questions
                                .filter(
                                  (question) =>
                                    !questionsToRemove.some(
                                      (questionToRemove) =>
                                        questionToRemove.id === question.id,
                                    ),
                                )
                                .concat(
                                  questionsToAdd.filter((question) => {
                                    return (
                                      question.subcategory?.id ===
                                      subcategory.id
                                    );
                                  }),
                                )}
                            />
                          </span>
                        </div>

                        <ul className="list-disc p-3">
                          {subcategory.questions.map((question) => {
                            const isInToRemove = questionsToRemove.some(
                              (q) => q.id === question.id,
                            );
                            if (!isInToRemove) {
                              return (
                                <li
                                  key={question.id}
                                  className="flex w-full flex-row items-center justify-between"
                                >
                                  <span className="p-2">{question.name}</span>
                                  <Button
                                    className="items-center p-2"
                                    variant={"destructive"}
                                    onPress={() =>
                                      void handleQuestionsToRemove(question.id)
                                    }
                                  >
                                    <IconSquareRoundedMinus />
                                  </Button>
                                </li>
                              );
                            }
                            return null;
                          })}
                          {questionsToAdd
                            .filter(
                              (questionToAdd) =>
                                questionToAdd.category.id === category.id &&
                                questionToAdd.subcategory?.id ===
                                  subcategory.id,
                            )
                            .map((question) => {
                              return (
                                <li
                                  key={question.id}
                                  className="flex w-full flex-row items-center justify-between"
                                >
                                  <span className="p-2 text-blue-500">
                                    {question.name}
                                  </span>
                                  <Button
                                    className="items-center p-2"
                                    variant={"destructive"}
                                    onPress={() =>
                                      cancelAddQuestion(question.id)
                                    }
                                  >
                                    <IconSquareRoundedMinus />
                                  </Button>
                                </li>
                              );
                            })}
                        </ul>
                        {(calculationsToAdd.filter(
                          (calculation) =>
                            calculation.subcategory?.id === subcategory.id,
                        ).length > 0 ||
                          initialCalculations.filter(
                            (calculation) =>
                              calculation.subcategory?.id === subcategory.id,
                          ).length > 0) && <h6>Calculos</h6>}
                        <ul>
                          {initialCalculations
                            .filter(
                              (calculation) =>
                                calculation.subcategory?.id === subcategory.id,
                            )
                            .map((calculation) => {
                              return (
                                <CalculationComponent
                                  key={calculation.name}
                                  isInitialCalculation={true}
                                  questions={subcategory.questions
                                    .filter(
                                      (question) =>
                                        !questionsToRemove.some(
                                          (questionToRemove) =>
                                            questionToRemove.id === question.id,
                                        ),
                                    )
                                    .concat(
                                      questionsToAdd.filter((question) => {
                                        return (
                                          question.subcategory?.id ===
                                          subcategory.id
                                        );
                                      }),
                                    )}
                                  calculation={calculation}
                                  removeCalculationToAdd={
                                    removeCalculationToAdd
                                  }
                                  removeInitialCalculation={
                                    removeInitialCalculation
                                  }
                                  handleUpdateCalculationToAdd={
                                    handleUpdateCalculationToAdd
                                  }
                                  handleUpdateInitialCalculation={
                                    handleUpdateInitialCalculation
                                  }
                                />
                              );
                            })}
                        </ul>
                        <ul>
                          {calculationsToAdd
                            .filter(
                              (calculation) =>
                                calculation.subcategory?.id === subcategory.id,
                            )
                            .map((calculation) => {
                              return (
                                <CalculationComponent
                                  key={calculation.name}
                                  isInitialCalculation={false}
                                  questions={subcategory.questions
                                    .filter(
                                      (question) =>
                                        !questionsToRemove.some(
                                          (questionToRemove) =>
                                            questionToRemove.id === question.id,
                                        ),
                                    )
                                    .concat(
                                      questionsToAdd.filter((question) => {
                                        return (
                                          question.subcategory?.id ===
                                          subcategory.id
                                        );
                                      }),
                                    )}
                                  calculation={calculation}
                                  removeCalculationToAdd={
                                    removeCalculationToAdd
                                  }
                                  removeInitialCalculation={
                                    removeInitialCalculation
                                  }
                                  handleUpdateCalculationToAdd={
                                    handleUpdateCalculationToAdd
                                  }
                                  handleUpdateInitialCalculation={
                                    handleUpdateInitialCalculation
                                  }
                                />
                              );
                            })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {categoriesToAdd.map((category) => {
              return (
                <div
                  key={category.id}
                  className="rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner"
                >
                  <div className="flex gap-2">
                    <h4 key={category.id} className="text-2xl text-blue-500">
                      {category.name}
                    </h4>
                    <span className="ml-auto px-3">
                      <CalculationCreationModal
                        addCalculationToAdd={addCalculationToAdd}
                        category={{ id: category.id, name: category.name }}
                        subcategory={null}
                        questions={questionsToAdd.filter((question) => {
                          return question.category.id === category.id;
                        })}
                      />
                    </span>
                  </div>

                  <ul className="list-disc p-3">
                    {questionsToAdd
                      .filter((question) => {
                        return (
                          question.category.id === category.id &&
                          !question.subcategory
                        );
                      })
                      .map((question) => {
                        return (
                          <li
                            key={question.id}
                            className="flex w-full flex-row items-center justify-between"
                          >
                            <span className="p-2 text-blue-500">
                              {question.name}
                            </span>
                            <Button
                              className="items-center p-2"
                              variant={"destructive"}
                              onPress={() => cancelAddQuestion(question.id)}
                            >
                              <IconSquareRoundedMinus />
                            </Button>
                          </li>
                        );
                      })}
                  </ul>
                  {calculationsToAdd.filter(
                    (calculation) =>
                      calculation.category.id === category.id &&
                      !calculation.subcategory,
                  ).length > 0 && <h6>Calculos</h6>}
                  <ul>
                    {calculationsToAdd
                      .filter(
                        (calculation) =>
                          calculation.category.id === category.id &&
                          !calculation.subcategory,
                      )
                      .map((calculation) => {
                        return (
                          <CalculationComponent
                            key={calculation.name}
                            isInitialCalculation={false}
                            questions={questionsToAdd.filter((question) => {
                              return (
                                question.category.id === category.id &&
                                !question.subcategory
                              );
                            })}
                            calculation={calculation}
                            removeCalculationToAdd={removeCalculationToAdd}
                            removeInitialCalculation={removeInitialCalculation}
                            handleUpdateCalculationToAdd={
                              handleUpdateCalculationToAdd
                            }
                            handleUpdateInitialCalculation={
                              handleUpdateInitialCalculation
                            }
                          />
                        );
                      })}
                  </ul>
                  {category.subcategories.map((subcategory) => {
                    return (
                      <div key={subcategory.id}>
                        <div className="flex gap-2">
                          <h5 className="text-xl text-blue-500">
                            {subcategory.name}
                          </h5>
                          <span className="ml-auto px-3">
                            <CalculationCreationModal
                              addCalculationToAdd={addCalculationToAdd}
                              category={{
                                id: category.id,
                                name: category.name,
                              }}
                              subcategory={{
                                id: subcategory.id,
                                name: subcategory.name,
                              }}
                              questions={questionsToAdd.filter((question) => {
                                return (
                                  question.subcategory?.id === subcategory.id
                                );
                              })}
                            />
                          </span>
                        </div>

                        <ul className="list-disc p-3">
                          {questionsToAdd
                            .filter((question) => {
                              return (
                                question.subcategory?.id === subcategory.id
                              );
                            })
                            .map((question) => {
                              return (
                                <li
                                  key={question.id}
                                  className="flex w-full flex-row items-center justify-between"
                                >
                                  <span className="p-2 text-blue-500">
                                    {question.name}
                                  </span>
                                  <Button
                                    className="items-center p-2"
                                    variant={"destructive"}
                                    onPress={() =>
                                      cancelAddQuestion(question.id)
                                    }
                                  >
                                    <IconSquareRoundedMinus />
                                  </Button>
                                </li>
                              );
                            })}
                        </ul>
                        {calculationsToAdd.filter(
                          (calculation) =>
                            calculation.subcategory?.id === subcategory.id,
                        ).length > 0 && <h6>Calculos</h6>}
                        <ul>
                          {calculationsToAdd
                            .filter(
                              (calculation) =>
                                calculation.subcategory?.id === subcategory.id,
                            )
                            .map((calculation) => {
                              return (
                                <CalculationComponent
                                  key={calculation.name}
                                  isInitialCalculation={false}
                                  questions={questionsToAdd.filter(
                                    (question) => {
                                      return (
                                        question.subcategory?.id ===
                                        subcategory.id
                                      );
                                    },
                                  )}
                                  calculation={calculation}
                                  removeCalculationToAdd={
                                    removeCalculationToAdd
                                  }
                                  removeInitialCalculation={
                                    removeInitialCalculation
                                  }
                                  handleUpdateCalculationToAdd={
                                    handleUpdateCalculationToAdd
                                  }
                                  handleUpdateInitialCalculation={
                                    handleUpdateInitialCalculation
                                  }
                                />
                              );
                            })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export { FormUpdater };
