"use server";

import { redirect } from "next/navigation";

import { HelperCardProvider } from "../../../components/context/helperCardContext";
import { checkIfInviteExists } from "../../../serverActions/inviteUtil";
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
  return (
    <HelperCardProvider>
      <RegisterForm inviteToken={inviteToken} />
    </HelperCardProvider>
  );
};

export default RegisterPage;
