"use client";

import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import { Input } from "@components/ui/input";
import { _resetPassword } from "@serverActions/passwordResetUtil";
import {
  IconEye,
  IconEyeClosed,
  IconHelp,
  IconTree,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";

const PasswordResetForm = ({
  token,
  email,
}: {
  token: string;
  email: string;
}) => {
  const { setHelperCard } = useHelperCard();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(_resetPassword, null);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  useEffect(() => {
    if (state?.statusCode === 200) {
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Senha redefinida!</>,
      });
      router.push("/auth/login");
    } else if (state?.statusCode === 403 || state?.statusCode === 404) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>{state.errorMessage}</>,
      });
    } else if (state?.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao redefinir senha!</>,
      });
    }
  }, [state, router, setHelperCard]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <IconTree size={48} className="inline" />
      <h1 className="inline text-4xl">Projeto praças</h1>
      {isPending && <LoadingIcon className="h-32 w-32" />}
      <div className={`rounded-lg bg-gray-200 p-6 ${isPending && "hidden"}`}>
        <form onSubmit={handleSubmit}>
          <div className={`flex flex-col gap-4 text-center`}>
            <h2 className="text-2xl">Redefinir senha</h2>
            <h3 className="text-xl">{email}</h3>
            <input type="hidden" value={token} name="token" id="token" />
            <div className="flex flex-col gap-2">
              <div className="relative flex flex-row items-center justify-center gap-1">
                <label htmlFor="password">Senha</label>
                <Button
                  variant={"ghost"}
                  className="group absolute left-2/3"
                  onPress={() =>
                    setHelperCard({
                      show: true,
                      helperCardType: "INFO",
                      content: (
                        <div className="flex flex-col gap-2">
                          <p>
                            Senha: Deve ter tamanho mínimo de 8 caracteres e ao
                            menos 1 letra minúscula, 1 letra maiúscula, 1 número
                            e 1 caractere especial
                          </p>
                        </div>
                      ),
                    })
                  }
                >
                  <IconHelp className="text-black" />
                </Button>
              </div>

              <div className="flex flex-row gap-1">
                <Input
                  className={`w-full ${state && state?.statusCode !== 200 && "outline outline-2 outline-red-500"}`}
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
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="passwordConfirmation">Confirmar senha</label>
              <div className="flex flex-row gap-1">
                <Input
                  className={`w-full ${state && state?.statusCode !== 200 && "outline outline-2 outline-red-500"}`}
                  type={`${!showPasswords.confirmPassword && "password"}`}
                  name="passwordConfirmation"
                  id="passwordConfirmation"
                />
                <Button
                  className="text-black"
                  variant={"ghost"}
                  onPress={() => {
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirmPassword: !prev.confirmPassword,
                    }));
                  }}
                >
                  {showPasswords.confirmPassword ?
                    <IconEye />
                  : <IconEyeClosed />}
                </Button>
              </div>
            </div>
            <Button type="submit" variant={"constructive"}>
              Redefinir senha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetForm;
