"use client";

import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { useResetPassword } from "@/lib/serverFunctions/apiCalls/auth";
import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { Input } from "@components/ui/input";
import { IconEye, IconEyeClosed, IconHelp } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AuthPageShell from "../authPageShell";

const PasswordResetForm = ({
  token,
  email,
}: {
  token: string;
  email: string;
}) => {
  const { enqueueSnackbar } = useAppSnackbar();
  const router = useRouter();
  const [resetPassword, isPending] = useResetPassword();
  const [state, setState] = useState<{
    statusCode: number;
    errorMessage: string | null;
  } | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await resetPassword({
      data: formData,
      projectOptions: { silent: true },
    });
    setState({
      statusCode: response.responseInfo.statusCode,
      errorMessage: response.data?.errorMessage ?? null,
    });
  }

  useEffect(() => {
    if (state?.statusCode === 200) {
      enqueueSnackbar(<>Senha redefinida!</>, { variant: "success" });
      router.push("/auth/login");
    } else if (state?.statusCode === 403 || state?.statusCode === 404) {
      enqueueSnackbar(<>{state.errorMessage}</>, { variant: "error" });
    } else if (state?.statusCode === 500) {
      enqueueSnackbar(<>Erro ao redefinir senha!</>, { variant: "error" });
    }
  }, [state, router, enqueueSnackbar]);

  return (
    <AuthPageShell>
      {isPending && <LoadingIcon className="h-32 w-32" />}
      <div className={`w-full max-w-xs ${isPending && "hidden"}`}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 text-center text-white">
            <h2 className="text-2xl">Redefinir senha</h2>
            <h3 className="text-xl">{email}</h3>
            <input type="hidden" value={token} name="token" id="token" />
            <div className="flex flex-col gap-2 text-left">
              <div className="relative flex flex-row items-center gap-1">
                <label htmlFor="password">Senha</label>
                <Button
                  variant={"ghost"}
                  className="group absolute left-20 text-white"
                  onPress={() =>
                    enqueueSnackbar(
                      <div className="flex flex-col gap-2">
                        <p>
                          Senha: Deve ter tamanho mínimo de 8 caracteres e ao
                          menos 1 letra minúscula, 1 letra maiúscula, 1 número e
                          1 caractere especial
                        </p>
                      </div>,
                      { variant: "info" },
                    )
                  }
                >
                  <IconHelp className="text-white" />
                </Button>
              </div>

              <div className="flex flex-row gap-1">
                <Input
                  className={`w-full rounded-full border-none bg-praca-green-dark ${state && state?.statusCode !== 200 && "outline outline-2 outline-red-500"}`}
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
            </div>
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="passwordConfirmation">Confirmar senha</label>
              <div className="flex flex-row gap-1">
                <Input
                  className={`w-full rounded-full border-none bg-praca-green-dark ${state && state?.statusCode !== 200 && "outline outline-2 outline-red-500"}`}
                  type={`${!showPasswords.confirmPassword && "password"}`}
                  name="passwordConfirmation"
                  id="passwordConfirmation"
                />
                <Button
                  className="text-white"
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
            <Button
              type="submit"
              variant={"constructive"}
              className="cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Redefinir senha
            </Button>
          </div>
        </form>
      </div>
    </AuthPageShell>
  );
};

export default PasswordResetForm;
