import { createHmac } from "crypto";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.COOKIE_SECRET;

const setSignedCookie = async (
  name: string,
  value: string,
  options: { maxAge?: number } = { maxAge: 60 * 60 * 24 },
) => {
  if (!SECRET_KEY) {
    throw new Error("COOKIE_SECRET is not defined");
  }

  const cookieSignature = createHmac("sha256", SECRET_KEY)
    .update(value)
    .digest("hex");
  const cookieValue = `${value}.${cookieSignature}`;
  const cookieStore = await cookies();
  cookieStore.set(name, cookieValue, {
    sameSite: "strict",
    httpOnly: true,
    maxAge: options.maxAge || 60 * 60 * 24,
  });
};

const getSignedCookieValue = async (name: string) => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  if (!cookie) {
    return null;
  }
  const cookieValue = cookie.value;

  const [value, signature] = cookieValue.split(".");

  if (!value || !signature) {
    return null;
  }

  if (!SECRET_KEY) {
    throw new Error("COOKIE_SECRET is not defined");
  }

  const expectedSignature = createHmac("sha256", SECRET_KEY)
    .update(value)
    .digest("hex");

  if (expectedSignature !== signature) {
    return null;
  }

  return value;
};

export { setSignedCookie, getSignedCookieValue };
