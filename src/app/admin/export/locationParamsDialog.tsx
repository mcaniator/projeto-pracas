import { SelectedLocationObj } from "@/app/admin/export/client";
import { useUserContext } from "@/components/context/UserContext";
import CCheckbox from "@/components/ui/cCheckbox";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchAssessments } from "@/lib/serverFunctions/apiCalls/assessment";
import { FetchAssessmentsResponse } from "@/lib/serverFunctions/queries/assessment";
import { Chip, CircularProgress } from "@mui/material";
import { IconCheck, IconClipboard, IconUser } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";

const ASSESSMENTS_PER_PAGE = 100;

const LocationParamsDialog = ({
  open,
  onClose,
  location,
  handleSelectedLocationObjChange,
}: {
  open: boolean;
  onClose: () => void;
  location: SelectedLocationObj | null;
  handleSelectedLocationObjChange: (locationObj: SelectedLocationObj) => void;
}) => {
  const userContext = useUserContext();
  const canAccessAssessments = userContext.checkIfLoggedInUserHasAccess({
    requiredAnyRoleGroups: ["ASSESSMENT"],
  });
  const [fetchAssessments] = useFetchAssessments();
  const [localLocation, setLocalLocation] =
    useState<SelectedLocationObj | null>(location); // We first save the params here. Only after user confirms it is save in the main component.
  const [assessments, setAssessments] =
    useState<FetchAssessmentsResponse["assessments"]>();
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const nextAssessmentPageRef = useRef(1);
  const hasMoreAssessmentsRef = useRef(false);
  const loadingAssessmentsRef = useRef(false);
  const lastAssessmentQueryVersionRef = useRef(0);

  const fetchAssessmentPage = useCallback(
    async (page: number) => {
      if (!location) {
        return;
      }

      const append = page > 1;
      if (!append) {
        lastAssessmentQueryVersionRef.current++;
      }
      const queryVersion = lastAssessmentQueryVersionRef.current;

      if (append && loadingAssessmentsRef.current) {
        return;
      }

      loadingAssessmentsRef.current = true;
      setLoadingAssessments(true);
      if (!append) {
        nextAssessmentPageRef.current = 1;
        hasMoreAssessmentsRef.current = false;
      }

      try {
        const response = await fetchAssessments({
          params: {
            locationId: location.id,
            page,
            itemsPerPage: ASSESSMENTS_PER_PAGE,
          },
        });
        const data = response.data;
        if (!data || queryVersion !== lastAssessmentQueryVersionRef.current) {
          return;
        }

        setAssessments((currentAssessments) => {
          if (!append) {
            return data.assessments;
          }

          const currentAssessmentIds = new Set(
            currentAssessments?.map((assessment) => assessment.id),
          );
          return [
            ...(currentAssessments ?? []),
            ...data.assessments.filter(
              (assessment) => !currentAssessmentIds.has(assessment.id),
            ),
          ];
        });
        hasMoreAssessmentsRef.current = data.hasMore;
        nextAssessmentPageRef.current = page + 1;
      } finally {
        if (queryVersion === lastAssessmentQueryVersionRef.current) {
          loadingAssessmentsRef.current = false;
          setLoadingAssessments(false);
        }
      }
    },
    [fetchAssessments, location],
  );

  const loadMoreAssessments = useCallback(() => {
    if (!hasMoreAssessmentsRef.current || loadingAssessmentsRef.current) {
      return;
    }

    void fetchAssessmentPage(nextAssessmentPageRef.current);
  }, [fetchAssessmentPage]);

  useEffect(() => {
    if (!open || !location) return;

    if (canAccessAssessments) {
      void fetchAssessmentPage(1);
    }

    setLocalLocation(location);

    return () => {
      lastAssessmentQueryVersionRef.current++;
      loadingAssessmentsRef.current = false;
      setLoadingAssessments(false);
    };
  }, [
    canAccessAssessments,
    fetchAssessmentPage,
    location,
    open,
  ]);

  if (!location || !localLocation) return null;
  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Itens para exportar"
      subtitle={location.name}
      confirmChildren={<IconCheck />}
      onConfirm={() => {
        handleSelectedLocationObjChange(localLocation);
        onClose();
      }}
      fullScreen
    >
      <div className="flex h-full w-full flex-col gap-1 overflow-auto">
            {assessments?.length === 0 && !loadingAssessments && (
              <div className="text-center text-xl font-semibold">
                Nenhuma avaliação nesta praça!
              </div>
            )}
            <Virtuoso
              data={assessments}
              rangeChanged={({ endIndex }) => {
                if (endIndex >= (assessments?.length ?? 0) - 10) {
                  loadMoreAssessments();
                }
              }}
              components={{
                Footer: () =>
                  loadingAssessments ?
                    <div className="flex justify-center py-2">
                      <CircularProgress size={28} />
                    </div>
                  : null,
              }}
              style={{ height: "100%", width: "100%" }}
              itemContent={(_, a) => (
                <div className="pb-4">
                  <div
                    key={a.id}
                    className="flex flex-row items-center bg-gray-200 p-2 px-2 shadow-xl"
                  >
                    <CCheckbox
                      checked={localLocation.assessmentsIds.includes(a.id)}
                      onChange={(e) => {
                        setLocalLocation((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            assessmentsIds:
                              e.target.checked ?
                                [...prev.assessmentsIds, a.id]
                              : prev.assessmentsIds.filter((id) => id !== a.id),
                          };
                        });
                      }}
                    />
                    <div className="flex w-full flex-row items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex flex-row items-center">
                          <IconClipboard />
                          {a.form.name}
                          <Chip
                            sx={{ ml: 1 }}
                            size="small"
                            color={a.isFinalized ? "secondary" : "error"}
                            label={
                              a.isFinalized ? "Finalizado" : "Em progresso"
                            }
                          />
                        </div>
                        <span className="flex flex-row items-center">
                          {`${dateTimeFormatter.format(a.startDate)} - ${a.endDate ? dateTimeFormatter.format(a.endDate) : "Sem data final!"}`}
                        </span>
                      </div>
                      <span className="flex">
                        <IconUser />
                        {a.user.username}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            />
      </div>
    </CDialog>
  );
};

export default LocationParamsDialog;
