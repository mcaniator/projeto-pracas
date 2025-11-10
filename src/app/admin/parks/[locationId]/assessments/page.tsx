import { Skeleton } from "@mui/material";
import { IconFountain } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import CAdminHeader from "../../../../../components/ui/cAdminHeader";
import { prisma } from "../../../../../lib/prisma";
import { fetchFormsLatest } from "../../../../../lib/serverFunctions/queries/form";
import { _fetchAssessmentsByLocation } from "../../../../../lib/serverFunctions/serverActions/assessmentUtil";
import AssessmentsTable from "./assessmentsTable";

const Assessments = async (props: {
  params: Promise<{ locationId: string }>;
}) => {
  const params = await props.params;
  const assessmentsPromise = _fetchAssessmentsByLocation(
    Number(params.locationId),
  );
  const location = await prisma.location.findUnique({
    where: { id: Number(params.locationId) },
    select: {
      name: true,
    },
  });
  const formsPromise = fetchFormsLatest({ finalizedOnly: true });
  if (!location) {
    redirect("/error");
  }
  return (
    <div className="flex h-full flex-col overflow-auto p-3">
      <CAdminHeader
        title={location.name}
        subtitle="Avaliações"
        titleIcon={<IconFountain />}
      />
      <Suspense
        fallback={
          <div className="flex flex-col gap-1">
            <Skeleton variant="rectangular" height={53} />
            <Skeleton variant="rectangular" height={53} />
            <Skeleton variant="rectangular" height={53} />
            <Skeleton variant="rectangular" height={53} />
            <Skeleton variant="rectangular" height={53} />
            <Skeleton variant="rectangular" height={53} />
            <Skeleton variant="rectangular" height={53} />
            <Skeleton variant="rectangular" height={53} />
          </div>
        }
      >
        <AssessmentsTable
          locationId={Number(params.locationId)}
          location={location}
          assessmentsPromise={assessmentsPromise}
          formsPromise={formsPromise}
        />
      </Suspense>
    </div>
  );
};

export default Assessments;
