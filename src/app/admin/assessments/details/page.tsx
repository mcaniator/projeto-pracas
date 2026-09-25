"use client";

import Loading from "@/app/admin/loading";
import { useUserContext } from "@/components/context/UserContext";
import CCircularProgress from "@/components/ui/CCircularProgress";
import {
  fetchAdminSQLiteAssessmentDetails,
  fetchAdminSQLiteIfCanSaveAssessment,
} from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import { useFetchAssessmentDetails } from "@/lib/serverFunctions/apiCalls/assessment";
import type { FetchAssessmentDetailsResponse } from "@/lib/serverFunctions/queries/assessment";
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
  const [fetchAssessmentDetails, isLoading] = useFetchAssessmentDetails({});
  const [assessmentDetails, setAssessmentDetails] = useState<
    FetchAssessmentDetailsResponse["assessmentDetails"] | null
  >(null);
  const [canSaveOffline, setCanSaveOffline] = useState(false);

  useEffect(() => {
    const loadAssessment = async () => {
      if (!assessmentId) {
        router.replace("/error");
        return;
      }
      let assessmentDetails:
        | FetchAssessmentDetailsResponse["assessmentDetails"]
        | undefined = undefined;
      if (
        Capacitor.isNativePlatform() &&
        searchParams.get("isSQLiteAssessment") === "true"
      ) {
        //SQLite assessment
        const response = await fetchAdminSQLiteAssessmentDetails({
          params: { assessmentId },
        });
        assessmentDetails = response.data?.assessmentDetails;
      } else {
        //Server assessment
        const response = await fetchAssessmentDetails({
          params: { assessmentId },
          requestOptions: {
            cache: "reload",
          },
        });
        assessmentDetails = response.data?.assessmentDetails;
      }

      if (!assessmentDetails) {
        router.replace("/error");
        return;
      }

      setAssessmentDetails(assessmentDetails);
    };

    void loadAssessment();
  }, [assessmentId, fetchAssessmentDetails, searchParams, router]);

  useEffect(() => {
    const checkIfCanSaveOffline = async () => {
      // Check if can save offline
      if (!assessmentDetails) return;
      const checkResponse = await fetchAdminSQLiteIfCanSaveAssessment({
        params: {
          formId: assessmentDetails.formSubmission.formStructure.formId,
          locationId: assessmentDetails.location.id,
          userId: assessmentDetails.user.id,
        },
      });

      setCanSaveOffline(checkResponse.data?.canSave || false);
    };

    if (assessmentDetails) {
      void checkIfCanSaveOffline();
    }
  }, [assessmentDetails]);

  if (isLoading || !assessmentDetails?.location) {
    return <Loading />;
  }

  const userCanEdit =
    assessmentDetails.user.id === user.id ||
    user.roles.includes("ASSESSMENT_MANAGER");
  const location = assessmentDetails.location;

  return (
    <AssessmentClient
      locationId={location.id}
      locationName={location.name}
      locationPolygonGeoJson={location.st_asgeojson}
      assessmentDetails={assessmentDetails}
      finalized={assessmentDetails.isFinalized}
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
          <CCircularProgress size={128} />
        </div>
      }
    >
      <ResponsesContent />
    </Suspense>
  );
};

export default Responses;
