import { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import AssessmentsClient from "./assessmentsClient";

const Assessments = () => {
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
  const formsPromise = prisma.form.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  return (
    <AssessmentsClient
      locationsPromise={locationsPromise}
      usersPromise={usersPromise}
      formsPromise={formsPromise}
    />
  );
};

export default Assessments;
