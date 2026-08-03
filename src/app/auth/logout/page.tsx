"use client";

import { useLogout } from "@/lib/serverFunctions/apiCalls/auth";
import { Button } from "@components/button";
import { useRouter } from "next-nprogress-bar";

import AuthPageShell from "../authPageShell";

const SignOutPage = () => {
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
        <h2 className="text-2xl">Logout</h2>
        <p className="text-white/90">
          Encerrar a sessão atual vai redirecionar você para a página inicial.
        </p>
        <Button
          variant={"destructive"}
          className="cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
          onPress={() => {
            void logout();
          }}
        >
          Sair
        </Button>
      </div>
    </AuthPageShell>
  );
};

export default SignOutPage;
