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
import Link from "next/link";

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
    <div className="relative overflow-hidden flex min-h-screen items-center justify-center bg-gradient-to-br from-cambridge-blue to-asparagus">
      
      <div className="absolute lg:left-0 right-40 sm:right-60 top-20 sm:top-0 h-full w-full ">
        <img src="/loginWave.svg" className="h-full w-full object-cover" alt="" />
      </div>

      <div className="hidden lg:flex lg:w-1/2 flex-col pt-20 gap-12 h-full items-center justify-center z-10">
        <img className="max-w-[600px]" src="/loginPraca.svg" alt="Ilustração de uma praça para a página de login" />
        <div className="flex gap-4 text-asparagus">
          <Link className="flex items-center transition-transform duration-300 ease-in-out hover:scale-105" href={"/"}>
            <IconTree size={56} className="inline" />
            <h1 className="inline text-5xl">Projeto praças</h1>
          </Link>
        </div>
      </div>

      {isPending && <LoadingIcon className="h-32 w-32" />}
      {!isPending && (
        <div className="z-10 relative flex w-full lg:w-1/2 flex-col gap-4 h-full p-8 text-center justify-center items-center">
          <Link className="absolute top-0 -translate-y-28 left-1/2 -translate-x-1/2 flex items-center text-white transition-transform duration-300 ease-in-out hover:scale-105 lg:hidden" href={"/"}>
            <IconTree size={36} className="inline" />
            <h1 className="inline text-2xl">Projeto praças</h1>
          </Link>
          <form action={formAction} className="w-full max-w-xs">
            <div className="flex flex-col gap-4 text-center text-white">
              <h2 className="text-2xl">Login</h2>
              <div className="text-left">
                <label htmlFor="email">E-mail</label>
                <Input className="bg-praca-green-dark border-none rounded-full w-full" name="email" id="email" />
              </div>
              <div className="text-left text-white">
                <label htmlFor="password">Senha</label>
                <Input className="border-none bg-praca-green-dark rounded-full w-full" type="password" name="password" id="password" />
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
              <Button type="submit" variant={"constructive"} className="transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
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