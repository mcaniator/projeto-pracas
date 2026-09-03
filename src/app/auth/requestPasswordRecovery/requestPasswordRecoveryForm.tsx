"use client";

import CButton from "@/components/ui/cButton";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { useRequestPasswordReset } from "@/lib/serverFunctions/apiCalls/auth";
import { useLoadingOverlay } from "@components/context/loadingContext";
import { Input } from "@components/ui/input";
import { useEffect, useState } from "react";

import AuthPageShell from "../authPageShell";

const RequestPasswordRecoveryForm = () => {
  const { enqueueSnackbar } = useAppSnackbar();
  const { setLoadingOverlayVisible } = useLoadingOverlay();
  const [requestPasswordReset, isPending] = useRequestPasswordReset();
  const [state, setState] = useState<{ statusCode: number } | null>(null);

  useEffect(() => {
    setLoadingOverlayVisible(isPending);
  }, [isPending, setLoadingOverlayVisible]);

  useEffect(() => {
    if (state?.statusCode === 503) {
      enqueueSnackbar(<>Serviço indisponível!</>, { variant: "error" });
    } else if (state?.statusCode === 400) {
      enqueueSnackbar(<>E-mail em formato incorreto!</>, { variant: "error" });
    } else if (state?.statusCode === 409) {
      enqueueSnackbar(
        <>
          Um e-mail de recuperação de senha já foi enviado para este endereço de
          e-mail!
        </>,
        { variant: "error" },
      );
    } else if (state?.statusCode === 201) {
      enqueueSnackbar(
        <>
          E-mail enviado! Por favor, confira sua caixa de entrada. Caso não
          tenha recebido, certifique-se que o endereço informado é o mesmo
          utilizado para se cadastrar no sistema.
        </>,
        { variant: "success" },
      );
    } else if (state?.statusCode === 500) {
      enqueueSnackbar(<>Erro ao registrar recuperação de senha.</>, {
        variant: "error",
      });
    }
  }, [state, enqueueSnackbar]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await requestPasswordReset({
      data: formData,
      projectOptions: { silent: true },
    });
    setState({ statusCode: response.responseInfo.statusCode });
  }

  return (
    <AuthPageShell>
      <div className={`w-full max-w-xs ${isPending && "hidden"}`}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 text-center text-white">
            <h2 className="text-2xl">Redefinir senha</h2>
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="email">E-mail</label>
              <Input
                className="w-full rounded-full border-none bg-praca-green-dark"
                type="email"
                name="email"
                id="email"
              />
            </div>
            <CButton
              type="submit"
              color="secondary"
              sx={{
                textTransform: "none",
                borderRadius: 20,
                fontSize: 16,
              }}
            >
              Solicitar redefinição
            </CButton>
            <div className="px-14 text-sm text-white/90">
              Caso o e-mail informado esteja cadastrado no sistema, você
              receberá um link para redefinir sua senha.
            </div>
          </div>
        </form>
      </div>
    </AuthPageShell>
  );
};

export default RequestPasswordRecoveryForm;
