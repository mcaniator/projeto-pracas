"use client";

import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import GoogleLoginButton from "@components/singleUse/auth/googleLoginButton";
import ButtonLink from "@components/ui/buttonLink";
import { Input } from "@components/ui/input";
import _login from "@serverActions/login";
import { IconTree } from "@tabler/icons-react";
import { useActionState, useEffect } from "react";

const LoginForm = ({ enableGoogleLogin }: { enableGoogleLogin: boolean }) => {
  const { setHelperCard } = useHelperCard();
  const [state, formAction, isPending] = useActionState(_login, null);
  useEffect(() => {
    if (!state) return;
    setHelperCard({
      show: true,
      helperCardType: state?.statusCode === 200 ? "CONFIRM" : "ERROR",
      content: (
        <>
          {state?.statusCode === 200 ?
            "Login realizado! Entrando..."
          : "Credenciais incorretas!"}
        </>
      ),
    });
  }, [state, setHelperCard]);
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-cambridge-blue to-asparagus">
      <div className="absolute w-full h-full">
        <img src="/loginWave.svg"></img>
      </div>
      <div className="flex flex-col pt-20 gap-12 w-1/2 h-full items-center justify-center z-10">
        <img className="max-w-[600px]" src="/loginPraca.svg" alt="Ilustração de uma praça para a página de login"></img>
        <div className="flex gap-4 text-asparagus">
          <IconTree size={56} className="inline" />
          <h1 className="inline text-5xl">Projeto praças</h1>
        </div>
      </div>
      {isPending && <LoadingIcon className="h-32 w-32" />}
      {!isPending && (
        <div className="z-10 flex flex-col gap-4 w-1/2 h-full p-6 text-center justify-center items-center">
          <form action={formAction}>
            <div className="flex flex-col gap-4 text-center text-white">
              <h2 className="text-2xl">Login</h2>
              <div className="text-left">
                <label htmlFor="email">E-mail</label>
                <Input className="bg-praca-green-dark border-none rounded-full w-lg" name="email" id="email" />
              </div>
              <div className="text-left text-white">
                <label htmlFor="password">Senha</label>
                <Input className="border-none bg-praca-green-dark rounded-full" type="password" name="password" id="password" />
                <div className="text-right">
                  <ButtonLink
                  href="/auth/requestPasswordRecovery"
                  variant={"ghost"}
                  className="text-sm text-black-500 text-right"
                >
                  Esqueci minha senha
                </ButtonLink>
                </div>
              </div>
              <Button type="submit" variant={"constructive"}>
                Entrar
              </Button>
            </div>
          </form>
          {enableGoogleLogin && <GoogleLoginButton />}
        </div>
      )}
    </div>
  );
};

export default LoginForm;
