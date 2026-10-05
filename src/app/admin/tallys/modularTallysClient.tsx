"use client";

import ModularTallyCreationDialog from "@/app/admin/tallys/modularTallyCreation/modularTallyCreationDialog";
import ModularTallysFilterSidebar from "@/app/admin/tallys/modularTallysFilterSidebar";
import ModularTallysList from "@/app/admin/tallys/modularTallysList";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CSkeletonGroup from "@/components/ui/cSkeletonGroup";
import {
  useFetchModularTallyTemplates,
  useFetchModularTallyUsers,
  useFetchModularTallys,
} from "@/lib/serverFunctions/apiCalls/modularTally";
import type {
  FetchModularTallyTemplatesResponse,
  FetchModularTallyUsersResponse,
  FetchModularTallysResponse,
} from "@/lib/serverFunctions/queries/modularTally";
import { IconFilter, IconPlus } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { GrGroup } from "react-icons/gr";

export type ModularTallysFilterType =
  | "LOCATION_ID"
  | "MODULAR_TALLY_TEMPLATE_ID"
  | "START_DATE"
  | "END_DATE"
  | "USER_ID"
  | "BROAD_UNIT_ID"
  | "INTERMEDIATE_UNIT_ID"
  | "NARROW_UNIT_ID"
  | "CITY_ID"
  | "FINALIZATION_STATUS";

const ModularTallysClient = () => {
  const searchParams = useSearchParams();
  const [isMobileView, setIsMobileView] = useState(true);
  const [modularTallys, setModularTallys] = useState<
    FetchModularTallysResponse["modularTallys"]
  >([]);
  const [users, setUsers] = useState<FetchModularTallyUsersResponse["users"]>(
    [],
  );
  const [modularTallyTemplates, setModularTallyTemplates] = useState<
    FetchModularTallyTemplatesResponse["modularTallyTemplates"]
  >([]);
  const [openCreationDialog, setOpenCreationDialog] = useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationId, setLocationId] = useState<number>();
  const [modularTallyTemplateId, setModularTallyTemplateId] =
    useState<number>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [userId, setUserId] = useState<string>();
  const [cityId, setCityId] = useState<number>();
  const [broadUnitId, setBroadUnitId] = useState<number>();
  const [intermediateUnitId, setIntermediateUnitId] = useState<number>();
  const [narrowUnitId, setNarrowUnitId] = useState<number>();
  const [finalizationStatus, setFinalizationStatus] = useState<number>();

  const [fetchModularTallys] = useFetchModularTallys();
  const [fetchModularTallyUsers, isLoadingUsers] = useFetchModularTallyUsers({
    callbacks: {
      onSuccess: ({ data }) => setUsers(data?.users ?? []),
    },
  });
  const [fetchModularTallyTemplates, isLoadingTemplates] =
    useFetchModularTallyTemplates({
      callbacks: {
        onSuccess: ({ data }) => {
          setModularTallyTemplates(data?.modularTallyTemplates ?? []);
        },
      },
    });

  const handleFilterChange = ({
    type,
    newValue,
  }: {
    type: ModularTallysFilterType;
    newValue: string | number | Date | null;
  }) => {
    if (newValue === null) {
      switch (type) {
        case "LOCATION_ID":
          setLocationId(undefined);
          break;
        case "MODULAR_TALLY_TEMPLATE_ID":
          setModularTallyTemplateId(undefined);
          break;
        case "START_DATE":
          setStartDate(undefined);
          break;
        case "END_DATE":
          setEndDate(undefined);
          break;
        case "USER_ID":
          setUserId(undefined);
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
        case "FINALIZATION_STATUS":
          setFinalizationStatus(undefined);
          break;
      }
      return;
    }

    if (typeof newValue === "string" && type === "USER_ID") {
      setUserId(newValue);
      return;
    }

    if (typeof newValue === "number") {
      switch (type) {
        case "LOCATION_ID":
          setLocationId(newValue);
          break;
        case "MODULAR_TALLY_TEMPLATE_ID":
          setModularTallyTemplateId(newValue);
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
        case "FINALIZATION_STATUS":
          setFinalizationStatus(newValue);
          break;
      }
      return;
    }

    if (newValue instanceof Date) {
      if (type === "START_DATE") setStartDate(newValue);
      if (type === "END_DATE") setEndDate(newValue);
    }
  };

  const loadModularTallys = useCallback(async () => {
    if (
      !locationId &&
      !modularTallyTemplateId &&
      !userId &&
      !startDate &&
      !endDate &&
      !cityId &&
      !broadUnitId &&
      !intermediateUnitId &&
      !narrowUnitId &&
      !finalizationStatus
    ) {
      setModularTallys([]);
      return;
    }

    if (
      (startDate && Number.isNaN(startDate.getTime())) ||
      (endDate && Number.isNaN(endDate.getTime()))
    ) {
      return;
    }

    setIsLoading(true);
    const response = await fetchModularTallys({
      params: {
        locationId,
        modularTallyTemplateId,
        startDate,
        endDate,
        userId,
        cityId,
        broadUnitId,
        intermediateUnitId,
        narrowUnitId,
        finalizationStatus,
      },
    });
    setModularTallys(response.data?.modularTallys ?? []);
    setIsLoading(false);
  }, [
    broadUnitId,
    cityId,
    endDate,
    fetchModularTallys,
    finalizationStatus,
    intermediateUnitId,
    locationId,
    modularTallyTemplateId,
    narrowUnitId,
    startDate,
    userId,
  ]);

  useEffect(() => {
    void fetchModularTallyUsers();
    void fetchModularTallyTemplates({ params: { finalizedOnly: true } });
  }, [fetchModularTallyTemplates, fetchModularTallyUsers]);

  useEffect(() => {
    void loadModularTallys();
  }, [loadModularTallys]);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 1000;
      if (!mobileView) setOpenFiltersDialog(false);
      setIsMobileView(mobileView);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalFilters = useMemo(() => {
    let total = 0;
    if (locationId) total++;
    if (modularTallyTemplateId) total++;
    if (startDate) total++;
    if (endDate) total++;
    if (userId) total++;
    if (cityId) total++;
    if (broadUnitId) total++;
    if (intermediateUnitId) total++;
    if (narrowUnitId) total++;
    if (finalizationStatus) total++;
    return total + 1;
  }, [
    broadUnitId,
    cityId,
    endDate,
    finalizationStatus,
    intermediateUnitId,
    locationId,
    modularTallyTemplateId,
    narrowUnitId,
    startDate,
    userId,
  ]);

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader
        titleIcon={<GrGroup size={28} />}
        title="Contagens"
        append={
          <div className="flex items-center gap-1">
            {isMobileView && (
              <CButton
                square
                enableTopLeftChip
                topLeftChipLabel={totalFilters}
                onClick={() => setOpenFiltersDialog(true)}
              >
                <IconFilter />
              </CButton>
            )}
            <CButton
              square={isMobileView}
              onClick={() => setOpenCreationDialog(true)}
            >
              <IconPlus />
              {isMobileView ? "" : "Criar"}
            </CButton>
          </div>
        }
      />
      <div className="flex h-full overflow-auto">
        <div
          className={`${isMobileView ? "basis-full" : "basis-3/5"} overflow-auto`}
        >
          {isLoading ?
            <CSkeletonGroup quantity={5} height={120} />
          : <ModularTallysList modularTallys={modularTallys} />}
        </div>
        <Suspense fallback={<CSkeletonGroup quantity={5} />}>
          <ModularTallysFilterSidebar
            openDialog={openFiltersDialog}
            isDialog={isMobileView}
            onNoCitiesFound={() => setIsLoading(false)}
            onCloseDialog={() => setOpenFiltersDialog(false)}
            defaultLocationId={
              searchParams.get("locationId") ?
                Number(searchParams.get("locationId"))
              : undefined
            }
            selectedLocationId={locationId}
            modularTallyTemplates={modularTallyTemplates}
            users={users}
            isLoading={isLoadingUsers || isLoadingTemplates}
            handleFilterChange={handleFilterChange}
          />
        </Suspense>
      </div>
      <ModularTallyCreationDialog
        open={openCreationDialog}
        onClose={() => setOpenCreationDialog(false)}
      />
    </div>
  );
};

export default ModularTallysClient;
