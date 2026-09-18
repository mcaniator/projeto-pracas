import type { ModularTallysFilterType } from "@/app/admin/tallys/modularTallysClient";
import LocationSelector from "@/components/locationSelector/locationSelector";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import type {
  FetchModularTallyTemplatesResponse,
  FetchModularTallyUsersResponse,
} from "@/lib/serverFunctions/queries/modularTally";
import { Divider } from "@mui/material";
import { IconExternalLink } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

const statusOptions = [
  { id: FINALIZATION_STATUS.ALL, label: "Todos" },
  { id: FINALIZATION_STATUS.NOT_FINALIZED, label: "Em progresso" },
  { id: FINALIZATION_STATUS.FINALIZED, label: "Finalizado" },
];

const ModularTallyTemplateSelector = ({
  modularTallyTemplates,
  isLoading,
  handleFilterChange,
}: {
  modularTallyTemplates: FetchModularTallyTemplatesResponse["modularTallyTemplates"];
  isLoading?: boolean;
  handleFilterChange: (params: {
    type: ModularTallysFilterType;
    newValue: string | number | Date | null;
  }) => void;
}) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  return (
    <CAutocomplete
      label="Protocolo"
      className="w-full"
      options={modularTallyTemplates}
      loading={isLoading}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(template) => template.name}
      onChange={(_, template) =>
        handleFilterChange({
          type: "MODULAR_TALLY_TEMPLATE_ID",
          newValue: template?.id ?? null,
        })
      }
      suffixButtonChildren={<IconExternalLink />}
      suffixButtonLoading={isRedirecting}
      onSuffixButtonClick={() => {
        setIsRedirecting(true);
        router.push("/admin/protocols?type=tally");
      }}
    />
  );
};

const ModularTallysFilter = ({
  modularTallyTemplates,
  users,
  isLoading,
  selectedLocationId,
  defaultLocationId,
  onNoCitiesFound,
  handleFilterChange,
}: {
  modularTallyTemplates: FetchModularTallyTemplatesResponse["modularTallyTemplates"];
  users: FetchModularTallyUsersResponse["users"];
  isLoading?: boolean;
  selectedLocationId: number | undefined;
  defaultLocationId: number | undefined;
  onNoCitiesFound?: () => void;
  handleFilterChange: (params: {
    type: ModularTallysFilterType;
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
        onSelectedLocationChange={(location) =>
          handleFilterChange({
            type: "LOCATION_ID",
            newValue: location?.id ?? null,
          })
        }
        onSelectedCityChange={(city) =>
          handleFilterChange({ type: "CITY_ID", newValue: city?.id ?? null })
        }
        onSelectedBroadUnitChange={(unit) =>
          handleFilterChange({
            type: "BROAD_UNIT_ID",
            newValue: unit?.broadUnitId ?? null,
          })
        }
        onSelectedIntermediateUnitChange={(unit) =>
          handleFilterChange({
            type: "INTERMEDIATE_UNIT_ID",
            newValue: unit?.intermediateUnitId ?? null,
          })
        }
        onSelectedNarrowUnitChange={(unit) =>
          handleFilterChange({
            type: "NARROW_UNIT_ID",
            newValue: unit?.narrowUnitId ?? null,
          })
        }
      />
      <Divider />
      <h4>Protocolo</h4>
      <ModularTallyTemplateSelector
        modularTallyTemplates={modularTallyTemplates}
        isLoading={isLoading}
        handleFilterChange={handleFilterChange}
      />
      <Divider />
      <h4>Data inicial</h4>
      <CDateTimePicker
        label="Início - Data inicial"
        debounce={600}
        clearable
        onAccept={(date) =>
          handleFilterChange({
            type: "START_DATE",
            newValue: date?.toDate() ?? null,
          })
        }
      />
      <CDateTimePicker
        label="Início - Data final"
        debounce={600}
        clearable
        onAccept={(date) =>
          handleFilterChange({
            type: "END_DATE",
            newValue: date?.toDate() ?? null,
          })
        }
      />
      <Divider />
      <h4>Responsável</h4>
      <CAutocomplete
        label="Responsável"
        options={users}
        loading={isLoading}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(user) => user.username}
        onChange={(_, user) =>
          handleFilterChange({ type: "USER_ID", newValue: user?.id ?? null })
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
        getOptionLabel={(status) => status.label}
        onChange={(_, status) =>
          handleFilterChange({
            type: "FINALIZATION_STATUS",
            newValue: status.id,
          })
        }
      />
    </div>
  );
};

export default ModularTallysFilter;
