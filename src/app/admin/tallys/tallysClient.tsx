"use client";

import {
  fetchTallyDraft,
  fetchTallyDraftIds,
} from "@/app/admin/tallys/details/tallyDraft";
import TallyCreationDialog from "@/app/admin/tallys/tallyCreation/tallyCreationDialog";
import TallysFilterSidebar from "@/app/admin/tallys/tallysFilterSidebar";
import TallysList from "@/app/admin/tallys/tallysList";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CSkeletonGroup from "@/components/ui/cSkeletonGroup";
import {
  useFetchTallyProtocols,
  useFetchTallyUsers,
  useFetchTallys,
} from "@/lib/serverFunctions/apiCalls/tally";
import type {
  FetchTallyProtocolsResponse,
  FetchTallyUsersResponse,
  FetchTallysResponse,
} from "@/lib/serverFunctions/queries/tally";
import { IconFilter, IconPlus, IconTableExport } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GrGroup } from "react-icons/gr";
import TallysExportDialog from "./tallyExportDialog";

const TALLYS_PER_PAGE = 100;

export type TallysFilterType =
  | "LOCATION_ID"
  | "TALLY_PROTOCOL_ID"
  | "START_DATE"
  | "END_DATE"
  | "USER_ID"
  | "BROAD_UNIT_ID"
  | "INTERMEDIATE_UNIT_ID"
  | "NARROW_UNIT_ID"
  | "CITY_ID"
  | "FINALIZATION_STATUS";

export type TallyWithSyncStatus =
  FetchTallysResponse["tallys"][number] & {
    hasPendingSaveFromDraft: boolean;
  };

const TallysClient = () => {
  const searchParams = useSearchParams();
  const [isMobileView, setIsMobileView] = useState(true);
  const unsavedTallyIdsPromiseRef = useRef<Promise<Set<number>> | null>(
    null,
  );
  const nextPageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);
  const hasMoreTallysRef = useRef(false);
  const lastQueryVersionRef = useRef(0); // Detects when the query params have changed. This is used to prevent a previous query from being used after a new fetch is called.
  const [tallys, setTallys] = useState<
    TallyWithSyncStatus[]
  >([]);
  const [isLoadingMore, setIsLoadingMore] = useState(true);
  const [users, setUsers] = useState<FetchTallyUsersResponse["users"]>(
    [],
  );
  const [tallyProtocols, setTallyProtocols] = useState<
    FetchTallyProtocolsResponse["tallyProtocols"]
  >([]);
  const [openCreationDialog, setOpenCreationDialog] = useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  const [openTallyExportDialog, setOpenTallyExportDialog] =
    useState(false);
  const [locationId, setLocationId] = useState<number>();
  const [tallyProtocolId, setTallyProtocolId] =
    useState<number>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [userId, setUserId] = useState<string>();
  const [cityId, setCityId] = useState<number>();
  const [broadUnitId, setBroadUnitId] = useState<number>();
  const [intermediateUnitId, setIntermediateUnitId] = useState<number>();
  const [narrowUnitId, setNarrowUnitId] = useState<number>();
  const [finalizationStatus, setFinalizationStatus] = useState<number>();

  const [_fetchTallys] = useFetchTallys();
  const [fetchTallyUsers, isLoadingUsers] = useFetchTallyUsers({
    callbacks: {
      onSuccess: ({ data }) => setUsers(data?.users ?? []),
    },
  });
  const [fetchTallyProtocols, isLoadingTemplates] =
    useFetchTallyProtocols({
      callbacks: {
        onSuccess: ({ data }) => {
          setTallyProtocols(data?.tallyProtocols ?? []);
        },
      },
    });

  const onNoCitiesFound = useCallback(() => {
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);
  }, []);

  const getUnsavedTallyIds = useCallback(async () => {
    // Drafts are fetched only when the page loads. They are not fetched again when the filters are changed.
    if (!unsavedTallyIdsPromiseRef.current) {
      unsavedTallyIdsPromiseRef.current = fetchTallyDraftIds();
    }

    return unsavedTallyIdsPromiseRef.current;
  }, []);

  const formatTallysWithUnsavedFilling = useCallback(
    async (tallys: FetchTallysResponse["tallys"]) => {
      const unsavedTallyIds = await getUnsavedTallyIds();
      return tallys.map(async (tally) => {
        if (unsavedTallyIds.has(tally.id)) {
          //If the tally has unsynced filling, we need to fetch some metadata from draft and insert the local unsynced data into the tally
          const localTally = await fetchTallyDraft(
            tally.id,
          );
          if (!localTally) {
            return {
              ...tally,
              hasPendingSaveFromDraft: false,
            };
          }

          return {
            ...tally,
            startDate: localTally.startDate,
            endDate: localTally.endDate,
            isFinalized: localTally.isFinalized,
            hasPendingSaveFromDraft: true,
          };
        }

        return {
          ...tally,
          hasPendingSaveFromDraft: false,
        };
      });
    },
    [getUnsavedTallyIds],
  );

  const handleFilterChange = ({
    type,
    newValue,
  }: {
    type: TallysFilterType;
    newValue: string | number | Date | null;
  }) => {
    if (newValue === null) {
      switch (type) {
        case "LOCATION_ID":
          setLocationId(undefined);
          break;
        case "TALLY_PROTOCOL_ID":
          setTallyProtocolId(undefined);
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
        case "TALLY_PROTOCOL_ID":
          setTallyProtocolId(newValue);
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

  const fetchTallys = useCallback(
    async (page: number) => {
      const append = page > 1;
      if (!append) {
        lastQueryVersionRef.current++;
        setTallys([]);
      }
      const queryVersion = lastQueryVersionRef.current;

      if (
        !locationId &&
        !tallyProtocolId &&
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
        setTallys([]);
        hasMoreTallysRef.current = false;
        isLoadingMoreRef.current = false;
        // Here we do not set isLoadingMore to false, because we want to keep the loading indicator visible while the cities options are being fetched.
        return;
      }

      if (startDate) {
        if (Number.isNaN(startDate.getTime())) {
          hasMoreTallysRef.current = false;
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
          return;
        }
      }
      if (endDate) {
        if (Number.isNaN(endDate.getTime())) {
          hasMoreTallysRef.current = false;
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
      if (!append) {
        nextPageRef.current = 1;
        hasMoreTallysRef.current = false;
      }

      try {
        let fetchedTallys: FetchTallysResponse["tallys"] =
          [];
        let hasMore = false;
        const response = await _fetchTallys({
          params: {
            locationId,
            tallyProtocolId,
            startDate,
            endDate,
            userId,
            cityId,
            broadUnitId,
            intermediateUnitId,
            narrowUnitId,
            finalizationStatus,
            page,
            itemsPerPage: TALLYS_PER_PAGE,
          },
        });
        fetchedTallys = response.data?.tallys ?? [];
        hasMore = response.data?.hasMore ?? false;

        const formattedTallysPromises =
          await formatTallysWithUnsavedFilling(fetchedTallys);
        const formattedTallys = await Promise.all(
          formattedTallysPromises,
        );
        if (queryVersion !== lastQueryVersionRef.current) {
          return;
        }

        setTallys((currentTallys) => {
          if (!append) {
            return formattedTallys;
          }

          const currentTallyIds = new Set(
            currentTallys.map((tally) => tally.id),
          );
          return [
            ...currentTallys,
            ...formattedTallys.filter(
              (tally) => !currentTallyIds.has(tally.id),
            ),
          ];
        });
        hasMoreTallysRef.current = hasMore;
        nextPageRef.current = page + 1;
      } finally {
        if (queryVersion === lastQueryVersionRef.current) {
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
        }
      }
    },
    [
      _fetchTallys,
      broadUnitId,
      cityId,
      endDate,
      finalizationStatus,
      formatTallysWithUnsavedFilling,
      intermediateUnitId,
      locationId,
      tallyProtocolId,
      narrowUnitId,
      startDate,
      userId,
    ],
  );

  const loadMoreTallys = useCallback(() => {
    if (!hasMoreTallysRef.current || isLoadingMoreRef.current) {
      return;
    }

    void fetchTallys(nextPageRef.current);
  }, [fetchTallys]);

  useEffect(() => {
    // This is executed only when the component mounts.
    void fetchTallyUsers();
    void fetchTallyProtocols({ params: { finalizedOnly: true } });
  }, [fetchTallyProtocols, fetchTallyUsers]);

  useEffect(() => {
    // This is executed after every filter change.
    const fetch = async () => {
      await fetchTallys(1);
    };
    void fetch();
  }, [fetchTallys]);

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
    if (tallyProtocolId) total++;
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
    tallyProtocolId,
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
          <div className="flex items-center gap-2">
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
              onClick={() => setOpenTallyExportDialog(true)}
            >
              <IconTableExport />
              {isMobileView ? "" : "Exportar"}
            </CButton>
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
          <TallysList
            tallys={tallys}
            isLoadingMore={isLoadingMore}
            onNearScrollEnd={loadMoreTallys}
          />
        </div>
        <Suspense fallback={<CSkeletonGroup quantity={5} />}>
          <TallysFilterSidebar
            openDialog={openFiltersDialog}
            isDialog={isMobileView}
            onNoCitiesFound={onNoCitiesFound}
            onCloseDialog={() => setOpenFiltersDialog(false)}
            defaultLocationId={
              searchParams.get("locationId") ?
                Number(searchParams.get("locationId"))
              : undefined
            }
            selectedLocationId={locationId}
            tallyProtocols={tallyProtocols}
            users={users}
            isLoading={isLoadingUsers || isLoadingTemplates}
            handleFilterChange={handleFilterChange}
          />
        </Suspense>
      </div>
      <TallyCreationDialog
        open={openCreationDialog}
        onClose={() => setOpenCreationDialog(false)}
      />
      <TallysExportDialog 
        open={openTallyExportDialog}
        onClose={() => setOpenTallyExportDialog(false)}
        tallyProtocols={tallyProtocols}
        users={users}
        isLoading={isLoadingUsers || isLoadingTemplates}
      />
    </div>
  );
};

export default TallysClient;
