"use client";

import {
  fetchModularTallyDraft,
  fetchModularTallyDraftIds,
} from "@/app/admin/modularTally/details/modularTallyDraft";
import ModularTallyCreationDialog from "@/app/admin/modularTally/modularTallyCreation/modularTallyCreationDialog";
import ModularTallysFilterSidebar from "@/app/admin/modularTally/modularTallysFilterSidebar";
import ModularTallysList from "@/app/admin/modularTally/modularTallysList";
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
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GrGroup } from "react-icons/gr";

const MODULAR_TALLYS_PER_PAGE = 100;

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

export type ModularTallyWithSyncStatus =
  FetchModularTallysResponse["modularTallys"][number] & {
    hasPendingSaveFromDraft: boolean;
  };

const ModularTallysClient = () => {
  const searchParams = useSearchParams();
  const [isMobileView, setIsMobileView] = useState(true);
  const unsavedModularTallyIdsPromiseRef = useRef<Promise<Set<number>> | null>(
    null,
  );
  const nextPageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);
  const hasMoreModularTallysRef = useRef(false);
  const lastQueryVersionRef = useRef(0); // Detects when the query params have changed. This is used to prevent a previous query from being used after a new fetch is called.
  const [modularTallys, setModularTallys] = useState<
    ModularTallyWithSyncStatus[]
  >([]);
  const [isLoadingMore, setIsLoadingMore] = useState(true);
  const [users, setUsers] = useState<FetchModularTallyUsersResponse["users"]>(
    [],
  );
  const [modularTallyTemplates, setModularTallyTemplates] = useState<
    FetchModularTallyTemplatesResponse["modularTallyTemplates"]
  >([]);
  const [openCreationDialog, setOpenCreationDialog] = useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
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

  const [_fetchModularTallys] = useFetchModularTallys();
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

  const onNoCitiesFound = useCallback(() => {
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);
  }, []);

  const getUnsavedModularTallyIds = useCallback(async () => {
    // Drafts are fetched only when the page loads. They are not fetched again when the filters are changed.
    if (!unsavedModularTallyIdsPromiseRef.current) {
      unsavedModularTallyIdsPromiseRef.current = fetchModularTallyDraftIds();
    }

    return unsavedModularTallyIdsPromiseRef.current;
  }, []);

  const formatModularTallysWithUnsavedFilling = useCallback(
    async (modularTallys: FetchModularTallysResponse["modularTallys"]) => {
      const unsavedModularTallyIds = await getUnsavedModularTallyIds();
      return modularTallys.map(async (modularTally) => {
        if (unsavedModularTallyIds.has(modularTally.id)) {
          //If the tally has unsynced filling, we need to fetch some metadata from draft and insert the local unsynced data into the tally
          const localModularTally = await fetchModularTallyDraft(
            modularTally.id,
          );
          if (!localModularTally) {
            return {
              ...modularTally,
              hasPendingSaveFromDraft: false,
            };
          }

          return {
            ...modularTally,
            startDate: localModularTally.startDate,
            endDate: localModularTally.endDate,
            isFinalized: localModularTally.isFinalized,
            hasPendingSaveFromDraft: true,
          };
        }

        return {
          ...modularTally,
          hasPendingSaveFromDraft: false,
        };
      });
    },
    [getUnsavedModularTallyIds],
  );

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

  const fetchModularTallys = useCallback(
    async (page: number) => {
      const append = page > 1;
      if (!append) {
        lastQueryVersionRef.current++;
      }
      const queryVersion = lastQueryVersionRef.current;

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
        // The initial state for all filters is null/undefined, so we avoid fetching data when there's no filter applied.
        setModularTallys([]);
        hasMoreModularTallysRef.current = false;
        isLoadingMoreRef.current = false;
        // Here we do not set isLoadingMore to false, because we want to keep the loading indicator visible while the cities options are being fetched.
        return;
      }

      if (startDate) {
        if (Number.isNaN(startDate.getTime())) {
          hasMoreModularTallysRef.current = false;
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
          return;
        }
      }
      if (endDate) {
        if (Number.isNaN(endDate.getTime())) {
          hasMoreModularTallysRef.current = false;
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
        hasMoreModularTallysRef.current = false;
      }

      try {
        let fetchedModularTallys: FetchModularTallysResponse["modularTallys"] =
          [];
        let hasMore = false;
        const response = await _fetchModularTallys({
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
            page,
            itemsPerPage: MODULAR_TALLYS_PER_PAGE,
          },
        });
        fetchedModularTallys = response.data?.modularTallys ?? [];
        hasMore = response.data?.hasMore ?? false;

        const formattedModularTallysPromises =
          await formatModularTallysWithUnsavedFilling(fetchedModularTallys);
        const formattedModularTallys = await Promise.all(
          formattedModularTallysPromises,
        );
        if (queryVersion !== lastQueryVersionRef.current) {
          return;
        }

        setModularTallys((currentModularTallys) => {
          if (!append) {
            return formattedModularTallys;
          }

          const currentModularTallyIds = new Set(
            currentModularTallys.map((modularTally) => modularTally.id),
          );
          return [
            ...currentModularTallys,
            ...formattedModularTallys.filter(
              (modularTally) => !currentModularTallyIds.has(modularTally.id),
            ),
          ];
        });
        hasMoreModularTallysRef.current = hasMore;
        nextPageRef.current = page + 1;
      } finally {
        if (queryVersion === lastQueryVersionRef.current) {
          isLoadingMoreRef.current = false;
          setIsLoadingMore(false);
        }
      }
    },
    [
      _fetchModularTallys,
      broadUnitId,
      cityId,
      endDate,
      finalizationStatus,
      formatModularTallysWithUnsavedFilling,
      intermediateUnitId,
      locationId,
      modularTallyTemplateId,
      narrowUnitId,
      startDate,
      userId,
    ],
  );

  const loadMoreModularTallys = useCallback(() => {
    if (!hasMoreModularTallysRef.current || isLoadingMoreRef.current) {
      return;
    }

    void fetchModularTallys(nextPageRef.current);
  }, [fetchModularTallys]);

  useEffect(() => {
    // This is executed only when the component mounts.
    void fetchModularTallyUsers();
    void fetchModularTallyTemplates({ params: { finalizedOnly: true } });
  }, [fetchModularTallyTemplates, fetchModularTallyUsers]);

  useEffect(() => {
    // This is executed after every filter change.
    const fetch = async () => {
      await fetchModularTallys(1);
    };
    void fetch();
  }, [fetchModularTallys]);

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
          <ModularTallysList
            modularTallys={modularTallys}
            isLoadingMore={isLoadingMore}
            onNearScrollEnd={loadMoreModularTallys}
          />
        </div>
        <Suspense fallback={<CSkeletonGroup quantity={5} />}>
          <ModularTallysFilterSidebar
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
