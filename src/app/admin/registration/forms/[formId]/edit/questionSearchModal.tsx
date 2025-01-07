"use client";

import { Button } from "@/components/button";
import {
  OptionTypes,
  Question,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { IconPlus, IconX } from "@tabler/icons-react";
import { Suspense, use, useDeferredValue, useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import LoadingIcon from "../../../../../../components/LoadingIcon";
import { Input } from "../../../../../../components/ui/input";
import { Select } from "../../../../../../components/ui/select";
import { CategoriesWithQuestions } from "../../../../../../serverActions/categorySubmit";
import {
  searchQuestionsByCategoryAndSubcategory,
  searchQuestionsByStatement,
} from "../../../../../../serverActions/questionUtil";
import { DisplayQuestion } from "./client";

type SearchMethods = "CATEGORY" | "STATEMENT";
const QuestionSearchModal = ({
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  questionsToAdd,
  questionsToRemove,
  categories,
}: {
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: DisplayQuestion) => void;
  questionsToAdd: DisplayQuestion[];
  questionsToRemove: DisplayQuestion[];
  categories: CategoriesWithQuestions;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [targetQuestion, setTargetQuestion] = useState("");

  const [currentSearchMethod, setCurrentSearchMethod] =
    useState<SearchMethods>("CATEGORY");
  // TODO: corrigir o tipo de setFoundQuestions
  const [foundQuestions, setFoundQuestions] =
    useState<Promise<DisplayQuestion[]>>();
  const [foundQuestionsByCategory, setFoundQuestionsByCategory] = useState<
    DisplayQuestion[]
  >([]);

  const [
    selectedCategoryAndSubcategoryId,
    setSelectedCategoryAndSubcategoryId,
  ] = useState<{
    categoryId: number | undefined;
    subcategoryId: number | undefined;
    verifySubcategoryNullness: boolean;
  }>({
    categoryId: categories[0]?.id,
    subcategoryId: undefined,
    verifySubcategoryNullness: false,
  });

  useEffect(() => {
    setFoundQuestions(searchQuestionsByStatement(targetQuestion));
  }, [targetQuestion]);

  useEffect(() => {
    searchQuestionsByCategoryAndSubcategory(categories[0]?.id, undefined, false)
      .then((questions) => {
        setFoundQuestionsByCategory(questions);
      })
      .catch((error) => {
        //TODO: tratar erro
      });
  }, [categories]);

  useEffect(() => {
    searchQuestionsByCategoryAndSubcategory(
      selectedCategoryAndSubcategoryId.categoryId,
      selectedCategoryAndSubcategoryId.subcategoryId,
      selectedCategoryAndSubcategoryId.verifySubcategoryNullness,
    )
      .then((questions) => {
        setFoundQuestionsByCategory(questions);
      })
      .catch((error) => {
        //TODO: tratar erro
      });
  }, [selectedCategoryAndSubcategoryId]);

  const deferredFoundQuestions = useDeferredValue(foundQuestions);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryAndSubcategoryId({
      categoryId: Number(e.target.value),
      subcategoryId: undefined,
      verifySubcategoryNullness: false,
    });
  };
  const handleSubcategoryChange = (e: number | string) => {
    const subcategory =
      e === "NULL" || e === "ALL" ? undefined
      : typeof e === "number" ? e
      : parseInt(e);
    setSelectedCategoryAndSubcategoryId({
      ...selectedCategoryAndSubcategoryId,
      subcategoryId: subcategory,
      verifySubcategoryNullness: e === "ALL" ? false : true,
    });
  };
  return (
    <DialogTrigger>
      <Button className="w-fit items-center p-2 text-sm sm:text-xl">
        Buscar questão
      </Button>
      {
        <ModalOverlay
          className={({ isEntering, isExiting }) =>
            `fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${
              isEntering ? "duration-300 ease-out animate-in fade-in" : ""
            } ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""}`
          }
          isDismissable
        >
          <Modal
            className={({ isEntering, isExiting }) =>
              `mb-auto mt-auto w-[90%] max-w-lg transform overflow-auto rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
                isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
              } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
            }
            style={{}}
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl font-semibold sm:text-4xl">
                      Busca de questões
                    </h4>
                    <Button
                      className="ml-auto"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        close();
                      }}
                    >
                      <IconX />
                    </Button>
                  </div>
                  {isPending && (
                    <div className="flex justify-center">
                      <LoadingIcon className="h-32 w-32 text-2xl" />
                    </div>
                  )}

                  <div className={"flex flex-col gap-1 overflow-auto"}>
                    <h3 className={"text-2xl font-semibold"}>
                      Busca de Perguntas
                    </h3>

                    <Select
                      defaultValue={"CATEGORY"}
                      onChange={(e) =>
                        setCurrentSearchMethod(e.target.value as SearchMethods)
                      }
                    >
                      <option value="CATEGORY">Categorias</option>
                      <option value="STATEMENT">Enunciado</option>
                    </Select>

                    {currentSearchMethod === "STATEMENT" && (
                      <div className="flex flex-col gap-2 overflow-auto">
                        <div className={"flex flex-col gap-2"}>
                          <label htmlFor={"name"}>Buscar pelo enunciado:</label>
                          <Input
                            className="w-full"
                            type="text"
                            name="name"
                            required
                            id={"name"}
                            autoComplete={"none"}
                            value={targetQuestion}
                            onChange={(e) => setTargetQuestion(e.target.value)}
                          />
                        </div>
                        <Suspense>
                          <SearchedQuestionList
                            questionPromise={deferredFoundQuestions}
                            formId={formId}
                            initialQuestions={initialQuestions}
                            handleQuestionsToAdd={handleQuestionsToAdd}
                            questionsToAdd={questionsToAdd}
                            questionsToRemove={questionsToRemove}
                          />
                        </Suspense>
                      </div>
                    )}
                    {currentSearchMethod === "CATEGORY" && (
                      <div className="flex flex-col gap-2 overflow-auto">
                        <h4>Buscar por categoria: </h4>
                        <label htmlFor="category-select">Categoria: </label>
                        <Select
                          name="category-select"
                          onChange={handleCategoryChange}
                        >
                          {categories.map((category) => {
                            return (
                              <option value={category.id} key={category.id}>
                                {category.name}
                              </option>
                            );
                          })}
                        </Select>
                        <label htmlFor="subcategory-select">
                          Subcategoria:{" "}
                        </label>
                        <Select
                          name="subcategory-select"
                          onChange={(e) =>
                            handleSubcategoryChange(e.target.value)
                          }
                        >
                          <option value="ALL">TODAS</option>
                          <option value="NULL">NENHUMA</option>

                          {categories
                            .find(
                              (category) =>
                                category.id ===
                                selectedCategoryAndSubcategoryId.categoryId,
                            )
                            ?.subcategory.map((subcategory) => {
                              return (
                                <option
                                  value={subcategory.id}
                                  key={subcategory.id}
                                >
                                  {subcategory.name}
                                </option>
                              );
                            })}
                        </Select>
                        <QuestionList
                          questions={foundQuestionsByCategory}
                          formId={formId}
                          initialQuestions={initialQuestions}
                          handleQuestionsToAdd={handleQuestionsToAdd}
                          questionsToAdd={questionsToAdd}
                          questionsToRemove={questionsToRemove}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      }
    </DialogTrigger>
  );
};

const SearchedQuestionList = ({
  questionPromise,
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  questionsToAdd,
  questionsToRemove,
}: {
  questionPromise?: Promise<DisplayQuestion[]>;
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: DisplayQuestion) => void;
  questionsToAdd: DisplayQuestion[];
  questionsToRemove: DisplayQuestion[];
}) => {
  useEffect(() => {}, [questionsToAdd.length, questionsToRemove.length]);
  if (questionPromise === undefined) return null;
  const questions = use(questionPromise);

  const updatedQuestionsToRemove = questionsToRemove.filter((qToRemove) =>
    questionsToAdd.every((qAdded) => qToRemove.id !== qAdded.id),
  );

  const filteredQuestions = questions.filter((question) => {
    const isQuestionInInitial = initialQuestions?.some(
      (q) => q.id === question.id,
    );
    const isQuestionAdded = questionsToAdd.some((q) => q.id === question.id);
    const isQuestionToRemove = updatedQuestionsToRemove.some(
      (q) => q.id === question.id,
    );

    return (!isQuestionInInitial && !isQuestionAdded) || isQuestionToRemove;
  });

  return (
    <div className="w-full text-black">
      {filteredQuestions.map((question) => (
        <QuestionComponent
          key={question.id}
          questionId={question.id}
          characterType={question.characterType}
          name={question.name}
          notes={question.notes}
          type={question.type}
          optionType={question.optionType}
          options={question.options}
          formId={formId}
          handleQuestionsToAdd={handleQuestionsToAdd}
          showCategory={true}
          categoryId={question.category.id}
          subcategoryId={question.subcategory?.id}
          categoryName={question.category.name}
          subcategoryName={question.subcategory?.name}
        />
      ))}
    </div>
  );
};

const QuestionList = ({
  questions,
  formId,
  initialQuestions,
  handleQuestionsToAdd,
  questionsToAdd,
  questionsToRemove,
}: {
  questions: DisplayQuestion[];
  formId?: number;
  initialQuestions: Question[] | null;
  handleQuestionsToAdd: (question: DisplayQuestion) => void;
  questionsToAdd: DisplayQuestion[];
  questionsToRemove: DisplayQuestion[];
}) => {
  useEffect(() => {}, [questionsToAdd.length, questionsToRemove.length]);

  const updatedQuestionsToRemove = questionsToRemove.filter((qToRemove) =>
    questionsToAdd.every((qAdded) => qToRemove.id !== qAdded.id),
  );

  const filteredQuestions = questions.filter((question) => {
    const isQuestionInInitial = initialQuestions?.some(
      (q) => q.id === question.id,
    );
    const isQuestionAdded = questionsToAdd.some((q) => q.id === question.id);
    const isQuestionToRemove = updatedQuestionsToRemove.some(
      (q) => q.id === question.id,
    );

    return (!isQuestionInInitial && !isQuestionAdded) || isQuestionToRemove;
  });

  return (
    <div className="w-full text-black">
      {filteredQuestions.map((question) => (
        <QuestionComponent
          key={question.id}
          questionId={question.id}
          characterType={question.characterType}
          name={question.name}
          notes={question.notes}
          type={question.type}
          optionType={question.optionType}
          options={question.options}
          formId={formId}
          handleQuestionsToAdd={handleQuestionsToAdd}
          showCategory={false}
          categoryId={question.category.id}
          subcategoryId={question.subcategory?.id}
          categoryName={question.category.name}
          subcategoryName={question.subcategory?.name}
        />
      ))}
    </div>
  );
};

const QuestionComponent = ({
  questionId,
  characterType,
  handleQuestionsToAdd,
  name,
  notes,
  type,
  optionType,
  options,
  showCategory,
  categoryId,
  subcategoryId,
  categoryName,
  subcategoryName,
}: {
  questionId: number;
  characterType: QuestionResponseCharacterTypes;
  handleQuestionsToAdd: (question: DisplayQuestion) => void;
  name: string;
  notes: string | null;
  type: QuestionTypes;
  optionType: OptionTypes | null;
  options: { text: string }[];
  formId?: number;
  showCategory: boolean;
  categoryId: number;
  subcategoryId?: number;
  categoryName: string;
  subcategoryName?: string;
}) => {
  return (
    <div
      key={questionId}
      className="mb-2 flex flex-col items-center justify-between rounded bg-white p-2"
    >
      {name}
      {showCategory &&
        `, Categoria: ${categoryName}, Subcategoria: ${subcategoryName ? subcategoryName : "NENHUMA"}`}
      <Button
        variant={"admin"}
        type="submit"
        className={"w-min"}
        onPress={() =>
          handleQuestionsToAdd({
            id: questionId,
            name,
            notes,
            type,
            optionType,
            options,
            category: { id: categoryId, name: categoryName },
            subcategory:
              subcategoryId && subcategoryName ?
                { id: subcategoryId, name: subcategoryName, categoryId }
              : null,
            characterType: characterType,
          })
        }
      >
        <span className={"-mb-1"}>
          <IconPlus />
        </span>
      </Button>
    </div>
  );
};

export { QuestionSearchModal };
