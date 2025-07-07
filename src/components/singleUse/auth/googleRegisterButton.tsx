"use client";

import { Button } from "@components/button";
import { googleRegister } from "@serverActions/googleLogin";
import { useState } from "react";
import { BsGoogle } from "react-icons/bs";

const GoogleRegisterButton = ({ inviteToken }: { inviteToken: string }) => {
  const [errorMessageGoogle, setErrorMessageGoogle] = useState<string | null>(
    null,
  );
  const register = async () => {
    const res = await googleRegister(inviteToken);
    if (res) {
      setErrorMessageGoogle(res.message);
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
