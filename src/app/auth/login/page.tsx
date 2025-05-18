import { auth } from "../../../lib/auth/auth";
import AlreadyLoggedInError from "../alreadyLoggedInError";
import LoginForm from "./loginForm";

const LoginPage = async () => {
  const session = await auth();

  if (session) {
    return <AlreadyLoggedInError />;
  }
  return <LoginForm />;
};

export default LoginPage;
