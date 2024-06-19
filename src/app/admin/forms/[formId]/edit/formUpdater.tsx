"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { handleDelete, updateForm } from "@/serverActions/formUtil";
import { Form, Question } from "@prisma/client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

import { DisplayQuestion } from "./client";

const initialState = {
  statusCode: 0,
};
const FormUpdater = ({
  form,
  questions,
  questionsToAdd,
  cancelAddQuestion,
  questionsToRemove,
  handleQuestionsToRemove,
}: {
  form: Form;
  questions: Question[] | null;
  questionsToAdd: DisplayQuestion[];
  cancelAddQuestion: (questionId: number) => void;
  questionsToRemove: DisplayQuestion[];
  handleQuestionsToRemove: (questionId: number) => void;
}) => {
  const [, formAction] = useFormState(updateForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {}, [questionsToAdd.length]);

  // TODO: add error handling
  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-full flex-col gap-5 text-white">
        <div
          className={
            "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
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

            <div
            // className="flex items-center"
            >
              <label htmlFor={"name"}>Nome:</label>
              <Input
                type="text"
                name="name"
                required
                id={"name"}
                defaultValue={form.name === null ? "" : form.name}
              />
              <div
              // className="text-2xl"
              >
                Versão: {form.version}
              </div>
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
          {(
            questions !== null &&
            questions !== undefined &&
            questions.length > 0
          ) ?
            <ul className="list-disc p-5">
              {questions.map((question) => {
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
            </ul>
          : <div className="text-redwood">
              Ainda não há perguntas no formulário
            </div>
          }

          {questionsToAdd.length > 0 && (
            <div>
              <div>Perguntas que serão adicionadas:</div>
              <ul className="list-disc p-5">
                {questionsToAdd.map((question) => (
                  <li
                    key={question.id}
                    className="flex w-full flex-row items-center justify-between"
                  >
                    <span className="p-2">{question.name}</span>
                    <Button
                      className="block min-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                      onPress={() => cancelAddQuestion(question.id)}
                    >
                      Remover
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export { FormUpdater };
