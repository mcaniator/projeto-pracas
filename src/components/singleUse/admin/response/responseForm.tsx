"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { addResponses } from "@/serverActions/responseUtil";
import { Question, QuestionTypes } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

const ResponseForm = ({
  locationId,
  formId,
  questions,
  options,
}: {
  locationId: number;
  formId: number;
  questions: Question[] | null;
  options: { questionId: number; options: { id: number; text: string }[] }[];
}) => {
  const [responses, setResponses] = useState<{
    [key: number]: { value: string; type: QuestionTypes };
  }>({});
  const [responsesSent, setResponsesSent] = useState(false);

  const handleResponseChange = (
    questionId: number,
    questionType: QuestionTypes,
    value: string,
  ) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: { value, type: questionType },
    }));
  };

  const handleSubmitResponse = () => {
    Object.entries(responses).forEach(([questionId, { value, type }]) => {
      if (value) {
        void addResponses(
          locationId,
          formId,
          parseInt(questionId),
          type,
          value,
        );
      }
    });
    setResponsesSent(!responsesSent);
  };

  useEffect(() => {}, [responses, responsesSent]);

  return (
    <div
      className={
        "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
      }
    >
      {questions !== null && responsesSent === false ?
        <>
          <ul className="list-disc p-3">
            {questions.map((question) => {
              const questionOptions =
                options.find((opt) => opt.questionId === question.id)
                  ?.options || [];
              return (
                <li key={question.id}>
                  <label htmlFor={`response${question.id}`}>
                    {question.name}
                  </label>
                  {question.type === QuestionTypes.OPTIONS ?
                    <div>
                      {questionOptions.map((option) => (
                        <div key={option.id}>
                          <input
                            type="radio"
                            id={`option${option.id}`}
                            name={`response${question.id}`}
                            value={option.id}
                            checked={
                              responses[question.id]?.value ===
                              String(option.id)
                            }
                            onChange={(e) =>
                              handleResponseChange(
                                question.id,
                                question.type,
                                e.target.value,
                              )
                            }
                          />
                          <label htmlFor={`option${option.id}`}>
                            {option.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  : <Input
                      type="text"
                      name={`response${question.id}`}
                      id={`response${question.id}`}
                      value={responses[question.id]?.value || ""}
                      onChange={(e) =>
                        handleResponseChange(
                          question.id,
                          question.type,
                          e.target.value,
                        )
                      }
                    />
                  }
                </li>
              );
            })}
          </ul>
          <div className="mb-2 flex items-center justify-between rounded p-2">
            <Button
              variant={"admin"}
              type="button"
              className={"w-min"}
              onPress={handleSubmitResponse}
            >
              <span className={"-mb-1"}>Enviar Respostas</span>
            </Button>
          </div>
        </>
      : questions !== null && responsesSent === true ?
        <div className="flex-row text-4xl">
          Respostas enviadas com sucesso!
          <div>
            <Link href={"/admin/parks/"}>
              <Button className="text-white" variant={"default"}>
                <span className="-mb-1">Voltar à seleção</span>
              </Button>
            </Link>
          </div>
        </div>
      : <div className="text-redwood">Ainda não há perguntas no formulário</div>
      }
    </div>
  );
};

export { ResponseForm };
