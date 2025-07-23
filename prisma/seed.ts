import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { SystemSection } from "../src/app/admin/users/permissionsModal";
import { prisma } from "../src/lib/prisma";

const seed = async () => {
  const roles = Object.values(Role);

  //Admin creation
  try {
    const email = process.env.ADMIN_EMAIL;
    if (!email) {
      throw new Error("ADMIN_EMAIL is not set in the environment variables.");
    }
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      throw new Error(
        "ADMIN_PASSWORD is not set in the environment variables.",
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: "Admin",
        username: "admin",
        password: hashedPassword,
        roles: [
          "ASSESSMENT_MANAGER",
          "FORM_MANAGER",
          "PARK_MANAGER",
          "TALLY_MANAGER",
          "USER_MANAGER",
        ],
      },
    });
  } catch (e) {
    console.log("Error during admin creation: ", e);
  }
  if (process.env.CREATE_DUMMY_USERS === "true") {
    //Dummy users creation
    try {
      const password = process.env.DUMMY_USERS_PASSWORD;
      if (!password) {
        throw new Error(
          "CREATE_DUMMY_USERS defined as 'true', but DUMMY_USERS_PASSWORD was not defined",
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const numberOfUsers = 100;
      await prisma.$transaction(
        async (prisma) => {
          for (let i = 0; i < numberOfUsers; i++) {
            await prisma.user.upsert({
              where: {
                email: `usuario${i + 1}@teste.com`,
              },
              update: {},
              create: {
                name: `Usuário teste ${i + 1}`,
                username: `usuario.teste${i + 1}`,
                email: `usuario${i + 1}@teste.com`,
                password: hashedPassword,
              },
            });
          }
        },
        { timeout: 120000 },
      );
    } catch (e) {
      console.log("Error during dummy users creation: ", e);
    }
  }
};

seed();
