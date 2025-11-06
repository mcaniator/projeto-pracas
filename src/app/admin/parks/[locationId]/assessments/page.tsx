import { Skeleton } from "@mui/material";
import { Suspense } from "react";

import { _fetchAssessmentsByLocation } from "../../../../../lib/serverFunctions/serverActions/assessmentUtil";
import AssessmentsTable from "./assessmentsTable";

const Assessments = async (props: {
  params: Promise<{ locationId: string }>;
}) => {
  const params = await props.params;
  const assessmentsPromise = _fetchAssessmentsByLocation(
    Number(params.locationId),
  );
  return (
    <div className="flex h-full flex-col bg-white p-3 text-black">
      <h3 className="text-2xl font-semibold">Avaliações</h3>
      <Suspense
        fallback={
          <div className="flex flex-col gap-1">
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
          </div>
        }
      >
        <AssessmentsTable assessmentsPromise={assessmentsPromise} />
      </Suspense>
    </div>
  );
};

export default Assessments;
