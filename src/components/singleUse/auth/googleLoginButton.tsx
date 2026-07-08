"use client";

import { Button } from "@components/button";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { BsGoogle } from "react-icons/bs";

const GoogleLoginButton = () => {
  const [errorMessageGoogle, setErrorMessageGoogle] = useState<string | null>(
    null,
  );

  const login = async () => {
    try {
      await signOut({ redirect: false });
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
