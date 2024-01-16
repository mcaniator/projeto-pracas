"use server";

import { auth } from "@/lib/lucia";
import { userSchema } from "@/lib/zodValidators";
import { cookies } from "next/headers";
import { z } from "zod";

const passwordSchema = z.string().trim().min(6).max(255);

const login = async (prevState: { statusCode: number }, formData: FormData) => {
  let parsedUser;
  try {
    parsedUser = userSchema.parse({
      username: formData.get("username"),
      type: "ADMIN", // ! lembrar de tirar
    });
  } catch (err) {
    return { statusCode: 1 };
  }

  let password;
  try {
    password = passwordSchema.parse(formData.get("password"));
  } catch (err) {
    return { statusCode: 1 };
  }

  try {
    const key = await auth.useKey("username", parsedUser.username, password);

    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });

    const sessionCookie = auth.createSessionCookie(session);
    cookies().set(sessionCookie);
  } catch (err) {
    return { statusCode: 2 };
  }

  return { statusCode: 0 };
};

const signup = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  let parsedUser;
  try {
    parsedUser = userSchema.parse({
      username: formData.get("username"),
      type: "ADMIN", // ! lembrar de tirar
    });
  } catch (err) {
    console.log(err);
    return {
      statusCode: 1,
    };
  }

  let password;
  let passwordConfirmation;
  try {
    password = passwordSchema.parse(formData.get("password"));
    passwordConfirmation = passwordSchema.parse(
      formData.get("passwordConfirmation"),
    );
  } catch (err) {
    return {
      statusCode: 1,
    };
  }

  if (password != passwordConfirmation) return { statusCode: 3 };

  try {
    const user = await auth.createUser({
      key: {
        providerId: "username",
        providerUserId: parsedUser.username,
        password,
      },
      attributes: parsedUser,
    });

    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });

    const sessionCookie = auth.createSessionCookie(session);
    cookies().set(sessionCookie);
  } catch (err) {
    return { statusCode: 2 };
  }

  return { statusCode: 0 };
};

export { login, signup };
