import { auth } from "@lib/auth/auth";
import { getResetPasswordUserByToken } from "@queries/passwordReset";
import { redirect } from "next/navigation";

import AlreadyLoggedInError from "../alreadyLoggedInError";
import PasswordResetForm from "./passwordResetForm";

const PasswordRecoveryPage = async (props: {
  searchParams: Promise<{ token: string }>;
}) => {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const tokenResponse = await getResetPasswordUserByToken(token);
  if (!tokenResponse) {
    redirect("/error");
  }
  const session = await auth();
  if (session) {
    return <AlreadyLoggedInError />;
  }
  return <PasswordResetForm token={token} email={tokenResponse.user.email} />;
};

export default PasswordRecoveryPage;
