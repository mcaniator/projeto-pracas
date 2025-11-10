import { use } from "react";

import { PaginationInfo } from "../../../lib/utils/apiCall";
import { AssessmentsFilterType } from "./assessmentsClient";
import AssessmentsFilter from "./assessmentsFilter";

const AssessmentsFilterSidebar = ({
  locationsPromise,
  formsPromise,
  usersPromise,
  paginationInfo,
  currentPage,
  handleFilterChange,
}: {
  locationsPromise: Promise<{ id: number; name: string }[]>;
  formsPromise: Promise<{ id: number; name: string }[]>;
  usersPromise: Promise<{ id: string; username: string }[]>;
  paginationInfo: PaginationInfo;
  currentPage: number;
  handleFilterChange: (params: {
    type: AssessmentsFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  const locations = use(locationsPromise);
  const forms = use(formsPromise);
  const users = use(usersPromise);
  return (
    <div className="h-full w-full rounded-2xl outline outline-1 outline-white">
      <AssessmentsFilter
        locations={locations}
        forms={forms}
        users={users}
        paginationInfo={paginationInfo}
        currentPage={currentPage}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default AssessmentsFilterSidebar;
