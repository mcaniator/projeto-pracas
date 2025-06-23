import { IconMoodSad, IconTree } from "@tabler/icons-react";

import ButtonLink from "../../../components/ui/buttonLink";

const AuthErrorPage = async (props: {
  searchParams: Promise<{ error: string }>;
}) => {
  const searchParams = await props.searchParams;
  const error = searchParams.error;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <IconTree size={48} className="inline" />
      <h1 className="text-4xl">Projeto praças</h1>
      <h2 className="text-2xl">Erro de autenticação</h2>
      <IconMoodSad size={32} />
      <div className="text-xl">
        {error === "AccessDenied" ?
          " O e-mail fornecido não possui acesso ao sistema!"
        : "Erro desconhecido!"}
      </div>
      <ButtonLink href="/auth/login" className="mt-4">
        Voltar
      </ButtonLink>
    </div>
  );
};

export default AuthErrorPage;
