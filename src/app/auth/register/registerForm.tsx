"use client";

import {
  IconEye,
  IconEyeClosed,
  IconHelp,
  IconTree,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";

import LoadingIcon from "../../../components/LoadingIcon";
import { Button } from "../../../components/button";
import GoogleRegisterButton from "../../../components/singleUse/auth/googleRegisterButton";
import { Input } from "../../../components/ui/input";
import register from "../../../serverActions/register";

const RegisterForm = ({ inviteToken }: { inviteToken: string }) => {
  const [state, formAction, isPending] = useActionState(register, null);
  const [showHelps, setShowHelps] = useState({
    username: false,
    password: false,
  });
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
      setErrors({
        statusCode: state.statusCode,
        errors: state.errors,
      });
    }
  }, [state]);
  const emailError = useMemo(
    () => errors.errors?.find((e) => e.element === "email"),
    [errors],
  );
  const nameError = useMemo(
    () => errors.errors?.find((e) => e.element === "name"),
    [errors],
  );
  const usernameError = useMemo(
    () => errors.errors?.find((e) => e.element === "username"),
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
  const divError = useMemo(
    () => errors.errors?.find((e) => e.element === "div"),
    [errors],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }
  return (
    <div className="flex flex-col items-center justify-center px-4">
      <IconTree size={48} className="inline" />
      <h1 className="inline text-4xl">Projeto praças</h1>
      {isPending && <LoadingIcon className="h-32 w-32" />}
      {state?.statusCode === 201 ?
        <div className="flex flex-col items-center gap-2 text-2xl text-green-500">
          Usuário criado com sucesso!
          <Link href={"/auth/login"}>
            <Button className="w-fit">Entrar</Button>
          </Link>
        </div>
      : <div className="rounded-lg bg-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            <div
              className={`flex flex-col gap-4 text-center ${isPending && "hidden"}`}
            >
              <h2 className="text-2xl">Cadastro</h2>
              <div className="flex flex-col gap-2">
                <label htmlFor="email">E-mail</label>
                <Input
                  className={`w-full ${emailError && "outline outline-2 outline-red-500"}`}
                  type="email"
                  name="email"
                  id="email"
                />
                {emailError && (
                  <p className="text-red-500">{emailError.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="name">Nome</label>
                <Input
                  className={`w-full ${nameError && "outline outline-2 outline-red-500"}`}
                  name="name"
                  id="name"
                />
                {nameError && (
                  <p className="text-red-500">{nameError.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative flex flex-row items-center justify-center gap-1">
                  <label htmlFor="username">Nome de usuário</label>
                  <Button
                    variant={"ghost"}
                    className="group relative"
                    onPress={() =>
                      setShowHelps((prev) => ({
                        ...prev,
                        username: !prev.username,
                        password: false,
                      }))
                    }
                  >
                    <IconHelp className="text-black" />
                    <div
                      className={`absolute -left-48 -top-10 w-[75vw] max-w-[220px] rounded-lg bg-black px-3 py-1 text-sm shadow-md transition-opacity duration-200 sm:w-[25vw] ${showHelps.username ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      Nome de indentificação único. Deve conter apenas letras
                      minúsculas e pontos. Exemplo: joao.silva
                    </div>
                  </Button>
                </div>
                <Input
                  className={`w-full ${usernameError && "outline outline-2 outline-red-500"}`}
                  name="username"
                  id="username"
                />
                {usernameError && (
                  <p className="text-red-500">{usernameError.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative flex flex-row items-center justify-center gap-1">
                  <label htmlFor="password">Senha</label>
                  <Button
                    variant={"ghost"}
                    className="group absolute left-2/3"
                    onPress={() =>
                      setShowHelps((prev) => ({
                        username: false,
                        password: !prev.password,
                      }))
                    }
                  >
                    <IconHelp className="text-black" />
                    <div
                      className={`absolute -left-48 -top-10 w-[75vw] max-w-[220px] rounded-lg bg-black px-3 py-1 text-sm shadow-md transition-opacity duration-200 sm:w-[25vw] ${showHelps.password ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      Deve ter tamanho mínimo de 8 caracteres e ao menos 1 letra
                      minúscula, 1 letra maiúscula, 1 número e 1 caractere
                      especial
                    </div>
                  </Button>
                </div>

                <div className="flex flex-row gap-1">
                  <Input
                    className={`w-full ${passwordError && "outline outline-2 outline-red-500"}`}
                    type={`${!showPasswords.password && "password"}`}
                    name="password"
                    id="password"
                  />
                  <Button
                    className="text-black"
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
              <div className="flex flex-col gap-2">
                <label htmlFor="passwordConfirmation">Confirmar senha</label>
                <div className="flex flex-row gap-1">
                  <Input
                    className={`w-full ${confirmPasswordError && "outline outline-2 outline-red-500"}`}
                    type={`${!showPasswords.confirmPasswordError && "password"}`}
                    name="passwordConfirmation"
                    id="passwordConfirmation"
                  />
                  <Button
                    className="text-black"
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
              <Button type="submit" variant={"constructive"}>
                Cadastrar
              </Button>
              {divError && <p className="text-red-500">{divError.message}</p>}
            </div>
          </form>
          <div className="my-2 w-full text-center">ou</div>
          <GoogleRegisterButton inviteToken={inviteToken} />
        </div>
      }
    </div>
  );
};

export default RegisterForm;
