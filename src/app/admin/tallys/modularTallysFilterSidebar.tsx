import type { ModularTallysFilterType } from "@/app/admin/tallys/modularTallysClient";
import ModularTallysFilter from "@/app/admin/tallys/modularTallysFilter";
import CDialog from "@/components/ui/dialog/cDialog";
import type { FetchModularTallyUsersResponse } from "@/lib/serverFunctions/queries/modularTally";
import type { FetchModularTallyTemplatesResponse } from "@/lib/serverFunctions/queries/modularTally";

const ModularTallysFilterSidebar = ({
  modularTallyTemplates,
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
  modularTallyTemplates: FetchModularTallyTemplatesResponse["modularTallyTemplates"];
  users: FetchModularTallyUsersResponse["users"];
  isLoading?: boolean;
  selectedLocationId: number | undefined;
  defaultLocationId: number | undefined;
  isDialog?: boolean;
  openDialog?: boolean;
  onNoCitiesFound?: () => void;
  onCloseDialog?: () => void;
  handleFilterChange: (params: {
    type: ModularTallysFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  const content = (
    <div className="h-full w-full overflow-auto border-l border-gray-200 px-1">
      <ModularTallysFilter
        defaultLocationId={defaultLocationId}
        selectedLocationId={selectedLocationId}
        modularTallyTemplates={modularTallyTemplates}
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

export default ModularTallysFilterSidebar;
