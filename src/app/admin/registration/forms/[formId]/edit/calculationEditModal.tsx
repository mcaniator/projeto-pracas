"use client";

import { Button } from "@/components/button";
import { Select } from "@/components/ui/select";
import {
  CalculationTypes,
  QuestionResponseCharacterTypes,
} from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import { Input } from "../../../../../../components/ui/input";
import { DisplayCalculation } from "./client";

const QuestionComponent = ({
  checked,
  question,
  handleQuestionToCalculateChange,
}: {
  checked: boolean;
  question: { id: number; name: string };
  handleQuestionToCalculateChange: (
    question: { id: number; name: string },
    checked: boolean,
  ) => void;
}) => {
  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLInputElement)) {
      handleQuestionToCalculateChange(question, !checked);
    }
  };
  return (
    <div
      className="mb-2 flex w-full items-center justify-between rounded bg-white p-2 outline-blue-500 hover:outline"
      onClick={(e) => handleDivClick(e)}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => handleQuestionToCalculateChange(question, !checked)}
      />
      <span className="flex flex-row">{question.name}</span>
    </div>
  );
};

const CalculationEditModal = ({
  category,
  subcategory,
  questions,
  calculation,
  isInitialCalculation,
  handleUpdateCalculationToAdd,
  handleUpdateInitialCalculation,
}: {
  category: { id: number; name: string };
  subcategory: { id: number; name: string } | null;
  questions: {
    id: number;
    name: string;
    characterType: QuestionResponseCharacterTypes;
  }[];
  calculation: DisplayCalculation;
  isInitialCalculation: boolean;
  handleUpdateCalculationToAdd: (calculation: DisplayCalculation) => void;
  handleUpdateInitialCalculation: (calculation: DisplayCalculation) => void;
}) => {
  const numberQuestions = questions.filter(
    (question) => question.characterType === "NUMBER",
  );
  const [selectedQuestions, setSelectedQuestions] = useState<
    { id: number; name: string }[]
  >(calculation.questions);
  const [calculationName, setCalculationame] = useState<string>(
    calculation.name,
  );
  const [type, setType] = useState<CalculationTypes>(calculation.type);
  const handleQuestionToCalculateChange = (
    question: { id: number; name: string },
    checked: boolean,
  ) => {
    if (checked) {
      setSelectedQuestions((prev) => {
        const updatedArray = [...prev];
        updatedArray.push(question);
        return updatedArray;
      });
    } else {
      setSelectedQuestions((prev) => {
        const updatedArray = [
          ...prev.filter((prevQuestion) => prevQuestion.id !== question.id),
        ];
        return updatedArray;
      });
    }
  };

  useEffect(() => {
    setSelectedQuestions(calculation.questions);
    setCalculationame(calculation.name);
    setType(calculation.type);
  }, [calculation]);

  return (
    <DialogTrigger>
      <Button className="items-center p-2">
        <IconEdit />
      </Button>
      <ModalOverlay
        className={({ isEntering, isExiting }) =>
          `fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${isEntering ? "duration-300 ease-out animate-in fade-in" : ""} ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""} `
        }
        isDismissable
      >
        <Modal
          className={({ isEntering, isExiting }) =>
            `max-h-full w-full max-w-lg overflow-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""} ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""} `
          }
        >
          <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
            {({ close }) => {
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl">{`Edição de cálculo : ${calculation.name}`}</h4>
                    <Button
                      className="ml-auto"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        setSelectedQuestions(calculation.questions);
                        close();
                      }}
                    >
                      <IconX />
                    </Button>
                  </div>

                  <h5 className="text-xl">{`Categoria: ${category.name}`}</h5>
                  {subcategory && (
                    <h5 className="text-xl">{`Subcategoria: ${subcategory.name}`}</h5>
                  )}
                  <label htmlFor="calculation-name">Título:</label>
                  <Input
                    type="text"
                    id="calculation-name"
                    name="calculation-name"
                    onChange={(e) => setCalculationame(e)}
                    value={calculationName}
                  />
                  <label htmlFor="calculation-type">Tipo:</label>
                  <Select
                    id="calculation-type"
                    onChange={(e) =>
                      setType(e.target.value as CalculationTypes)
                    }
                    value={type}
                  >
                    <option value="SUM">Soma</option>
                    <option value="AVERAGE">Média</option>
                    <option value="PERCENTAGE">Porcentagem</option>
                  </Select>
                  <label htmlFor="questions-select">Questões: </label>
                  <ul className="list-disc" id="questions-select">
                    {numberQuestions.map((question) => {
                      return (
                        <li
                          key={question.id}
                          className="flex w-full flex-row items-center justify-between"
                        >
                          <QuestionComponent
                            checked={selectedQuestions.some(
                              (prevSelectedQuestion) =>
                                prevSelectedQuestion.id === question.id,
                            )}
                            question={question}
                            handleQuestionToCalculateChange={
                              handleQuestionToCalculateChange
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                  <span className="ml-auto">
                    <Button
                      variant={"constructive"}
                      className="w-fit"
                      onPress={() => {
                        if (isInitialCalculation) {
                          handleUpdateInitialCalculation({
                            id: calculation.id,
                            name: calculationName,
                            category: calculation.category,
                            subcategory: calculation.subcategory,
                            questions: selectedQuestions,
                            type: type,
                          });
                        } else {
                          handleUpdateCalculationToAdd({
                            id: calculation.id,
                            name: calculationName,
                            category: calculation.category,
                            subcategory: calculation.subcategory,
                            questions: selectedQuestions,
                            type: type,
                          });
                        }

                        close();
                      }}
                    >
                      Editar
                    </Button>
                  </span>
                </div>
              );
            }}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};

export { CalculationEditModal };
