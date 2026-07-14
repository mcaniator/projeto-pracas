"use client";

import Loading from "@/app/admin/loading";
import LoadingIcon from "@/components/LoadingIcon";
import { useUserContext } from "@/components/context/UserContext";
import { useFetchAssessmentTree } from "@/lib/serverFunctions/apiCalls/assessment";
import type { FetchAssessmentTreeResponse } from "@/lib/serverFunctions/queries/assessment";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import AssessmentClient from "./assessmentClient";

const normalizeAssessmentTreeDates = (
  assessmentTree: FetchAssessmentTreeResponse["assessmentTree"],
): FetchAssessmentTreeResponse["assessmentTree"] => ({
  ...assessmentTree,
  startDate: new Date(assessmentTree.startDate),
  endDate: assessmentTree.endDate ? new Date(assessmentTree.endDate) : null,
  updatedAt: new Date(assessmentTree.updatedAt),
});

const ResponsesContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessmentId");
  const { user } = useUserContext();
  const [fetchAssessmentTree, isLoading] = useFetchAssessmentTree({});
  const [assessmentTree, setAssessmentTree] = useState<
    FetchAssessmentTreeResponse["assessmentTree"] | null
  >(null);

  useEffect(() => {
    const loadAssessment = async () => {
      if (!assessmentId) {
        router.replace("/error");
        return;
      }

      const response = await fetchAssessmentTree({
        params: { assessmentId },
      });
      if (!response.data?.assessmentTree?.location) {
        router.replace("/error");
        return;
      }

      setAssessmentTree(
        normalizeAssessmentTreeDates(response.data.assessmentTree),
      );
    };

    void loadAssessment();
  }, [assessmentId, fetchAssessmentTree, router]);

  if (isLoading || !assessmentTree?.location) {
    return <Loading />;
  }

  const userCanEdit =
    assessmentTree.user.id === user.id ||
    user.roles.includes("ASSESSMENT_MANAGER");
  const location = assessmentTree.location;

  return (
    <AssessmentClient
      locationId={location.id}
      locationName={location.name}
      locationPolygonGeoJson={location.st_asgeojson}
      assessmentTree={assessmentTree}
      finalized={assessmentTree.isFinalized}
      userCanEdit={userCanEdit}
    />
  );
};

const Responses = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingIcon size={128} />
        </div>
      }
    >
      <ResponsesContent />
    </Suspense>
  );
};

export default Responses;
