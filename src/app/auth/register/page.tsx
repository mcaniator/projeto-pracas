import { redirect } from "next/navigation";

import { auth } from "../../../lib/auth/auth";
import { checkIfInviteExists } from "../../../serverActions/inviteUtil";
import AlreadyLoggedInError from "../alreadyLoggedInError";
import RegisterForm from "./registerForm";

const RegisterPage = async (props: {
  searchParams: Promise<{ inviteToken: string }>;
}) => {
  const searchParams = await props.searchParams;
  const inviteToken = searchParams.inviteToken;
  const inviteExists = await checkIfInviteExists(inviteToken);
  if (!inviteExists) {
    redirect("/error");
  }
  const session = await auth();
  if (session) {
    return <AlreadyLoggedInError />;
  }
  return <RegisterForm inviteToken={inviteToken} />;
};

export default RegisterPage;
