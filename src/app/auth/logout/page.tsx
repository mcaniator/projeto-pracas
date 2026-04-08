"use client";

import { Button } from "@components/button";
import { signOut } from "next-auth/react";

import AuthPageShell from "../authPageShell";

const SignOutPage = () => {
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
            void signOut({ callbackUrl: "/", redirect: true });
          }}
        >
          Sair
        </Button>
      </div>
    </AuthPageShell>
  );
};

export default SignOutPage;
