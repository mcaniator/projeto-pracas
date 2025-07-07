"use client";

import { Button } from "@components/button";
import { googleAuthenticate } from "@serverActions/googleLogin";
import { useActionState } from "react";
import { BsGoogle } from "react-icons/bs";

const GoogleLoginButton = () => {
  const [errorMessageGoogle, dispatchGoogle] = useActionState(
    googleAuthenticate,
    undefined,
  );
  return (
    <form action={dispatchGoogle}>
      <Button
        type="submit"
        variant={"admin"}
        className="flex w-full flex-row items-center justify-center gap-2"
      >
        <BsGoogle className="mb-1" /> Entrar com Google
      </Button>
      <p>{errorMessageGoogle?.message}</p>
    </form>
  );
};

export default GoogleLoginButton;
