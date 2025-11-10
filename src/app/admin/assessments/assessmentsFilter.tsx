import CAutocomplete from "../../../components/ui/cAutoComplete";
import CDateTimePicker from "../../../components/ui/cDateTimePicker";
import CPagination from "../../../components/ui/cPagination";
import { PaginationInfo } from "../../../lib/utils/apiCall";
import { AssessmentsFilterType } from "./assessmentsClient";

const AssessmentsFilter = ({
  locations,
  forms,
  users,
  paginationInfo,
  currentPage,
  handleFilterChange,
}: {
  locations: { id: number; name: string }[];
  forms: { id: number; name: string }[];
  users: { id: string; username: string }[];
  paginationInfo: PaginationInfo;
  currentPage: number;
  handleFilterChange: (params: {
    type: AssessmentsFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <CAutocomplete
        label="Praça"
        options={locations}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(i) => i.name}
        onChange={(_, a) =>
          handleFilterChange({ type: "LOCATION_ID", newValue: a?.id ?? null })
        }
      />
      <CAutocomplete
        label="Formulário"
        options={forms}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(i) => i.name}
        onChange={(_, a) =>
          handleFilterChange({ type: "FORM_ID", newValue: a?.id ?? null })
        }
      />
      <CDateTimePicker
        label="Início - Data inicial"
        debounce={600}
        clearable
        onAccept={(e) => {
          handleFilterChange({
            type: "START_DATE",
            newValue: e?.toDate() ?? null,
          });
        }}
      />
      <CDateTimePicker
        label="Início - Data final"
        debounce={600}
        clearable
        onAccept={(e) => {
          handleFilterChange({
            type: "END_DATE",
            newValue: e?.toDate() ?? null,
          });
        }}
      />
      <CAutocomplete
        label="Responsável"
        options={users}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(i) => i.username}
        onChange={(_, a) =>
          handleFilterChange({ type: "USER_ID", newValue: a?.id ?? null })
        }
      />
      <CPagination
        paginationInfo={paginationInfo}
        buttonColor="secondary"
        onBackwards={() => {
          handleFilterChange({
            type: "PAGE_NUMBER",
            newValue: currentPage - 1,
          });
        }}
        onForward={() => {
          handleFilterChange({
            type: "PAGE_NUMBER",
            newValue: currentPage + 1,
          });
        }}
      />
    </div>
  );
};

export default AssessmentsFilter;
