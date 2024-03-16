"use client";

import { QuestionForm } from "@/components/singleUse/admin/question/questionForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleDelete, updateForm } from "@/serverActions/formUtil";
import { searchQuestionsByFormId } from "@/serverActions/questionSubmit";
import { Form } from "@prisma/client";
import Link from "next/link";
import { useRef } from "react";
import { useFormState } from "react-dom";

const initialState = {
  statusCode: 0,
};
const FormUpdater = async ({ form }: { form: Form }) => {
  const [, formAction] = useFormState(updateForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const questions = await searchQuestionsByFormId(form.id);

  // TODO: add error handling
  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
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

            <div>
              <label htmlFor={"name"}>Nome:</label>
              <Input
                type="text"
                name="name"
                required
                id={"name"}
                defaultValue={form.name === null ? "" : form.name}
              />
            </div>

            <div className="mb-2 flex items-center justify-between rounded p-2">
              <Button variant={"admin"} type="submit" className={"w-min"}>
                <span className={"-mb-1"}>Enviar</span>
              </Button>

              <Link href={"/admin/forms"}>
                <Button
                  variant={"destructive"}
                  onClick={() => void handleDelete(form.id)}
                  className={"w-min"}
                >
                  <span className={"-mb-1"}>Deletar</span>
                </Button>
              </Link>
            </div>
          </form>
          <div>Perguntas no formulário:</div>
          {questions !== null && questions !== undefined ?
            <ul className=" list-disc p-5">
              {questions.map((question) => (
                <li
                  key={question.id}
                  className="flex w-full flex-row items-center  justify-between "
                >
                  <span className="p-2">{question.name}</span>
                  <Button className="block min-w-32 overflow-hidden text-ellipsis whitespace-nowrap">
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          : <div className="text-redwood">
              Ainda não há perguntas no formulário
            </div>
          }
        </div>
      </div>
      <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
        <div className="flex basis-3/5 flex-col gap-5 text-white">
          <div
            className={
              "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
            }
          >
            <h3 className={"text-2xl font-semibold"}>Busca de Perguntas</h3>
            <QuestionForm formId={form.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
export { FormUpdater };
