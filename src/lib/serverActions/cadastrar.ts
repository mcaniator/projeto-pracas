"use server";

import { prisma } from "@/lib/prisma";
import { Local } from "@prisma/client";

const cadastrar = async (content: Local) => {
  try {
    await prisma.local.create({
      data: content,
    });
  } catch (error) {
    console.log(error);
  }
};

export { cadastrar };
