"use client";

import { IconTree } from "@tabler/icons-react";
import Link from "next/link";
import { useActionState } from "react";

import LoadingIcon from "../../components/LoadingIcon";
import { Button } from "../../components/button";
import GoogleLoginButton from "../../components/singleUse/auth/googleLoginButton";
import { Input } from "../../components/ui/input";
import login from "../../serverActions/login";

const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, null);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <IconTree size={48} className="inline" />
      <h1 className="inline text-4xl">Projeto praças</h1>
      {isPending && <LoadingIcon className="h-32 w-32" />}
      {state?.statusCode === 401 && (
        <div className="text-red-500">Credenciais incorretas!</div>
      )}
      <div className="flex flex-col gap-4 rounded-lg bg-gray-200 p-6 text-center">
        <form action={formAction}>
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-2xl">Login</h2>
            <div>
              <label htmlFor="email">E-mail</label>
              <Input name="email" id="email" />
            </div>
            <div>
              <label htmlFor="password">Senha</label>
              <Input type="password" name="password" id="password" />
            </div>
            <Button type="submit" variant={"constructive"}>
              Entrar
            </Button>
          </div>
        </form>
        <GoogleLoginButton />
      </div>
      Não possui uma conta? Entre com Google ou{" "}
      <Link href={"/register"}>
        <Button variant={"ghost"} className="font-semibold text-blue-500">
          cadastre-se
        </Button>
      </Link>
    </div>
  );
};

export default LoginForm;
