"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { FormToEditPage, updateForm } from "@/serverActions/formUtil";
import LoadingIcon from "@components/LoadingIcon";
import { useHelperCard } from "@components/context/helperCardContext";
import { FormCalculation, FormQuestion } from "@customTypes/forms/formCreation";
import { Question, QuestionResponseCharacterTypes } from "@prisma/client";
import { CategoriesWithQuestions } from "@serverActions/categoryUtil";
import { IconSquareRoundedMinus } from "@tabler/icons-react";
import { calculationTypesTranslationMap } from "@translationMaps/assessment";
import { useActionState, useEffect, useRef, useState } from "react";

import { CalculationCreationModal } from "./calculationCreationModal";
import { CalculationEditModal } from "./calculationEditModal";
import { AddCalculationToAddObj } from "./client";
import { QuestionSearchModal } from "./questionSearchModal";

const initialState = {
  statusCode: 0,
};

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
  calculation: FormCalculation;
  isInitialCalculation: boolean;
  removeCalculationToAdd: (id: number) => void;
  removeInitialCalculation: (id: number) => void;
  handleUpdateCalculationToAdd: (calculation: FormCalculation) => void;
  handleUpdateInitialCalculation: (calculation: FormCalculation) => void;
}) => {
  return (
    <li className="flex w-full flex-row items-center rounded-sm bg-white">
      <span
        className={
          isInitialCalculation ? "p-2 text-black" : "p-2 text-blue-800"
        }
      >
        {calculation.name} -{" "}
        {calculationTypesTranslationMap.get(calculation.type)}
      </span>
      <div className="ml-auto flex flex-col gap-2 px-3 py-2 sm:flex-row">
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
      </div>
    </li>
  );
};
const FormUpdater = ({
  form,
  questionsToAdd,
  calculationsToAdd,
  initialCalculations,
  questionsToRemove,
  isMobileView,
  updatedQuestions,
  initialCalculationsModified,
  cancelAddQuestion,
  handleQuestionsToRemove,
  addCalculationToAdd,
  removeCalculationToAdd,
  removeInitialCalculation,
  handleUpdateCalculationToAdd,
  handleUpdateInitialCalculation,
  handleCreateVersion,
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  categoriesToModal,
}: {
  form: FormToEditPage;
  questionsToAdd: FormQuestion[];
  calculationsToAdd: FormCalculation[];
  initialCalculations: FormCalculation[];
  questionsToRemove: FormQuestion[];
  isMobileView: boolean;
  updatedQuestions: FormQuestion[];
  initialCalculationsModified: boolean;
  cancelAddQuestion: (questionId: number) => void;
  handleQuestionsToRemove: (questionId: number) => void;
  addCalculationToAdd: (calculation: AddCalculationToAddObj) => void;
  removeCalculationToAdd: (id: number) => void;
  removeInitialCalculation: (id: number) => void;
  handleUpdateCalculationToAdd: (calculation: FormCalculation) => void;
  handleUpdateInitialCalculation: (calculation: FormCalculation) => void;
  handleCreateVersion: (
    formId: number,
    oldQuestions: FormQuestion[],
    questionsToAdd: FormQuestion[],
    questionsToRemove: FormQuestion[],
  ) => Promise<void>;
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: FormQuestion) => void;
  categoriesToModal: CategoriesWithQuestions;
}) => {
  const { setHelperCard } = useHelperCard();
  const [formState, formAction, isPending] = useActionState(
    updateForm,
    initialState,
  );
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

  useEffect(() => {
    if (formState.statusCode === 0) return;
    if (formState.statusCode === 200) {
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Nome atualizado!</>,
      });
    } else {
      if (formState.statusCode === 401) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para atualizar nome!</>,
        });
      } else {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao atualizar nome!</>,
        });
      }
    }
  }, [formState, setHelperCard]);

  // TODO: add error handling
  return (
    <div className={"flex h-full min-h-0 flex-grow gap-5"}>
      <div className="flex basis-full flex-col gap-5 overflow-x-auto">
        <div
          className={
            "flex flex-col gap-1 overflow-x-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
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
            <h3 className="text-xl font-semibold sm:text-2xl">{form.name}</h3>
            {form.version === 0 && (
              <>
                <div>
                  <label htmlFor={"name"}>Editar nome:</label>
                  <Input
                    className="w-full"
                    type="text"
                    name="name"
                    required
                    id={"name"}
                    defaultValue={form.name === null ? "" : form.name}
                  />
                  <div>Versão: {form.version}</div>
                </div>
                <div className="mb-2 flex items-center justify-between rounded p-2">
                  <Button type="submit" className={"px-2 text-sm sm:text-xl"}>
                    <span>Atualizar nome</span>
                  </Button>
                </div>
              </>
            )}
          </form>
          {isPending ?
            <div className="flex justify-center">
              <LoadingIcon className="h-32 w-32 text-2xl" />
            </div>
          : formState.statusCode === 409 ?
            <p className="text-red-700">
              Já existe um formulário com este nome!
            </p>
          : formState.statusCode === 500 ?
            <p className="text-red-700">Algo deu errado!</p>
          : formState.statusCode === 200 && (
              <p className="text-green-400">Nome atualizado!</p>
            )
          }
          {isMobileView && (
            <QuestionSearchModal
              formId={formId}
              initialQuestions={initialQuestions}
              handleQuestionsToAdd={handleQuestionsToAdd}
              questionsToAdd={questionsToAdd}
              questionsToRemove={questionsToRemove}
              categories={categoriesToModal}
            />
          )}
          <div>Perguntas nesse formulário:</div>
          <div className="flex flex-col gap-3">
            {categories.map((category) => {
              return (
                <div
                  key={category.id}
                  className="rounded-3xl bg-gray-400/20 p-3 shadow-inner"
                >
                  <div className="flex gap-2">
                    <h4 className="text-lx sm:text-2xl">{category.name}</h4>
                    <span className="ml-auto">
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
                            <span className="p-2 text-blue-100">
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
                    ).length > 0) && (
                    <div className="rounded-md bg-gray-600 p-1 shadow-sm">
                      <h6>Calculos</h6>
                      <ul className="mb-1 flex flex-col gap-1">
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
                      <ul className="flex flex-col gap-1">
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
                  )}

                  <div className="flex flex-col gap-1">
                    {category.subcategories.map((subcategory) => {
                      return (
                        <div
                          className="rounded-md bg-gray-500 p-1 shadow-md sm:p-2"
                          key={subcategory.id}
                        >
                          <div className="flex gap-2">
                            <h5 className="break-words text-xl">
                              {subcategory.name}
                            </h5>
                            <span className="ml-auto">
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
                                        void handleQuestionsToRemove(
                                          question.id,
                                        )
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
                                    <span className="p-2 text-blue-200">
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
                            ).length > 0) && (
                            <div className="rounded-md bg-gray-600 p-1 shadow-sm">
                              <h6>Calculos</h6>
                              <ul className="mb-1 flex flex-col gap-1">
                                {initialCalculations
                                  .filter(
                                    (calculation) =>
                                      calculation.subcategory?.id ===
                                      subcategory.id,
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
                                                  questionToRemove.id ===
                                                  question.id,
                                              ),
                                          )
                                          .concat(
                                            questionsToAdd.filter(
                                              (question) => {
                                                return (
                                                  question.subcategory?.id ===
                                                  subcategory.id
                                                );
                                              },
                                            ),
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
                              <ul className="flex flex-col gap-1">
                                {calculationsToAdd
                                  .filter(
                                    (calculation) =>
                                      calculation.subcategory?.id ===
                                      subcategory.id,
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
                                                  questionToRemove.id ===
                                                  question.id,
                                              ),
                                          )
                                          .concat(
                                            questionsToAdd.filter(
                                              (question) => {
                                                return (
                                                  question.subcategory?.id ===
                                                  subcategory.id
                                                );
                                              },
                                            ),
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {categoriesToAdd.map((category) => {
              return (
                <div
                  key={category.id}
                  className="rounded-3xl bg-gray-400/20 p-3 shadow-inner"
                >
                  <div className="flex gap-2">
                    <h4
                      key={category.id}
                      className="text-xl text-blue-200 sm:text-2xl"
                    >
                      {category.name}
                    </h4>
                    <span className="ml-auto">
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
                            <span className="p-2 text-blue-200">
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
                  ).length > 0 && (
                    <div className="rounded-md bg-gray-600 p-1 shadow-sm">
                      <h6>Calculos</h6>
                      <ul className="flex flex-col gap-1">
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
                  )}

                  <div className="flex flex-col gap-1">
                    {category.subcategories.map((subcategory) => {
                      return (
                        <div
                          className="rounded-md bg-gray-500 p-1 shadow-inner sm:p-2"
                          key={subcategory.id}
                        >
                          <div className="flex gap-2">
                            <h5 className="text-xl text-blue-200">
                              {subcategory.name}
                            </h5>
                            <span className="ml-auto">
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
                                    <span className="p-2 text-blue-200">
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
                          ).length > 0 && (
                            <div className="rounded-md bg-gray-600 p-1 shadow-sm">
                              <h6>Calculos</h6>
                              <ul className="flex flex-col gap-1">
                                {calculationsToAdd
                                  .filter(
                                    (calculation) =>
                                      calculation.subcategory?.id ===
                                      subcategory.id,
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="col-span-4 flex justify-center">
              {(updatedQuestions.length !== 0 ||
                calculationsToAdd.length !== 0 ||
                initialCalculationsModified) && (
                <Button
                  variant={"constructive"}
                  onPress={() =>
                    void handleCreateVersion(
                      form.id,
                      form.questions,
                      questionsToAdd,
                      questionsToRemove,
                    )
                  }
                >
                  Criar nova versão
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export { FormUpdater };
