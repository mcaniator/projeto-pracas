"use client";

import { Button } from "@components/button";
import { IconTree } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

const AlreadyLoggedInError = () => {
  const handleLogout = async () => {
    await signOut();
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <IconTree size={48} className="inline" />
      <h1 className="inline text-4xl">Projeto praças</h1>
      <h2 className="text-2xl">Você já está logado!</h2>
      <Button
        onPress={() => {
          void handleLogout();
        }}
      >
        Deslogar
      </Button>
    </div>
  );
};

export default AlreadyLoggedInError;
