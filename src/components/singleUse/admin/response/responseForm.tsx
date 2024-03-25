"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addResponses } from "@/serverActions/responseUtil";
import { Question } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

const ResponseForm = ({
  locationId,
  formId,
  questions,
}: {
  locationId: number;
  formId: number;
  questions: Question[] | null;
}) => {
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [responsesSent, setResponsesSent] = useState(false);
  const handleResponseChange = (questionId: number, value: string) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: value,
    }));
  };

  const handleSubmitResponse = () => {
    Object.entries(responses).forEach(([questionId, responseValue]) => {
      if (responseValue) {
        void addResponses(
          locationId,
          formId,
          parseInt(questionId),
          responseValue,
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
      {questions !== null && responsesSent == false ?
        <>
          <ul className="list-disc p-3">
            {questions.map((question) => (
              <li key={question.id}>
                <label htmlFor={`response${question.id}`}>
                  {question.name}
                </label>
                <Input
                  type="text"
                  name={`response${question.id}`}
                  id={`response${question.id}`}
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                />
              </li>
            ))}
          </ul>
          <div className="mb-2 flex items-center justify-between rounded p-2">
            <Button
              variant={"admin"}
              type="button"
              className={"w-min"}
              onClick={handleSubmitResponse}
            >
              <span className={"-mb-1"}>Enviar Respostas</span>
            </Button>
          </div>
        </>
      : questions !== null && responsesSent == true ?
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
