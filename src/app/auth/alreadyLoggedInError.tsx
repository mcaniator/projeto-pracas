"use client";

import CButton from "@/components/ui/cButton";
import { useLogout } from "@/lib/serverFunctions/apiCalls/auth";
import { useRouter } from "next-nprogress-bar";

import AuthPageShell from "./authPageShell";

const AlreadyLoggedInError = () => {
  const router = useRouter();
  const [logout] = useLogout({
    callbacks: {
      onSuccess: () => {
        router.replace("/");
      },
    },
  });

  return (
    <AuthPageShell>
      <div className="flex w-full max-w-xs flex-col gap-4 text-white">
        <h2 className="text-2xl">Você já está logado!</h2>
        <p className="text-white/90">
          Para acessar outra conta, finalize a sessão atual primeiro.
        </p>
        <CButton
          onClick={() => {
            void logout();
          }}
          color="secondary"
          loadingOnClick
          sx={{
            textTransform: "none",
            borderRadius: 20,
            fontSize: 16,
          }}
        >
          Finalizar
        </CButton>
      </div>
    </AuthPageShell>
  );
};

export default AlreadyLoggedInError;
