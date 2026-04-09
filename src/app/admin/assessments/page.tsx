import { fetchForms } from "@/lib/serverFunctions/queries/form";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import AssessmentsClient from "./assessmentsClient";

const Assessments = () => {
  const usersPromise = prisma.user.findMany({
    where: {
      assessment: {
        some: {},
      },
    },
    select: {
      id: true,
      username: true,
    },
  }) as Prisma.PrismaPromise<{ id: string; username: string }[]>; // Assertion for defining username as not null

  const formsPromise = fetchForms({ finalizedOnly: true }).then(
    (response) => response.data.forms,
  );

  return (
    <AssessmentsClient
      usersPromise={usersPromise}
      formsPromise={formsPromise}
    />
  );
};

export default Assessments;
