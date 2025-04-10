import { Features } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

const seed = async () => {
  const features = Object.values(Features);
  await Promise.all(
    features.map((feature) =>
      prisma.permission.upsert({
        where: { feature },
        update: {},
        create: { feature },
      }),
    ),
  );

  //Admin creation
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL is not set in the environment variables.");
  }
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set in the environment variables.");
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
      permissions: {
        connect: features.map((feature) => ({ feature })),
      },
    },
  });
};

seed();
