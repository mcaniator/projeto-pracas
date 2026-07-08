"use client";

import TallyCreationDialog from "@/app/admin/tallys/tallyCreation/tallyCreationDialog";
import TallysFilterSidebar from "@/app/admin/tallys/tallysFilterSidebar";
import TallysList from "@/app/admin/tallys/tallysList";
import { dexieDb } from "@/lib/dexie/dexie";
import {
  FetchTallyUsersResponse,
  useFetchTallyUsers,
  useFetchTallys,
} from "@/lib/serverFunctions/apiCalls/tally";
import { FetchTallysResponse } from "@/lib/serverFunctions/queries/tally";
import { IconFilter, IconPlus } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GrGroup } from "react-icons/gr";

import CAdminHeader from "../../../components/ui/cAdminHeader";
import CButton from "../../../components/ui/cButton";
import CSkeletonGroup from "../../../components/ui/cSkeletonGroup";

export type TallysFilterType =
  | "LOCATION_ID"
  | "FORM_ID"
  | "START_DATE"
  | "END_DATE"
  | "USER_ID"
  | "BROAD_UNIT_ID"
  | "INTERMEDIATE_UNIT_ID"
  | "NARROW_UNIT_ID"
  | "CITY_ID"
  | "FINALIZATION_STATUS";

export type TallyWithSyncStatus = FetchTallysResponse["tallys"][number] & {
  hasUnsyncedFilling: boolean;
};

const TallysClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [params] = useState(useSearchParams());
  const lastFetchedLocationId = useRef<number | undefined>(undefined);
  const [isMobileView, setIsMobileView] = useState<boolean>(true);
  const unsyncedTallyIdsPromiseRef = useRef<Promise<Set<number>> | null>(null);
  const [tallys, setTallys] = useState<TallyWithSyncStatus[]>([]);
  const [users, setUsers] = useState<FetchTallyUsersResponse["users"]>([]);

  const [openTallyCreationDialog, setOpenTallyCreationDialog] = useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  //Filters
  const [isLoading, setIsLoading] = useState(true);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [formId, setFormId] = useState<number>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [userId, setUserId] = useState<string>();
  const [cityId, setCityId] = useState<number>();
  const [broadUnitId, setBroadUnitId] = useState<number>();
  const [intermediateUnitId, setIntermediateUnitId] = useState<number>();
  const [narrowUnitId, setNarrowUnitId] = useState<number>();
  const [finalizationStatus, setFinalizationStatus] = useState<number>();

  const onNoCitiesFound = useCallback(() => {
    setIsLoading(false);
  }, []);

  const [_fetchTallys] = useFetchTallys();
  const [fetchTallyUsers] = useFetchTallyUsers({
    callbacks: {
      onSuccess: (response) => setUsers(response.data?.users ?? []),
    },
  });

  const getUnsyncedTallyIds = useCallback(() => {
    if (!unsyncedTallyIdsPromiseRef.current) {
      unsyncedTallyIdsPromiseRef.current = dexieDb.tallys
        .toArray()
        .then(
          (dexieTallys) =>
            new Set(
              dexieTallys
                .filter((tally) => tally.localUpdatedAt > tally.serverUpdatedAt)
                .map((tally) => tally.id),
            ),
        );
    }

    return unsyncedTallyIdsPromiseRef.current;
  }, []);

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
        case "FINALIZATION_STATUS":
          setFinalizationStatus(undefined);
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
        case "FINALIZATION_STATUS":
          setFinalizationStatus(newValue);
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

  const fetchTallys = useCallback(
    async (params?: { forceFetch: boolean }) => {
      if (!params?.forceFetch) {
        lastFetchedLocationId.current === locationId;
      }

      if (
        !locationId &&
        !formId &&
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
        return;
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

      lastFetchedLocationId.current = locationId;
      const response = await _fetchTallys({
        params: {
          locationId,
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
      const unsyncedTallyIds = await getUnsyncedTallyIds();
      const formattedTallysPromises = response.data?.tallys.map(
        async (tally) => {
          if (unsyncedTallyIds.has(tally.id)) {
            const localTally = await dexieDb.tallys.get(tally.id);
            if (!localTally) {
              return {
                ...tally,
                hasUnsyncedFilling: false,
              };
            }

            return {
              ...tally,
              startDate: localTally.startDate,
              endDate: localTally.endDate,
              isFinalized: localTally.isFinalized,
              hasUnsyncedFilling: true,
            };
          }

          return {
            ...tally,
            hasUnsyncedFilling: false,
          };
        },
      );

      if (formattedTallysPromises) {
        const formattedTallys = await Promise.all(formattedTallysPromises);
        setTallys(formattedTallys);
      } else {
        setTallys([]);
      }

      setIsLoading(false);
    },
    [
      _fetchTallys,
      getUnsyncedTallyIds,
      locationId,
      formId,
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
    void getUnsyncedTallyIds();
  }, [getUnsyncedTallyIds]);

  useEffect(() => {
    void fetchTallyUsers();
  }, [fetchTallyUsers]);

  useEffect(() => {
    const fetch = async () => {
      await fetchTallys();
    };
    void fetch();
  }, [fetchTallys]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 1000;
      if (!isMobileView) setOpenFiltersDialog(false);
      setIsMobileView(isMobileView);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    router.replace(pathname);
  }, [pathname, router]);

  const totalFilters = useMemo(() => {
    let total = 0;
    if (locationId) total++;
    if (formId) total++;
    if (startDate) total++;
    if (endDate) total++;
    if (userId) total++;
    if (cityId) total++;
    if (broadUnitId) total++;
    if (intermediateUnitId) total++;
    if (narrowUnitId) total++;
    if (finalizationStatus) total++;
    return total + 1; // +1 for the state filter always being shown
  }, [
    locationId,
    formId,
    startDate,
    endDate,
    userId,
    cityId,
    broadUnitId,
    intermediateUnitId,
    narrowUnitId,
    finalizationStatus,
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
                square={isMobileView}
                enableTopLeftChip
                topLeftChipLabel={totalFilters}
                onClick={() => setOpenFiltersDialog(true)}
              >
                <IconFilter />
              </CButton>
            )}
            <CButton
              square={isMobileView}
              onClick={() => setOpenTallyCreationDialog(true)}
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
          : <TallysList tallys={tallys} />}
        </div>

        <Suspense fallback={<CSkeletonGroup quantity={5} />}>
          <TallysFilterSidebar
            openDialog={openFiltersDialog}
            isDialog={isMobileView}
            onNoCitiesFound={onNoCitiesFound}
            onCloseDialog={() => setOpenFiltersDialog(false)}
            defaultLocationId={
              params.get("locationId") ?
                Number(params.get("locationId"))
              : undefined
            }
            selectedLocationId={locationId}
            users={users}
            handleFilterChange={handleFilterChange}
          />
        </Suspense>
      </div>
      <TallyCreationDialog
        open={openTallyCreationDialog}
        onClose={() => {
          setOpenTallyCreationDialog(false);
        }}
      />
    </div>
  );
};

export default TallysClient;
