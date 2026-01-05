import { fetchForms } from "@/lib/serverFunctions/queries/form";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import AssessmentsClient from "./assessmentsClient";

const Assessments = async () => {
  const locationsPromise = prisma.location.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  const usersPromise = prisma.user.findMany({
    where: {
      username: {
        not: null,
      },
      assessment: {
        some: {},
      },
    },
    select: {
      id: true,
      username: true,
    },
  }) as Prisma.PrismaPromise<{ id: string; username: string }[]>; // Assertion for defining username as not null
  const forms = (await fetchForms({ finalizedOnly: true })).data.forms;
  return (
    <AssessmentsClient
      locationsPromise={locationsPromise}
      usersPromise={usersPromise}
      forms={forms}
    />
  );
};

export default Assessments;
