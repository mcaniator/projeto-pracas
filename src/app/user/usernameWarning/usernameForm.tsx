"use client";

import { IconCheck, IconHome } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";

import LoadingIcon from "../../../components/LoadingIcon";
import { Button } from "../../../components/button";
import { Input } from "../../../components/ui/input";
import { updateUserUsername } from "../../../serverActions/userUtil";

const UsernameForm = () => {
  const [state, formAction, isPending] = useActionState(
    updateUserUsername,
    null,
  );
  const [errors, setErrors] = useState<{
    statusCode: number;
    errors: { message: string | null; element: string | null }[] | null;
  }>({ statusCode: 0, errors: null });
  useEffect(() => {
    if (state)
      setErrors({
        statusCode: state.statusCode,
        errors: state.errors,
      });
  }, [state]);

  const session = useSession();
  const user = session.data?.user;

  const usernameError = useMemo(
    () => errors.errors?.find((e) => e.element === "username"),
    [errors],
  );

  if (session.status === "loading" || isPending) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-col items-center justify-center gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
          <LoadingIcon className="h-32 w-32" />
        </div>
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
        <h1 className="text-2xl font-bold">Configurar nome de usuário</h1>
        <p>
          É necessário inserir um nome de usuário. Este será seu identificador
          único no sistema. Todos poderão ver seu nome de usuário.
        </p>
        <p>O nome de usuário é composto apenas por letras e pontos</p>
        <p>Exemplo: joao.silva</p>
        {state?.statusCode !== 200 ?
          <>
            <label htmlFor="username">Inserir seu nome de usuário:</label>
            <form action={formAction} className="flex flex-col gap-2">
              <Input
                className={`w-full ${usernameError && "outline outline-2 outline-red-500"}`}
                id="username"
                name="username"
              />
              {usernameError && (
                <p className="text-red-500">{usernameError.message}</p>
              )}
              <input type="hidden" id="userId" name="userId" value={user?.id} />
              <Button type="submit" className="w-fit" variant={"constructive"}>
                Salvar
              </Button>
            </form>
          </>
        : <>
            <IconCheck className="h-32 w-32 text-2xl text-green-500" />
            <p className="text-green-500">Nome de usuário salvo com sucesso!</p>
            <p>Seu nome de usuário:</p>
            <span className="w-fit rounded-lg bg-slate-400 px-4 text-2xl font-semibold">
              {state.username}
            </span>
            <p>É possível alterá-lo na página de configurações de usuário</p>
            <Link href={"/admin/home"}>
              <Button>
                <IconHome className="mb-1" /> Página inicial
              </Button>
            </Link>
          </>
        }
      </div>
    </div>
  );
};

export default UsernameForm;
