"use client";

import Loading from "@/app/admin/loading";
import LoadingIcon from "@/components/LoadingIcon";
import { useUserContext } from "@/components/context/UserContext";
import {
  fetchAdminSQLiteAssessmentTree,
  fetchAdminSQLiteIfCanSaveAssessment,
} from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import { useFetchAssessmentTree } from "@/lib/serverFunctions/apiCalls/assessment";
import type { FetchAssessmentTreeResponse } from "@/lib/serverFunctions/queries/assessment";
import { Capacitor } from "@capacitor/core";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import AssessmentClient from "./assessmentClient";

const ResponsesContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = Number(searchParams.get("assessmentId"));
  const [isSQLiteAssessment, setIsSQLiteAssessment] = useState(
    Capacitor.isNativePlatform() &&
      searchParams.get("isSQLiteAssessment") === "true",
  );
  const { user } = useUserContext();
  const [fetchAssessmentTree, isLoading] = useFetchAssessmentTree({});
  const [assessmentTree, setAssessmentTree] = useState<
    FetchAssessmentTreeResponse["assessmentTree"] | null
  >(null);
  const [canSaveOffline, setCanSaveOffline] = useState(false);

  useEffect(() => {
    const loadAssessment = async () => {
      if (!assessmentId) {
        router.replace("/error");
        return;
      }
      let assessmentTree:
        | FetchAssessmentTreeResponse["assessmentTree"]
        | undefined = undefined;
      if (
        Capacitor.isNativePlatform() &&
        searchParams.get("isSQLiteAssessment") === "true"
      ) {
        //SQLite assessment
        const response = await fetchAdminSQLiteAssessmentTree({
          params: { assessmentId },
        });
        assessmentTree = response.data?.assessmentTree;
      } else {
        //Server assessment
        const response = await fetchAssessmentTree({
          params: { assessmentId },
          requestOptions: {
            cache: "reload",
          },
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
  }, [assessmentId, fetchAssessmentTree, searchParams, router]);

  useEffect(() => {
    const checkIfCanSaveOffline = async () => {
      // Check if can save offline
      if (!assessmentTree) return;
      const checkResponse = await fetchAdminSQLiteIfCanSaveAssessment({
        params: {
          formId: assessmentTree.formId,
          locationId: assessmentTree.location.id,
          userId: assessmentTree.user.id,
        },
      });

      setCanSaveOffline(checkResponse.data?.canSave || false);
    };

    if (assessmentTree) {
      void checkIfCanSaveOffline();
    }
  }, [assessmentTree]);

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
      canSaveOffline={canSaveOffline}
      isSQLiteAssessment={isSQLiteAssessment}
      onIsSQLiteAssessmentChange={(v) => {
        setIsSQLiteAssessment(v);
      }}
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
