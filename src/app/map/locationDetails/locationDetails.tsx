import CImage from "@/components/ui/CImage";
import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CIconChip from "@/components/ui/cIconChip";
import CDialog from "@/components/ui/dialog/cDialog";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import { Divider } from "@mui/material";
import {
  IconCircleDashedLetterC,
  IconCircleDashedLetterT,
  IconRoad,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";

const LocationDetails = ({
  location,
  isMobileView,
  closeLocationDetails,
}: {
  location: PublicFetchLocationsResponse["locations"][number];
  closeLocationDetails: () => void;
  isMobileView: boolean;
}) => {
  const [openMobileDialog, setOpenMobileDialog] = useState(isMobileView);
  const inner = (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        {!isMobileView && (
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold">{location.name}</h3>
            <h3 className="text-xl text-gray-500">{location.popularName}</h3>
          </div>
        )}

        {!isMobileView && (
          <CButton square variant="text" onClick={closeLocationDetails}>
            <IconX />
          </CButton>
        )}
      </div>
      <CImage
        src={location.mainImage}
        alt={location.name}
        width={384}
        height={200}
      />
      <Divider />
      <h4 className="font-semibold">Situação cadastral</h4>
      <CCheckbox checked={location.isPark} label="É praça" disabled />
      <CCheckbox
        checked={location.inactiveNotFound}
        label="Inativo ou não encontrado"
        disabled
      />
      <Divider />
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
      <Divider />
      <h4 className="font-semibold">Categorização</h4>
      <span>
        <CIconChip icon={<IconCircleDashedLetterT />} tooltip="Tipo" />
        {location.typeName ?? "-"}
      </span>
      <span>
        <CIconChip icon={<IconCircleDashedLetterC />} tooltip="Categoria" />
        {location.categoryName ?? "-"}
      </span>
      <Divider />
      <h4 className="font-semibold">Características Físicas</h4>
      <span>{`Área oficial (prefeitura): ${location.legalArea ?? "-"} m²`}</span>

      <span>{`Área útil: ${location.usableArea ?? "-"} m²`}</span>

      <span>{`Inclinação: ${location.incline ?? "-"} %`}</span>
      <Divider />
      <h4 className="font-semibold">Histórico</h4>
      <span>{`Ano de criação: ${location.creationYear ?? "-"}`}</span>
      <span>{`Última manutenção: ${location.lastMaintenanceYear ?? "-"}`}</span>
      <span>{`Legislação: ${location.legislation ?? "-"}`}</span>
      <Divider />
      <h4 className="font-semibold">Observações gerais</h4>
      <div className="whitespace-pre-wrap">{location.notes ?? "-"}</div>
    </div>
  );
  if (isMobileView) {
    return (
      <CDialog
        fullScreen
        open={openMobileDialog}
        disableBackdropClose //This is needed because if a polygon is selected in a touchscreen, the dialog will detect the touch as a brackdrop touch, closing the dialog immediately
        title={location.name}
        subtitle={location.popularName ?? undefined}
        onClose={() => {
          setOpenMobileDialog(false);
          setTimeout(() => {
            closeLocationDetails();
          }, 150);
        }}
      >
        {inner}
      </CDialog>
    );
  } else {
    return (
      <div
        className="flex h-full w-96 flex-col gap-1 overflow-auto rounded-xl bg-white px-2 py-1 text-black"
        style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
      >
        {inner}
      </div>
    );
  }
};

export default LocationDetails;
