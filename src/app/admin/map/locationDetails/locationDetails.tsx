import LocationDeleteDialog from "@/app/admin/map/locationDeleteDialog";
import CImage from "@/components/ui/CImage";
import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CIconChip from "@/components/ui/cIconChip";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Breadcrumbs, Divider } from "@mui/material";
import {
  IconBuildingCommunity,
  IconCircleDashedLetterC,
  IconCircleDashedLetterT,
  IconExternalLink,
  IconPencil,
  IconRoad,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import { Link } from "react-aria-components";

const LocationDetails = ({
  location,
  isMobileView,
  closeLocationDetails,
  reloadLocations,
  enableLocationEdition,
}: {
  location: FetchLocationsResponse["locations"][number];
  closeLocationDetails: () => void;
  reloadLocations: () => void;
  isMobileView: boolean;
  enableLocationEdition: () => void;
}) => {
  const router = useRouter();
  const [openDeleteLocationDialog, setOpenDeleteLocationDialog] =
    useState(false);
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
      <div className="flex justify-between">
        <div className="flex gap-1">
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-100 pl-1 text-sm">
            {location.assessmentCount} avaliações{" "}
            <Link href={`/admin/assessments?locationId=${location.id}`}>
              <CButton square dense variant="text">
                <IconExternalLink />
              </CButton>
            </Link>
          </div>
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-100 pl-1 text-sm">
            {location.tallyCount} contagens{" "}
            <Link href={`/admin/tallys?locationId=${location.id}`}>
              <CButton square dense variant="text">
                <IconExternalLink />
              </CButton>
            </Link>
          </div>
        </div>
        <div className="flex gap-1">
          <CButton onClick={enableLocationEdition} square dense>
            <IconPencil />
          </CButton>
          <CButton
            color="error"
            square
            dense
            onClick={() => {
              setOpenDeleteLocationDialog(true);
            }}
          >
            <IconTrash />
          </CButton>
        </div>
      </div>
      <Divider />
      <h4 className="font-semibold">Situação cadastral</h4>
      <CCheckbox checked={location.isPark} label="É praça" />
      <CCheckbox
        checked={location.inactiveNotFound}
        label="Inativo ou não encontrado"
      />
      <Divider />
      <h4 className="font-semibold">Localização</h4>
      <div className="flex items-center">
        <CIconChip
          icon={<IconBuildingCommunity />}
          tooltip="Unidades Administrativas"
        />
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {location.narrowAdministrativeUnitName ?
            <div>{location.narrowAdministrativeUnitName}</div>
          : <span className="ml-1">-</span>}
          {location.intermediateAdministrativeUnitName ?
            <div>{location.intermediateAdministrativeUnitName}</div>
          : <span>-</span>}
          {location.broadAdministrativeUnitName ?
            <div>{location.broadAdministrativeUnitName}</div>
          : <span>-</span>}
        </Breadcrumbs>
      </div>

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
      <span>{`Área na prefeitura: ${location.legalArea ?? "-"} m²`}</span>

      <span>{`Área útil: ${location.usableArea ?? "-"} m²`}</span>

      <span>{`Inclinação: ${location.incline ?? "-"} %`}</span>
      <Divider />
      <h4 className="font-semibold">Histórico</h4>
      <span>{`Ano de criação: ${location.creationYear ?? "-"}`}</span>
      <span>{`Última manutenção: ${location.lastMaintenanceYear ?? "-"}`}</span>
      <span>{`Prefeito fundador: ${location.overseeingMayor ?? "-"}`}</span>
      <span>{`Legislação: ${location.legislation ?? "-"}`}</span>
      <Divider />
      <h4 className="font-semibold">Observações gerais</h4>
      <div className="whitespace-pre-wrap">{location.notes ?? "-"}</div>
      <LocationDeleteDialog
        location={location}
        open={openDeleteLocationDialog}
        onDeletionSuccess={() => {
          reloadLocations();
          closeLocationDetails();
        }}
        onClose={() => {
          setOpenDeleteLocationDialog(false);
        }}
      />
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
