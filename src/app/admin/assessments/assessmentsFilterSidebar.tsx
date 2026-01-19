import CDialog from "@/components/ui/dialog/cDialog";
import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { use } from "react";

import { AssessmentsFilterType } from "./assessmentsClient";
import AssessmentsFilter from "./assessmentsFilter";

const AssessmentsFilterSidebar = ({
  forms,
  usersPromise,
  selectedLocationId,
  defaultLocationId,
  isDialog,
  openDialog,
  onCloseDialog,
  handleFilterChange,
}: {
  forms: FetchFormsResponse["forms"];
  usersPromise: Promise<{ id: string; username: string }[]>;
  selectedLocationId: number | undefined;
  defaultLocationId: number | undefined;
  isDialog?: boolean;
  openDialog?: boolean;
  onCloseDialog?: () => void;
  handleFilterChange: (params: {
    type: AssessmentsFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  const users = use(usersPromise);
  const innerComponent = (
    <div className="h-full w-full overflow-auto border-l border-gray-200 px-1">
      <AssessmentsFilter
        defaultLocationId={defaultLocationId}
        selectedLocationId={selectedLocationId}
        forms={forms}
        users={users}
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
