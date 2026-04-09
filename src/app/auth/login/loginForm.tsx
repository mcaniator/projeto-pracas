"use client";

import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import GoogleLoginButton from "@components/singleUse/auth/googleLoginButton";
import ButtonLink from "@components/ui/buttonLink";
import { Input } from "@components/ui/input";
import _login from "@serverActions/login";
import { useActionState, useEffect } from "react";

import AuthPageShell from "../authPageShell";

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
    <AuthPageShell showMobileWave>
      {isPending && <LoadingIcon className="h-32 w-32" />}
      {!isPending && (
        <>
          <form action={formAction} className="w-full max-w-xs">
            <div className="flex flex-col gap-4 text-center text-white">
              <h2 className="text-2xl">Login</h2>
              <div className="text-left">
                <label htmlFor="email">E-mail</label>
                <Input
                  className="w-full rounded-full border-none bg-praca-green-dark"
                  name="email"
                  id="email"
                />
              </div>
              <div className="text-left text-white">
                <label htmlFor="password">Senha</label>
                <Input
                  className="w-full rounded-full border-none bg-praca-green-dark"
                  type="password"
                  name="password"
                  id="password"
                />
                <div className="text-right">
                  <ButtonLink
                    href="/auth/requestPasswordRecovery"
                    variant={"ghost"}
                    className="text-black-500 text-right text-sm"
                  >
                    Esqueci minha senha
                  </ButtonLink>
                </div>
              </div>
              <Button
                type="submit"
                variant={"constructive"}
                className="cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
              >
                Entrar
              </Button>
            </div>
          </form>
          {enableGoogleLogin && <GoogleLoginButton />}
        </>
      )}
    </AuthPageShell>
  );
};

export default LoginForm;
