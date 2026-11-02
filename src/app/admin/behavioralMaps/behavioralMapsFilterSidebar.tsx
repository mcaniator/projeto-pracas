import CDialog from "@/components/ui/dialog/cDialog";
import type { FetchBehavioralMapUsersResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import type { FetchBehavioralMapProtocolsResponse } from "@/lib/serverFunctions/queries/behavioralMapProtocol";

import type { BehavioralMapsFilterType } from "./behavioralMapsClient";
import BehavioralMapsFilter from "./behavioralMapsFilter";

const BehavioralMapsFilterSidebar = ({
  behavioralMapProtocols,
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
  behavioralMapProtocols: FetchBehavioralMapProtocolsResponse["behavioralMapProtocols"];
  users: FetchBehavioralMapUsersResponse["users"];
  isLoading?: boolean;
  selectedLocationId: number | undefined;
  defaultLocationId: number | undefined;
  isDialog?: boolean;
  openDialog?: boolean;
  onNoCitiesFound?: () => void;
  onCloseDialog?: () => void;
  handleFilterChange: (params: {
    type: BehavioralMapsFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  const content = (
    <div className="h-full w-full overflow-auto border-l border-gray-200 px-1">
      <BehavioralMapsFilter
        defaultLocationId={defaultLocationId}
        selectedLocationId={selectedLocationId}
        behavioralMapProtocols={behavioralMapProtocols}
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
        onClose={() => onCloseDialog?.()}
      >
        {content}
      </CDialog>
    );
  }

  return <div className="basis-2/5">{content}</div>;
};

export default BehavioralMapsFilterSidebar;
