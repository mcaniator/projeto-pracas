import PublicAssessmentResultViewerDialog from "@/app/map/locationDetails/publicAssessmentResultViewerDialog";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { usePublicFetchPublicAssessments } from "@/lib/serverFunctions/apiCalls/public/assessment";
import { PublicFetchPublicAssessmentsResponse } from "@/lib/serverFunctions/queries/public/assessment";
import { Box } from "@mui/material";
import { IconBrowserMaximize, IconCalendar } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";

const AssessmentHistory = ({
  locationId,
  locationName,
}: {
  locationId: number;
  locationName: string;
}) => {
  const [assessments, setAssessments] = useState<
    PublicFetchPublicAssessmentsResponse["assessments"]
  >([]);
  const [selectedAssessment, setSelectedAssessment] = useState<
    PublicFetchPublicAssessmentsResponse["assessments"][number] | null
  >(null);
  const [fetchPublicAssessments, loading] = usePublicFetchPublicAssessments({
    callbacks: {
      onSuccess: (response) => {
        setAssessments(response.data?.assessments ?? []);
      },
    },
  });
  useEffect(() => {
    void fetchPublicAssessments({ locationId });
  }, [locationId, fetchPublicAssessments]);
  if (loading) {
    return <CLinearProgress label="Carregando..." />;
  }
  return (
    <Box sx={{ height: "100%" }}>
      <Virtuoso
        data={assessments}
        style={{ height: "100%", overflowX: "auto" }}
        components={{
          EmptyPlaceholder: () => (
            <div className="flex items-center justify-center">
              Nenhuma avaliação encontrada
            </div>
          ),
        }}
        itemContent={(_, a) => {
          return (
            <div className="pb-4" key={a.id}>
              <div className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl">
                <div className="flex h-auto w-full flex-col gap-1">
                  <div className="flex flex-wrap justify-between">
                    <span className="flex items-center text-base sm:text-xl">
                      <CIconChip
                        icon={<IconCalendar />}
                        tooltip={"Data da avaliação"}
                      />
                      {`${dateFormatter.format(new Date(a.startDate))}`}
                    </span>
                    <CButton square onClick={() => setSelectedAssessment(a)}>
                      <IconBrowserMaximize />
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />
      <PublicAssessmentResultViewerDialog
        locationName={locationName}
        selectedAssessment={selectedAssessment}
        onClose={() => {
          setSelectedAssessment(null);
        }}
      />
    </Box>
  );
};

export default AssessmentHistory;
