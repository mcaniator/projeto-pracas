"use server";

import { prisma } from "@/lib/prisma";
import { local } from "@prisma/client";

export default async function cadastrar(content: local) {
  try {
    const local = await prisma.local.create({
      data: content,
    });
  } catch (error) {
    console.log(error);
  }
}
