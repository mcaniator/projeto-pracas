"use client";

import { Button } from "@components/button";
import { useLogout } from "@/lib/serverFunctions/apiCalls/auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { BsGoogle } from "react-icons/bs";

const GoogleRegisterButton = ({ inviteToken }: { inviteToken: string }) => {
  const [logout] = useLogout();
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
      const response = await logout({ projectOptions: { silent: true } });
      if (
        response.responseInfo.statusCode < 200 ||
        response.responseInfo.statusCode >= 300
      ) {
        throw new Error("Unable to sign out before Google registration.");
      }
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
