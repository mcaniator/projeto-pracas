"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import {
  FormToEditPage,
  handleDelete,
  updateForm,
} from "@/serverActions/formUtil";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";

import { DisplayQuestion } from "./client";

const initialState = {
  statusCode: 0,
};
const FormUpdater = ({
  form,
  questionsToAdd,
  cancelAddQuestion,
  questionsToRemove,
  handleQuestionsToRemove,
}: {
  form: FormToEditPage;
  questionsToAdd: DisplayQuestion[];
  cancelAddQuestion: (questionId: number) => void;
  questionsToRemove: DisplayQuestion[];
  handleQuestionsToRemove: (questionId: number) => void;
}) => {
  const [, formAction] = useFormState(updateForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [categoriesToAdd, setCategoriesToAdd] = useState<
    {
      id: number;
      name: string;
      subcategories: { id: number; name: string }[];
    }[]
  >(() => {
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
        const existingCategory = initialCategoriesMap.get(
          question.category.id,
        )!;
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

    const categoriesToAddMap = new Map<
      number,
      {
        id: number;
        name: string;
        subcategories: { id: number; name: string }[];
      }
    >();

    questionsToAdd.forEach((question) => {
      if (!categoriesToAddMap.has(question.category.id)) {
        categoriesToAddMap.set(question.category.id, {
          id: question.category.id,
          name: question.category.name,
          subcategories: [],
        });
      }

      if (question.subcategory) {
        const existingCategory = categoriesToAddMap.get(question.category.id)!;
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

    return Array.from(categoriesToAddMap.values());
  });

  useEffect(() => {
    setCategoriesToAdd(() => {
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
          const existingCategory = initialCategoriesMap.get(
            question.category.id,
          )!;
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

      const categoriesToAddMap = new Map<
        number,
        {
          id: number;
          name: string;
          subcategories: { id: number; name: string }[];
        }
      >();

      questionsToAdd.forEach((question) => {
        if (!categoriesToAddMap.has(question.category.id)) {
          categoriesToAddMap.set(question.category.id, {
            id: question.category.id,
            name: question.category.name,
            subcategories: [],
          });
        }

        if (question.subcategory) {
          const existingCategory = categoriesToAddMap.get(
            question.category.id,
          )!;
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

      return Array.from(categoriesToAddMap.values());
    });
  }, [questionsToAdd, form]);

  useEffect(() => {}, [questionsToAdd.length]);

  const categories: {
    id: number;
    name: string;
    questions: { id: number; name: string }[];
    subcategories: {
      id: number;
      name: string;
      categoryId: number;
      questions: { id: number; name: string }[];
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
      });
    } else {
      categoryGroup.questions.push({
        id: question.id,
        name: question.name,
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
                    <Button>Adicionar cálculo</Button>
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
                              className="block min-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                              onPress={() =>
                                void handleQuestionsToRemove(question.id)
                              }
                            >
                              Remover
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
                              className="block min-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                              onPress={() => cancelAddQuestion(question.id)}
                            >
                              Remover
                            </Button>
                          </li>
                        );
                      })}
                  </ul>
                  {category.subcategories.map((subcategory) => {
                    return (
                      <div key={subcategory.id}>
                        <div className="flex gap-2">
                          <h5 className="text-xl">{subcategory.name}</h5>
                          <Button>Adicionar cálculo</Button>
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
                                    className="block min-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                                    onPress={() =>
                                      void handleQuestionsToRemove(question.id)
                                    }
                                  >
                                    Remover
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
                                    className="block min-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                                    onPress={() =>
                                      cancelAddQuestion(question.id)
                                    }
                                  >
                                    Remover
                                  </Button>
                                </li>
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
                    <Button>Adicionar cálculo</Button>
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
                              className="block min-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                              onPress={() => cancelAddQuestion(question.id)}
                            >
                              Remover
                            </Button>
                          </li>
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
                          <Button>Adicionar cálculo</Button>
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
                                    className="block min-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                                    onPress={() =>
                                      cancelAddQuestion(question.id)
                                    }
                                  >
                                    Remover
                                  </Button>
                                </li>
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
