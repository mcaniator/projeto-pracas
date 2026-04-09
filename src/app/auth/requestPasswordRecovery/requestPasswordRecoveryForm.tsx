"use client";

import CButton from "@/components/ui/cButton";
import { useHelperCard } from "@components/context/helperCardContext";
import { useLoadingOverlay } from "@components/context/loadingContext";
import { Input } from "@components/ui/input";
import { _createPasswordReset } from "@serverActions/passwordResetUtil";
import { startTransition, useActionState, useEffect } from "react";

import AuthPageShell from "../authPageShell";

const RequestPasswordRecoveryForm = () => {
  const { setHelperCard } = useHelperCard();
  const { setLoadingOverlayVisible } = useLoadingOverlay();
  const [state, formAction, isPending] = useActionState(
    _createPasswordReset,
    null,
  );

  useEffect(() => {
    setLoadingOverlayVisible(isPending);
  }, [isPending, setLoadingOverlayVisible]);

  useEffect(() => {
    if (state?.statusCode === 503) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Serviço indisponível!</>,
      });
    } else if (state?.statusCode === 400) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>E-mail em formato incorreto!</>,
      });
    } else if (state?.statusCode === 409) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: (
          <>
            Um e-mail de recuperação de senha já foi enviado para este endereço
            de e-mail!
          </>
        ),
      });
    } else if (state?.statusCode === 201) {
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        customTimeout: 15000,
        content: (
          <>
            E-mail enviado! Por favor, confira sua caixa de entrada. Caso não
            tenha recebido, certifique-se que o endereço informado é o mesmo
            utilizado para se cadastrar no sistema.
          </>
        ),
      });
    } else if (state?.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao registrar recuperação de senha.</>,
      });
    }
  }, [state, setHelperCard]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
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
