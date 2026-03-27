import CCheckbox from "@/components/ui/cCheckbox";
import CIconChip from "@/components/ui/cIconChip";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import { Divider } from "@mui/material";
import {
  IconCircleDashedLetterC,
  IconCircleDashedLetterT,
  IconRoad,
} from "@tabler/icons-react";

const LocationInfo = ({
  location,
}: {
  location: PublicFetchLocationsResponse["locations"][number];
}) => {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="font-semibold">Localização</h4>
      <CLocationAdministrativeUnits location={location} />

      <div className="flex items-center">
        <CIconChip icon={<IconRoad />} tooltip="Ruas" />
        {[
          location.firstStreet,
          location.secondStreet,
          location.thirdStreet,
          location.fourthStreet,
        ]
          .filter(Boolean)
          .join(", ")}
      </div>
      {(location.categoryName || location.typeName) && (
        <>
          <Divider />
          <h4 className="font-semibold">Categorização</h4>
          {location.typeName && (
            <span>
              <CIconChip icon={<IconCircleDashedLetterT />} tooltip="Tipo" />
              {location.typeName}
            </span>
          )}
          {location.categoryName && (
            <span>
              <CIconChip
                icon={<IconCircleDashedLetterC />}
                tooltip="Categoria"
              />
              {location.categoryName}
            </span>
          )}
        </>
      )}

      {(location.usableArea || location.legalArea || location.incline) && (
        <>
          <Divider />
          <h4 className="font-semibold">Características Físicas</h4>
          {location.legalArea && (
            <span>{`Área oficial (prefeitura): ${location.legalArea} m²`}</span>
          )}
          {location.usableArea && (
            <span>{`Área útil: ${location.usableArea} m²`}</span>
          )}
          {location.incline && (
            <span>{`Inclinação: ${location.incline} %`}</span>
          )}
        </>
      )}

      {(location.creationYear ||
        location.lastMaintenanceYear ||
        location.legislation) && (
        <>
          <Divider />
          <h4 className="font-semibold">Histórico</h4>
          {location.creationYear && (
            <span>{`Ano de criação: ${location.creationYear}`}</span>
          )}
          {location.lastMaintenanceYear && (
            <span>{`Última manutenção: ${location.lastMaintenanceYear}`}</span>
          )}
          {location.legislation && (
            <span>{`Legislação: ${location.legislation}`}</span>
          )}
        </>
      )}
      <Divider />
      <h4 className="font-semibold">Situação cadastral</h4>
      <CCheckbox checked={location.isPark} label="É praça" disabled />
      <CCheckbox
        checked={location.inactiveNotFound}
        label="Inativo ou não encontrado"
        disabled
      />

      {location.notes && (
        <>
          <Divider />
          <h4 className="font-semibold">Observações gerais</h4>
          <div className="whitespace-pre-wrap">{location.notes}</div>
        </>
      )}
    </div>
  );
};

export default LocationInfo;
