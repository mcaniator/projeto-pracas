"use client";

import { IconClipboard, IconPlus } from "@tabler/icons-react";
import { Suspense, useCallback, useEffect, useState } from "react";

import { useHelperCard } from "../../../components/context/helperCardContext";
import CAdminHeader from "../../../components/ui/cAdminHeader";
import CButton from "../../../components/ui/cButton";
import CSkeletonGroup from "../../../components/ui/cSkeletonGroup";
import { _fetchAssessments } from "../../../lib/serverFunctions/apiCalls/assessment";
import { FetchAssessmentsResponse } from "../../../lib/serverFunctions/queries/assessment";
import {
  PaginationInfo,
  generatePaginationResponseInfo,
} from "../../../lib/utils/apiCall";
import AssessmentsFilterSidebar from "./assessmentsFilterSidebar";
import AssessmentsList from "./assessmentsList";

export type AssessmentsFilterType =
  | "LOCATION_ID"
  | "FORM_ID"
  | "START_DATE"
  | "END_DATE"
  | "USER_ID"
  | "PAGE_NUMBER";

const AssessmentsClient = ({
  locationsPromise,
  formsPromise,
  usersPromise,
}: {
  locationsPromise: Promise<{ id: number; name: string }[]>;
  formsPromise: Promise<{ id: number; name: string }[]>;
  usersPromise: Promise<{ id: string; username: string }[]>;
}) => {
  const { helperCardProcessResponse, setHelperCard } = useHelperCard();
  const [assessments, setAssessments] = useState<
    FetchAssessmentsResponse["assessments"]
  >([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>(
    generatePaginationResponseInfo({}),
  );

  //Filters
  const [isLoading, setIsLoading] = useState(false);
  const [locationId, setLocationId] = useState<number>();
  const [formId, setFormId] = useState<number>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [userId, setUserId] = useState<string>();
  const [pageNumber, setPageNumber] = useState(1);

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
        case "PAGE_NUMBER":
          setPageNumber(newValue);
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

  const fetchAssessments = useCallback(async () => {
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
      const response = await _fetchAssessments({
        locationId,
        formId,
        startDate,
        endDate,
        userId,
        pageNumber,
        pageSize: 15,
      });
      helperCardProcessResponse(response.responseInfo);
      setAssessments(response.data?.assessments ?? []);
      setPaginationInfo(
        response.data?.paginationInfo ?? generatePaginationResponseInfo({}),
      );
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>{"Erro ao consultar avaliações!"}</>,
      });
    }

    setIsLoading(false);
  }, [
    helperCardProcessResponse,
    setHelperCard,
    locationId,
    formId,
    startDate,
    endDate,
    userId,
    pageNumber,
  ]);

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
          <CButton>
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
              locationsPromise={locationsPromise}
              formsPromise={formsPromise}
              usersPromise={usersPromise}
              paginationInfo={paginationInfo}
              currentPage={pageNumber}
              handleFilterChange={handleFilterChange}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AssessmentsClient;
