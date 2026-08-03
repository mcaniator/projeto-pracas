"use client";

import { useLogout } from "@/lib/serverFunctions/apiCalls/auth";
import { Button } from "@components/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { BsGoogle } from "react-icons/bs";

const GoogleLoginButton = () => {
  const [logout] = useLogout();
  const [errorMessageGoogle, setErrorMessageGoogle] = useState<string | null>(
    null,
  );

  const login = async () => {
    try {
      const response = await logout({ projectOptions: { silent: true } });
      if (
        response.responseInfo.statusCode < 200 ||
        response.responseInfo.statusCode >= 300
      ) {
        throw new Error("Unable to sign out before Google login.");
      }
      await signIn("google", { callbackUrl: "/admin/map" });
    } catch (e) {
      setErrorMessageGoogle("Erro ao fazer login com Google!");
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant={"admin"}
        className="flex w-full flex-row items-center justify-center gap-2"
        onPress={() => {
          void login();
        }}
      >
        <BsGoogle className="mb-1" /> Entrar com Google
      </Button>
      <p>{errorMessageGoogle}</p>
    </div>
  );
};

export default GoogleLoginButton;
