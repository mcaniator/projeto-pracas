"use client";

import PermissionGuard from "@/components/auth/permissionGuard";
import { useNetwork } from "@/components/context/networkContext";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import { useFetchBehavioralMaps } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import {
  useFetchBehavioralMapProtocols,
  useFetchBehavioralMapUsers,
} from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import type { FetchBehavioralMapsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import type { FetchBehavioralMapUsersResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import type { FetchBehavioralMapProtocolsResponse } from "@/lib/serverFunctions/queries/behavioralMapProtocol";
import { IconPlus, IconUserPin } from "@tabler/icons-react";
import { IconFilter } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BehavioralMapCreationDialog from "./behavioralMapCreation/behavioralMapCreationDialog";
import BehavioralMapsFilterSidebar from "./behavioralMapsFilterSidebar";
import BehavioralMapsList from "./behavioralMapsList";

const BEHAVIORAL_MAPS_PER_PAGE = 100;
export type BehavioralMapsFilterType =
  | "LOCATION_ID"
  | "BEHAVIORAL_MAP_PROTOCOL_ID"
  | "START_DATE"
  | "END_DATE"
  | "USER_ID"
  | "BROAD_UNIT_ID"
  | "INTERMEDIATE_UNIT_ID"
  | "NARROW_UNIT_ID"
  | "CITY_ID"
  | "FINALIZATION_STATUS";

const BehavioralMapsClient = () => {
  const searchParams = useSearchParams();
  const [isMobileView, setIsMobileView] = useState(true);
  const [behavioralMaps, setBehavioralMaps] = useState<
    FetchBehavioralMapsResponse["behavioralMaps"]
  >([]);
  const [isLoadingMore, setIsLoadingMore] = useState(true);
  const [openCreation, setOpenCreation] = useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  const [users, setUsers] = useState<FetchBehavioralMapUsersResponse["users"]>(
    [],
  );
  const [behavioralMapProtocols, setBehavioralMapProtocols] = useState<
    FetchBehavioralMapProtocolsResponse["behavioralMapProtocols"]
  >([]);
  const [locationId, setLocationId] = useState<number>();
  const [behavioralMapProtocolId, setBehavioralMapProtocolId] =
    useState<number>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [userId, setUserId] = useState<string>();
  const [cityId, setCityId] = useState<number>();
  const [broadUnitId, setBroadUnitId] = useState<number>();
  const [intermediateUnitId, setIntermediateUnitId] = useState<number>();
  const [narrowUnitId, setNarrowUnitId] = useState<number>();
  const [finalizationStatus, setFinalizationStatus] = useState<number>();
  const { isConnected } = useNetwork();
  const nextPageRef = useRef(1);
  const hasMoreBehavioralMapsRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const lastQueryVersionRef = useRef(0);
  const [_fetchBehavioralMaps] = useFetchBehavioralMaps();
  const [fetchBehavioralMapUsers, isLoadingUsers] = useFetchBehavioralMapUsers({
    callbacks: { onSuccess: ({ data }) => setUsers(data?.users ?? []) },
  });
  const [fetchBehavioralMapProtocols, isLoadingProtocols] =
    useFetchBehavioralMapProtocols({
      callbacks: {
        onSuccess: ({ data }) =>
          setBehavioralMapProtocols(data?.behavioralMapProtocols ?? []),
      },
    });

  const onNoCitiesFound = useCallback(() => {
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);
  }, []);

  const handleFilterChange = ({
    type,
    newValue,
  }: {
    type: BehavioralMapsFilterType;
    newValue: string | number | Date | null;
  }) => {
    if (newValue === null) {
      switch (type) {
        case "LOCATION_ID":
          setLocationId(undefined);
          break;
        case "BEHAVIORAL_MAP_PROTOCOL_ID":
          setBehavioralMapProtocolId(undefined);
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
        case "BEHAVIORAL_MAP_PROTOCOL_ID":
          setBehavioralMapProtocolId(newValue);
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

  const fetchBehavioralMaps = useCallback(
    async (page: number) => {
      const append = page > 1;
      if (!append) {
        lastQueryVersionRef.current++;
        setBehavioralMaps([]);
      }
      const queryVersion = lastQueryVersionRef.current;

      if (
        !locationId &&
        !behavioralMapProtocolId &&
        !userId &&
        !startDate &&
        !endDate &&
        !cityId &&
        !broadUnitId &&
        !intermediateUnitId &&
        !narrowUnitId &&
        !finalizationStatus
      ) {
        // The initial state for all filters is null/undefined, so we avoid fetching data when there's no filter applied.
        setBehavioralMaps([]);
        hasMoreBehavioralMapsRef.current = false;
        isLoadingMoreRef.current = false;
        // Here we do not set isLoadingMore to false, because we want to keep the loading indicator visible while the cities options are being fetched.
        return;
      }

      if (startDate) {
        if (Number.isNaN(startDate.getTime())) {
          hasMoreBehavioralMapsRef.current = false;
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
          return;
        }
      }
      if (endDate) {
        if (Number.isNaN(endDate.getTime())) {
          hasMoreBehavioralMapsRef.current = false;
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
          return;
        }
      }

      if (append && isLoadingMoreRef.current) {
        return;
      }

      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);
      try {
        let fetchedBehavioralMaps: FetchBehavioralMapsResponse["behavioralMaps"] =
          [];
        let hasMore = false;
        const response = await _fetchBehavioralMaps({
          params: {
            locationId,
            behavioralMapProtocolId,
            startDate,
            endDate,
            userId,
            cityId,
            broadUnitId,
            intermediateUnitId,
            narrowUnitId,
            finalizationStatus,
            page,
            itemsPerPage: BEHAVIORAL_MAPS_PER_PAGE,
          },
        });
        fetchedBehavioralMaps = response.data?.behavioralMaps ?? [];
        hasMore = response.data?.hasMore ?? false;

        //TODO: Add draft processing

        if (queryVersion !== lastQueryVersionRef.current) return;

        setBehavioralMaps((currentBehavioralMaps) => {
          if (!append) {
            return fetchedBehavioralMaps;
          }

          const currentBehavioralMapIds = new Set(
            currentBehavioralMaps.map((tally) => tally.id),
          );
          return [
            ...currentBehavioralMaps,
            ...fetchedBehavioralMaps.filter(
              (behavioralMap) => !currentBehavioralMapIds.has(behavioralMap.id),
            ),
          ];
        });

        hasMoreBehavioralMapsRef.current = hasMore;
        nextPageRef.current = page + 1;
      } finally {
        if (queryVersion === lastQueryVersionRef.current) {
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
        }
      }
    },
    [
      _fetchBehavioralMaps,
      locationId,
      behavioralMapProtocolId,
      startDate,
      endDate,
      userId,
      cityId,
      broadUnitId,
      intermediateUnitId,
      narrowUnitId,
      finalizationStatus,
    ],
  );

  useEffect(() => {
    // This is executed only when the component mounts.
    void fetchBehavioralMapUsers();
    void fetchBehavioralMapProtocols({ params: { finalizedOnly: true } });
  }, [fetchBehavioralMapUsers, fetchBehavioralMapProtocols]);

  useEffect(() => {
    // This is executed after every filter change.
    const fetch = async () => {
      await fetchBehavioralMaps(1);
    };
    void fetch();
  }, [fetchBehavioralMaps]);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 1000;
      if (!mobileView) setOpenFiltersDialog(false);
      setIsMobileView(mobileView);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalFilters = useMemo(() => {
    let total = 0;
    if (locationId) total++;
    if (behavioralMapProtocolId) total++;
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
    behavioralMapProtocolId,
    narrowUnitId,
    startDate,
    userId,
  ]);

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader
        titleIcon={<IconUserPin size={28} />}
        title="Mapas comportamentais"
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
            <PermissionGuard
              requiresAnyRoles={["TALLY_EDITOR", "TALLY_MANAGER"]}
            >
              <CButton
                square={isMobileView}
                disabled={!isConnected}
                onClick={() => setOpenCreation(true)}
              >
                <IconPlus />
                {isMobileView ? "" : "Criar"}
              </CButton>
            </PermissionGuard>
          </div>
        }
      />
      <div className="flex h-full overflow-auto">
        <div
          className={`${isMobileView ? "basis-full" : "basis-3/5"} overflow-auto`}
        >
          <BehavioralMapsList
            behavioralMaps={behavioralMaps}
            isLoadingMore={isLoadingMore}
            onNearScrollEnd={() => {
              if (hasMoreBehavioralMapsRef.current && !isLoadingMoreRef.current)
                void fetchBehavioralMaps(nextPageRef.current);
            }}
          />
        </div>
        <BehavioralMapsFilterSidebar
          isDialog={isMobileView}
          openDialog={openFiltersDialog}
          onNoCitiesFound={onNoCitiesFound}
          onCloseDialog={() => setOpenFiltersDialog(false)}
          defaultLocationId={
            searchParams.get("locationId") ?
              Number(searchParams.get("locationId"))
            : undefined
          }
          selectedLocationId={locationId}
          behavioralMapProtocols={behavioralMapProtocols}
          users={users}
          isLoading={isLoadingUsers || isLoadingProtocols}
          handleFilterChange={handleFilterChange}
        />
      </div>
      <BehavioralMapCreationDialog
        open={openCreation}
        onClose={() => setOpenCreation(false)}
      />
    </div>
  );
};

export default BehavioralMapsClient;
