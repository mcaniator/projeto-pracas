"use client";

import LoginForm from "./loginForm";

const LoginPage = () => {
  const enableGoogleLogin =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true";

  return <LoginForm enableGoogleLogin={enableGoogleLogin} />;
};

export default LoginPage;
