"use server";

import { redirect } from "next/navigation";

import { checkIfInviteExists } from "../../../serverActions/inviteUtil";
import RegisterForm from "./registerForm";

const RegisterPage = async (props: {
  searchParams: Promise<{ inviteToken: string }>;
}) => {
  const searchParams = await props.searchParams;
  let inviteToken = searchParams.inviteToken;
  const inviteExists = await checkIfInviteExists(inviteToken);
  console.log(inviteToken);
  if (!inviteExists) {
    //redirect("error");
    inviteToken = "TESTE_TOKEN";
  }
  return <RegisterForm inviteToken={inviteToken} />;
};

export default RegisterPage;
