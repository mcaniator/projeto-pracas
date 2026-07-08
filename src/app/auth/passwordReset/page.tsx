"use client";

import LoadingIcon from "@/components/LoadingIcon";
import { useFetchPasswordResetToken } from "@/lib/serverFunctions/apiCalls/passwordReset";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import PasswordResetForm from "./passwordResetForm";

const PasswordRecoveryContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [fetchPasswordResetToken] = useFetchPasswordResetToken();
  const [email, setEmail] = useState<string | null>();

  useEffect(() => {
    const loadToken = async () => {
      const response = await fetchPasswordResetToken({
        params: { token },
        projectOptions: { silent: true },
      });

      if (!response.data?.email) {
        setEmail(null);
        router.replace("/error");
        return;
      }

      setEmail(response.data.email);
    };

    void loadToken();
  }, [token]);

  if (!email) {
    return <LoadingIcon className="h-32 w-32" />;
  }

  return <PasswordResetForm token={token} email={email} />;
};

const PasswordRecoveryPage = () => {
  return (
    <Suspense fallback={<LoadingIcon className="h-32 w-32" />}>
      <PasswordRecoveryContent />
    </Suspense>
  );
};

export default PasswordRecoveryPage;
