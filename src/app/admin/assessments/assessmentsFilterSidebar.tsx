import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { use } from "react";

import { AssessmentsFilterType } from "./assessmentsClient";
import AssessmentsFilter from "./assessmentsFilter";

const AssessmentsFilterSidebar = ({
  forms,
  usersPromise,
  selectedLocationId,
  handleFilterChange,
}: {
  forms: FetchFormsResponse["forms"];
  usersPromise: Promise<{ id: string; username: string }[]>;
  selectedLocationId: number | undefined;
  handleFilterChange: (params: {
    type: AssessmentsFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  const users = use(usersPromise);
  return (
    <div className="h-full w-full overflow-auto">
      <AssessmentsFilter
        selectedLocationId={selectedLocationId}
        forms={forms}
        users={users}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default AssessmentsFilterSidebar;
