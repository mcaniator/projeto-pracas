"use client";

import { Button } from "@components/button";
import { IconTree } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

const SignOutPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <IconTree size={48} className="inline" />
      <h1 className="text-4xl">Projeto praças</h1>
      <h2 className="text-2xl">Logout</h2>
      <Button
        variant={"destructive"}
        onPress={() => {
          void signOut({ callbackUrl: "/", redirect: true });
        }}
      >
        Sair
      </Button>
    </div>
  );
};

export default SignOutPage;
