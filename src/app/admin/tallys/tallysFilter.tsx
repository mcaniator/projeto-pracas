import { TallysFilterType } from "@/app/admin/tallys/tallysClient";
import LocationSelector from "@/components/locationSelector/locationSelector";
import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import { Divider } from "@mui/material";

import CAutocomplete from "../../../components/ui/cAutoComplete";
import CDateTimePicker from "../../../components/ui/cDateTimePicker";

const statusOptions = [
  {
    id: FINALIZATION_STATUS.ALL,
    label: "Todos",
  },
  {
    id: FINALIZATION_STATUS.NOT_FINALIZED,
    label: "Em progresso",
  },
  {
    id: FINALIZATION_STATUS.FINALIZED,
    label: "Finalizado",
  },
];

const TallysFilter = ({
  users,
  selectedLocationId,
  defaultLocationId,
  onNoCitiesFound,
  handleFilterChange,
}: {
  users: { id: string; username: string }[];
  selectedLocationId: number | undefined;
  defaultLocationId: number | undefined;
  onNoCitiesFound?: () => void;
  handleFilterChange: (params: {
    type: TallysFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <h4>Localização</h4>
      <LocationSelector
        defaultLocationId={defaultLocationId}
        selectedLocationId={selectedLocationId}
        onNoCitiesFound={onNoCitiesFound}
        onSelectedLocationChange={(v) => {
          handleFilterChange({ type: "LOCATION_ID", newValue: v?.id ?? null });
        }}
        onSelectedCityChange={(v) => {
          handleFilterChange({ type: "CITY_ID", newValue: v?.id ?? null });
        }}
        onSelectedBroadUnitChange={(v) => {
          handleFilterChange({
            type: "BROAD_UNIT_ID",
            newValue: v?.broadUnitId ?? null,
          });
        }}
        onSelectedIntermediateUnitChange={(v) => {
          handleFilterChange({
            type: "INTERMEDIATE_UNIT_ID",
            newValue: v?.intermediateUnitId ?? null,
          });
        }}
        onSelectedNarrowUnitChange={(v) => {
          handleFilterChange({
            type: "NARROW_UNIT_ID",
            newValue: v?.narrowUnitId ?? null,
          });
        }}
      />
      <Divider />
      <h4>Data inicial</h4>
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
      <Divider />
      <h4>Responsável</h4>
      <CAutocomplete
        label="Responsável"
        options={users}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(i) => i.username}
        onChange={(_, a) =>
          handleFilterChange({ type: "USER_ID", newValue: a?.id ?? null })
        }
      />
      <Divider />
      <h4>Status</h4>
      <CAutocomplete
        label="Status"
        options={statusOptions}
        disableClearable
        defaultValue={statusOptions[0]}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(i) => i.label}
        onChange={(_, a) =>
          handleFilterChange({ type: "FINALIZATION_STATUS", newValue: a.id })
        }
      />
    </div>
  );
};

export default TallysFilter;
