import type { TallysFilterType } from "@/app/admin/tallys/tallysClient";
import TallysFilter from "@/app/admin/tallys/tallysFilter";
import CDialog from "@/components/ui/dialog/cDialog";
import type { FetchTallyUsersResponse } from "@/lib/serverFunctions/queries/tally";
import type { FetchTallyProtocolsResponse } from "@/lib/serverFunctions/queries/tally";

const TallysFilterSidebar = ({
  tallyProtocols,
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
  tallyProtocols: FetchTallyProtocolsResponse["tallyProtocols"];
  users: FetchTallyUsersResponse["users"];
  isLoading?: boolean;
  selectedLocationId: number | undefined;
  defaultLocationId: number | undefined;
  isDialog?: boolean;
  openDialog?: boolean;
  onNoCitiesFound?: () => void;
  onCloseDialog?: () => void;
  handleFilterChange: (params: {
    type: TallysFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  const content = (
    <div className="h-full w-full overflow-auto border-l border-gray-200 px-1">
      <TallysFilter
        defaultLocationId={defaultLocationId}
        selectedLocationId={selectedLocationId}
        tallyProtocols={tallyProtocols}
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

export default TallysFilterSidebar;
