import { IconMoodSad } from "@tabler/icons-react";

import ButtonLink from "../../../components/ui/buttonLink";
import AuthPageShell from "../authPageShell";

const AuthErrorPage = async (props: {
  searchParams: Promise<{ error: string }>;
}) => {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  return (
    <AuthPageShell>
      <div className="flex w-full max-w-xs flex-col items-center gap-4 text-white">
        <h2 className="text-2xl">Erro de autenticação</h2>
        <IconMoodSad size={32} />
        <div className="text-base text-white/90">
          {error === "AccessDenied" ?
            "O e-mail fornecido não possui acesso ao sistema!"
          : "Erro desconhecido!"}
        </div>
        <ButtonLink
          href="/auth/login"
          className="mt-2 transition-transform duration-300 ease-in-out hover:scale-105"
        >
          Voltar
        </ButtonLink>
      </div>
    </AuthPageShell>
  );
};

export default AuthErrorPage;
