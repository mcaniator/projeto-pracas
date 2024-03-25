"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addResponses } from "@/serverActions/responseUtil";
import { useEffect, useState } from "react";

const ResponseComponent = ({
  locationId,
  formId,
  questionId,
  questionName,
}: {
  locationId: number;
  formId: number;
  questionId: number;
  questionName: string;
}) => {
  const [responseValue, setResponseValue] = useState("");
  useEffect(() => {}, [responseValue]);

  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <div
          className={
            "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
          }
        >
          <label htmlFor={`response${questionId}`}>{questionName}</label>
          <Input
            type="text"
            name="response"
            id={`response${questionId}`}
            value={responseValue}
            onChange={(e) => setResponseValue(e.target.value)}
          />
          <div className="mb-2 flex items-center justify-between rounded p-2">
            <Button
              variant={"admin"}
              type="submit"
              className={"w-min"}
              onClick={() =>
                void addResponses(locationId, formId, questionId, responseValue)
              }
            >
              <span className={"-mb-1"}>Enviar Respostas</span>
            </Button>
          </div>
        </div>
      </div>
      <div key={questionId}>
        <div>a key do elemento é: {questionId}</div>
        <div>o id do local é: {locationId}</div>
        <div>o id do formulário é: {formId}</div>
        <div>o id da pergunta é: {questionId}</div>
        <div>o enunciado da pergunta é: {questionName}</div>
        <div>a resposta da pergunta é: {responseValue}</div>
      </div>
    </div>
  );
};
export { ResponseComponent };
