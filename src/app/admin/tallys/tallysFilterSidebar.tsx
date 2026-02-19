import { TallysFilterType } from "@/app/admin/tallys/tallysClient";
import TallysFilter from "@/app/admin/tallys/tallysFilter";
import CDialog from "@/components/ui/dialog/cDialog";
import { use } from "react";

const TallysFilterSidebar = ({
  usersPromise,
  selectedLocationId,
  defaultLocationId,
  isDialog,
  openDialog,
  onNoCitiesFound,
  onCloseDialog,
  handleFilterChange,
}: {
  usersPromise: Promise<{ id: string; username: string }[]>;
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
  const users = use(usersPromise);
  const innerComponent = (
    <div className="h-full w-full overflow-auto border-l border-gray-200 px-1">
      <TallysFilter
        defaultLocationId={defaultLocationId}
        selectedLocationId={selectedLocationId}
        users={users}
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

export default TallysFilterSidebar;
