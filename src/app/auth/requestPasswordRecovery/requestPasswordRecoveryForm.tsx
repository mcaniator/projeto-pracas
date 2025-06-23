"use client";

import { IconTree } from "@tabler/icons-react";
import { startTransition, useActionState, useEffect } from "react";

import { Button } from "../../../components/button";
import { useHelperCard } from "../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../components/context/loadingContext";
import { Input } from "../../../components/ui/input";
import { createPasswordReset } from "../../../serverActions/passwordResetUtil";

const RequestPasswordRecoveryForm = () => {
  const { setHelperCard } = useHelperCard();
  const { setLoadingOverlayVisible } = useLoadingOverlay();
  const [state, formAction, isPending] = useActionState(
    createPasswordReset,
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
            Um e-mail do recuperação de senha já foi enviado para este endereço
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
        content: <>Erro ao registrar recuperção de senha.</>,
      });
    }
  }, [state, setHelperCard]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <IconTree size={48} className="inline" />
      <h1 className="inline text-4xl">Projeto praças</h1>
      <div className={`rounded-lg bg-gray-200 p-6 ${isPending && "hidden"}`}>
        <form onSubmit={handleSubmit}>
          <div className={`flex flex-col gap-4 text-center`}>
            <h2 className="text-2xl">Redefinir senha</h2>
            <div className="flex flex-col gap-2">
              <div className="relative flex flex-row items-center justify-center gap-1">
                <label htmlFor="email">E-mail</label>
              </div>
              <Input
                className={`w-full`}
                type="email"
                name="email"
                id="email"
              />
            </div>
            <Button type="submit" variant={"constructive"}>
              Solicitar redefinição de senha
            </Button>
            <div>
              Caso o e-mail informado esteja cadastrado no sistema, você
              receberá um link para redefinir sua senha.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestPasswordRecoveryForm;
