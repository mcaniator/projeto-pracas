"use server";

import { lucia, validateRequest } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/zodValidators";
import { generateId } from "lucia";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { Argon2id } from "oslo/password";
import { z } from "zod";

const usernameSchema = z.string().trim().toLowerCase().min(1).max(255);
const passwordSchema = z.string().trim().min(6).max(255);

const signin = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  let parsedPassword;
  try {
    parsedPassword = passwordSchema.parse(formData.get("password"));
  } catch (err) {
    return { statusCode: 1 };
  }

  let parsedUsername;
  try {
    parsedUsername = usernameSchema.parse(formData.get("username"));
  } catch (err) {
    return { statusCode: 1 };
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: {
        username: parsedUsername,
      },
    });
  } catch (err) {
    return { statusCode: 2 };
  }

  if (user === null) return { statusCode: 3 };

  const validPassword = await new Argon2id().verify(
    user.hashed_password,
    parsedPassword,
  );
  if (!validPassword) return { statusCode: 4 };

  const session = await lucia.createSession(user.id, {});

  revalidateTag("session");

  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return { statusCode: 0 };
};

const signup = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  let password;
  let passwordConfirmation;
  try {
    password = z
      .string()
      .trim()
      .parse(passwordSchema.parse(formData.get("password")));
    passwordConfirmation = z
      .string()
      .trim()
      .parse(formData.get("passwordConfirmation"));
  } catch (err) {
    return { statusCode: 1 };
  }

  if (password != passwordConfirmation) return { statusCode: 3 };

  const hashedPassword = await new Argon2id().hash(
    passwordSchema.parse(password),
  );

  let parsedUser;
  try {
    parsedUser = userSchema.parse({
      username: formData.get("username"),
      type: "ADMIN", // ! lembrar de tirar
    });
  } catch (err) {
    return { statusCode: 1 };
  }

  const userId = generateId(15);

  try {
    await prisma.user.create({
      data: { id: userId, hashed_password: hashedPassword, ...parsedUser },
    });
  } catch (err) {
    return { statusCode: 2 };
  }

  revalidateTag("user");

  const session = await lucia.createSession(userId, {});

  revalidateTag("session");

  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return { statusCode: 0 };
};

const signout = async () => {
  const { session } = await validateRequest();
  if (!session) {
    return {
      statusCode: 1,
    };
  }

  await lucia.invalidateSession(session.id);

  revalidateTag("session");

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return { statusCode: 0 };
};

export { signin, signout, signup };
