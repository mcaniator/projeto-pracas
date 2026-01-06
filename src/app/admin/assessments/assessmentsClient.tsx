"use client";

import AssessmentCreationDialog from "@/app/admin/assessments/assessmentCreation/assessmentCreationDialog";
import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { IconClipboard, IconPlus } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { useHelperCard } from "../../../components/context/helperCardContext";
import CAdminHeader from "../../../components/ui/cAdminHeader";
import CButton from "../../../components/ui/cButton";
import CSkeletonGroup from "../../../components/ui/cSkeletonGroup";
import { _fetchAssessments } from "../../../lib/serverFunctions/apiCalls/assessment";
import { FetchAssessmentsResponse } from "../../../lib/serverFunctions/queries/assessment";
import AssessmentsFilterSidebar from "./assessmentsFilterSidebar";
import AssessmentsList from "./assessmentsList";

export type AssessmentsFilterType =
  | "LOCATION_ID"
  | "FORM_ID"
  | "START_DATE"
  | "END_DATE"
  | "USER_ID"
  | "BROAD_UNIT_ID"
  | "INTERMEDIATE_UNIT_ID"
  | "NARROW_UNIT_ID"
  | "CITY_ID";

const AssessmentsClient = ({
  forms,
  usersPromise,
}: {
  forms: FetchFormsResponse["forms"];
  usersPromise: Promise<{ id: string; username: string }[]>;
}) => {
  const params = useSearchParams();
  const lastFetchedLocationId = useRef<number | undefined>(undefined);
  const { helperCardProcessResponse, setHelperCard } = useHelperCard();
  const [assessments, setAssessments] = useState<
    FetchAssessmentsResponse["assessments"]
  >([]);

  const [openAssessmentCreationDialog, setOpenAssessmentCreationDialog] =
    useState(false);
  //Filters
  const [isLoading, setIsLoading] = useState(true);
  const [locationId, setLocationId] = useState<number | undefined>(
    params.get("locationId") ? Number(params.get("locationId")) : undefined,
  );
  const [formId, setFormId] = useState<number>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [userId, setUserId] = useState<string>();
  const [cityId, setCityId] = useState<number>();
  const [broadUnitId, setBroadUnitId] = useState<number>();
  const [intermediateUnitId, setIntermediateUnitId] = useState<number>();
  const [narrowUnitId, setNarrowUnitId] = useState<number>();

  const handleFilterChange = ({
    type,
    newValue,
  }: {
    type: AssessmentsFilterType;
    newValue: string | number | Date | null;
  }) => {
    if (newValue === null) {
      switch (type) {
        case "LOCATION_ID":
          setLocationId(undefined);
          break;
        case "FORM_ID":
          setFormId(undefined);
          break;
        case "USER_ID":
          setUserId(undefined);
          break;
        case "START_DATE":
          setStartDate(undefined);
          break;
        case "END_DATE":
          setEndDate(undefined);
          break;
        case "CITY_ID":
          setCityId(undefined);
          break;
        case "BROAD_UNIT_ID":
          setBroadUnitId(undefined);
          break;
        case "INTERMEDIATE_UNIT_ID":
          setIntermediateUnitId(undefined);
          break;
        case "NARROW_UNIT_ID":
          setNarrowUnitId(undefined);
          break;
      }
    } else if (typeof newValue === "string") {
      switch (type) {
        case "USER_ID":
          setUserId(newValue);
          break;
      }
    } else if (typeof newValue === "number") {
      switch (type) {
        case "LOCATION_ID":
          setLocationId(newValue);
          break;
        case "FORM_ID":
          setFormId(newValue);
          break;
        case "CITY_ID":
          setCityId(newValue);
          break;
        case "BROAD_UNIT_ID":
          setBroadUnitId(newValue);
          break;
        case "INTERMEDIATE_UNIT_ID":
          setIntermediateUnitId(newValue);
          break;
        case "NARROW_UNIT_ID":
          setNarrowUnitId(newValue);
          break;
      }
    } else if (newValue instanceof Date) {
      switch (type) {
        case "START_DATE":
          setStartDate(newValue);
          break;
        case "END_DATE":
          setEndDate(newValue);
          break;
      }
    }
  };

  const fetchAssessments = useCallback(
    async (params?: { forceFetch: boolean }) => {
      if (!params?.forceFetch) {
        lastFetchedLocationId.current === locationId;

        if (!!locationId && lastFetchedLocationId.current === locationId) {
          return; //LocationId has maximum priority in the filters. If it has a value and it hasn't changed, no need to refetch.
        }
      }

      if (startDate) {
        if (isNaN(startDate.getTime())) {
          return;
        }
      }
      if (endDate) {
        if (isNaN(endDate.getTime())) {
          return;
        }
      }
      setIsLoading(true);
      try {
        lastFetchedLocationId.current = locationId;
        const response = await _fetchAssessments({
          locationId,
          formId,
          startDate,
          endDate,
          userId,
          cityId,
          broadUnitId,
          intermediateUnitId,
          narrowUnitId,
        });
        helperCardProcessResponse(response.responseInfo);
        setAssessments(response.data?.assessments ?? []);
      } catch (e) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>{"Erro ao consultar avaliações!"}</>,
        });
      }

      setIsLoading(false);
    },
    [
      helperCardProcessResponse,
      setHelperCard,
      locationId,
      formId,
      startDate,
      endDate,
      userId,
      cityId,
      broadUnitId,
      intermediateUnitId,
      narrowUnitId,
    ],
  );

  useEffect(() => {
    const fetch = async () => {
      await fetchAssessments();
    };
    void fetch();
  }, [fetchAssessments]);
  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader
        titleIcon={<IconClipboard />}
        title="Avaliações"
        append={
          <CButton onClick={() => setOpenAssessmentCreationDialog(true)}>
            <IconPlus /> Criar
          </CButton>
        }
      />
      <div className="flex h-full overflow-auto">
        <div className="basis-3/5 overflow-auto">
          {isLoading ?
            <CSkeletonGroup quantity={5} height={120} />
          : <AssessmentsList assessments={assessments} />}
        </div>
        <div className="mx-0.5 my-0.5 basis-2/5">
          <Suspense fallback={<CSkeletonGroup quantity={5} />}>
            <AssessmentsFilterSidebar
              defaultLocationId={
                params.get("locationId") ?
                  Number(params.get("locationId"))
                : undefined
              }
              selectedLocationId={locationId}
              forms={forms}
              usersPromise={usersPromise}
              handleFilterChange={handleFilterChange}
            />
          </Suspense>
        </div>
      </div>
      <AssessmentCreationDialog
        open={openAssessmentCreationDialog}
        onClose={() => {
          setOpenAssessmentCreationDialog(false);
        }}
        reloadAssessments={() => {
          void fetchAssessments({ forceFetch: true });
        }}
      />
    </div>
  );
};

export default AssessmentsClient;
