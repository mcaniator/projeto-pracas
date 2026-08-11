"use client";

import Loading from "@/app/admin/loading";
import LoadingIcon from "@/components/LoadingIcon";
import { useUserContext } from "@/components/context/UserContext";
import { fetchAdminSQLiteAssessmentTree } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import { useFetchAssessmentTree } from "@/lib/serverFunctions/apiCalls/assessment";
import type { FetchAssessmentTreeResponse } from "@/lib/serverFunctions/queries/assessment";
import { Capacitor } from "@capacitor/core";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import AssessmentClient from "./assessmentClient";

const ResponsesContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessmentId");
  const isSQLiteAssessment = searchParams.get("isSQLiteAssessment") === "true";
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
      let assessmentTree:
        | FetchAssessmentTreeResponse["assessmentTree"]
        | undefined = undefined;
      if (isSQLiteAssessment && Capacitor.isNativePlatform()) {
        //SQLite assessment
        const response = await fetchAdminSQLiteAssessmentTree({
          params: { assessmentId },
        });
        assessmentTree = response.data?.assessmentTree;
      } else {
        const response = await fetchAssessmentTree({
          params: { assessmentId },
        });
        assessmentTree = response.data?.assessmentTree;
      }

      if (!assessmentTree) {
        router.replace("/error");
        return;
      }

      setAssessmentTree(assessmentTree);
    };

    void loadAssessment();
  }, [assessmentId, fetchAssessmentTree, isSQLiteAssessment, router]);

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
