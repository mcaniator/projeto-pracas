"use client";

import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import { useLoadingOverlay } from "@components/context/loadingContext";
import GoogleRegisterButton from "@components/singleUse/auth/googleRegisterButton";
import { Input } from "@components/ui/input";
import _register from "@serverActions/register";
import { IconEye, IconEyeClosed, IconHelp } from "@tabler/icons-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";

import AuthPageShell from "../authPageShell";

const RegisterForm = ({
  inviteToken,
  enableGoogleLogin,
}: {
  inviteToken: string;
  enableGoogleLogin: boolean;
}) => {
  const { setLoadingOverlayVisible } = useLoadingOverlay();
  const { setHelperCard } = useHelperCard();
  const [state, formAction, isPending] = useActionState(_register, null);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPasswordError: false,
  });
  const [errors, setErrors] = useState<{
    statusCode: number;
    errors: { message: string | null; element: string | null }[] | null;
  }>({ statusCode: 0, errors: null });

  useEffect(() => {
    if (state) {
      if (state.statusCode !== 201) {
        if (state.statusCode === 404) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: (
              <div className="flex flex-col gap-2">
                {state.errors
                  ?.filter((error) => error.element === "helperCard")
                  .map((error, index) => {
                    return <p key={index}>{error.message}</p>;
                  })}
              </div>
            ),
          });
        }
        setErrors({
          statusCode: state.statusCode,
          errors: state.errors,
        });
      } else if (state.statusCode === 201) {
        setLoadingOverlayVisible(true);
      }
    }
  }, [state, setHelperCard, setLoadingOverlayVisible]);

  const emailError = useMemo(
    () => errors.errors?.find((e) => e.element === "email"),
    [errors],
  );
  const nameError = useMemo(
    () => errors.errors?.find((e) => e.element === "name"),
    [errors],
  );
  const passwordError = useMemo(
    () => errors.errors?.find((e) => e.element === "password"),
    [errors],
  );
  const confirmPasswordError = useMemo(
    () => errors.errors?.find((e) => e.element === "confirmPassword"),
    [errors],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <AuthPageShell showIllustration={false} centerContent>
      {isPending && <LoadingIcon className="h-32 w-32" />}
      {state?.statusCode === 201 ?
        <div className="flex flex-col items-center gap-2 text-2xl text-white">
          Usuário criado com sucesso!
          <Link href="/auth/login">
            <Button className="w-fit">Entrar</Button>
          </Link>
        </div>
      : <div
          className={`w-full max-w-xs ${isPending && "hidden"} rounded-md bg-white/10 p-4`}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 text-center text-white">
              <h2 className="text-2xl">Cadastro</h2>
              <input
                type="hidden"
                value={inviteToken}
                name="inviteToken"
                id="inviteToken"
              />
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="email">E-mail</label>
                <Input
                  className={`w-full rounded-full border-none bg-praca-green-dark ${emailError && "outline outline-2 outline-red-500"}`}
                  type="email"
                  name="email"
                  id="email"
                />
                {emailError && (
                  <p className="text-red-500">{emailError.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="name">Nome</label>
                <Input
                  className={`w-full rounded-full border-none bg-praca-green-dark ${nameError && "outline outline-2 outline-red-500"}`}
                  name="name"
                  id="name"
                />
                {nameError && (
                  <p className="text-red-500">{nameError.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 text-left">
                <div className="relative flex flex-row items-center gap-1">
                  <label htmlFor="password">Senha</label>
                  <Button
                    variant={"ghost"}
                    className="group absolute left-20 text-white"
                    onPress={() =>
                      setHelperCard({
                        show: true,
                        helperCardType: "INFO",
                        content: (
                          <div className="flex flex-col gap-2">
                            <p>
                              Senha: Deve ter tamanho mínimo de 8 caracteres e
                              ao menos 1 letra minúscula, 1 letra maiúscula, 1
                              número e 1 caractere especial
                            </p>
                          </div>
                        ),
                      })
                    }
                  >
                    <IconHelp className="text-white" />
                  </Button>
                </div>

                <div className="flex flex-row gap-1">
                  <Input
                    className={`w-full rounded-full border-none bg-praca-green-dark ${passwordError && "outline outline-2 outline-red-500"}`}
                    type={`${!showPasswords.password && "password"}`}
                    name="password"
                    id="password"
                  />
                  <Button
                    className="text-white"
                    variant={"ghost"}
                    onPress={() => {
                      setShowPasswords((prev) => ({
                        ...prev,
                        password: !prev.password,
                      }));
                    }}
                  >
                    {showPasswords.password ?
                      <IconEye />
                    : <IconEyeClosed />}
                  </Button>
                </div>

                {passwordError && (
                  <p className="text-red-500">{passwordError.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="passwordConfirmation">Confirmar senha</label>
                <div className="flex flex-row gap-1">
                  <Input
                    className={`w-full rounded-full border-none bg-praca-green-dark ${confirmPasswordError && "outline outline-2 outline-red-500"}`}
                    type={`${!showPasswords.confirmPasswordError && "password"}`}
                    name="passwordConfirmation"
                    id="passwordConfirmation"
                  />
                  <Button
                    className="text-white"
                    variant={"ghost"}
                    onPress={() => {
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirmPasswordError: !prev.confirmPasswordError,
                      }));
                    }}
                  >
                    {showPasswords.confirmPasswordError ?
                      <IconEye />
                    : <IconEyeClosed />}
                  </Button>
                </div>

                {confirmPasswordError && (
                  <p className="text-red-500">{confirmPasswordError.message}</p>
                )}
              </div>
              <Button
                type="submit"
                variant={"constructive"}
                className="cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
              >
                Cadastrar
              </Button>
            </div>
          </form>
          {enableGoogleLogin && (
            <>
              <div className="my-2 w-full text-center text-white">ou</div>
              <GoogleRegisterButton inviteToken={inviteToken} />
            </>
          )}
        </div>
      }
    </AuthPageShell>
  );
};

export default RegisterForm;
