import { auth } from "../../../lib/auth/auth";
import AlreadyLoggedInError from "../alreadyLoggedInError";
import LoginForm from "./loginForm";

const LoginPage = async () => {
  const session = await auth();
  if (session) {
    return <AlreadyLoggedInError />;
  }
  const enableGoogleLogin = process.env.ENABLE_GOOGLE_LOGIN === "true";
  return <LoginForm enableGoogleLogin={enableGoogleLogin} />;
};

export default LoginPage;
