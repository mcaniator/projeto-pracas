"use client";

import { Button } from "@components/button";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { BsGoogle } from "react-icons/bs";

const GoogleRegisterButton = ({ inviteToken }: { inviteToken: string }) => {
  const [errorMessageGoogle, setErrorMessageGoogle] = useState<string | null>(
    null,
  );
  const register = async () => {
    try {
      if (!inviteToken) {
        setErrorMessageGoogle("Convite invalido!");
        return;
      }

      document.cookie = `inviteToken=${encodeURIComponent(
        inviteToken,
      )}; path=/; max-age=3600; SameSite=Lax`;
      await signOut({ redirect: false });
      await signIn("google", { callbackUrl: "/admin/map" });
    } catch (e) {
      setErrorMessageGoogle("Erro ao registrar com Google!");
    }
  };
  return (
    <div className="w-full">
      <Button
        type="submit"
        variant={"admin"}
        className="flex w-full flex-row items-center justify-center gap-2"
        onPress={() => {
          void register();
        }}
      >
        <BsGoogle className="mb-1" /> Entrar com Google
      </Button>
      <p>{errorMessageGoogle}</p>
    </div>
  );
};

export default GoogleRegisterButton;
