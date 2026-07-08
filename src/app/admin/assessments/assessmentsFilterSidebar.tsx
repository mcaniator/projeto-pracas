import CDialog from "@/components/ui/dialog/cDialog";
import type { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";

import { AssessmentsFilterType } from "./assessmentsClient";
import AssessmentsFilter from "./assessmentsFilter";

const AssessmentsFilterSidebar = ({
  forms,
  users,
  isLoading,
  selectedLocationId,
  defaultLocationId,
  isDialog,
  openDialog,
  onNoCitiesFound,
  onCloseDialog,
  handleFilterChange,
}: {
  forms: FetchFormsResponse["forms"];
  users: { id: string; username: string }[];
  isLoading?: boolean;
  selectedLocationId: number | undefined;
  defaultLocationId: number | undefined;
  isDialog?: boolean;
  openDialog?: boolean;
  onNoCitiesFound?: () => void;
  onCloseDialog?: () => void;
  handleFilterChange: (params: {
    type: AssessmentsFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  const innerComponent = (
    <div className="h-full w-full overflow-auto border-l border-gray-200 px-1">
      <AssessmentsFilter
        defaultLocationId={defaultLocationId}
        selectedLocationId={selectedLocationId}
        forms={forms}
        users={users}
        isLoading={isLoading}
        onNoCitiesFound={onNoCitiesFound}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );

  if (isDialog) {
    return (
      <CDialog
        title="Filtros"
        fullScreen
        keepMounted
        open={openDialog ?? false}
        onClose={() => {
          onCloseDialog?.();
        }}
      >
        {innerComponent}
      </CDialog>
    );
  }

  return <div className="basis-2/5">{innerComponent}</div>;
};

export default AssessmentsFilterSidebar;
