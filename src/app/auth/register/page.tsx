"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import RegisterForm from "./registerForm";

const RegisterContent = () => {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken") ?? "";
  const enableGoogleLogin =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true";

  return (
    <RegisterForm
      inviteToken={inviteToken}
      enableGoogleLogin={enableGoogleLogin}
    />
  );
};

const RegisterPage = () => {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
};

export default RegisterPage;
