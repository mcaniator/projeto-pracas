import LocationDeleteDialog from "@/app/admin/map/locationDeleteDialog";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
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
import Image from "next/image";
import { useState } from "react";

const LocationDetails = ({
  location,
  closeLocationDetails,
  reloadLocations,
}: {
  location: FetchLocationsResponse["locations"][number];
  closeLocationDetails: () => void;
  reloadLocations: () => void;
}) => {
  const [openDeleteLocationDialog, setOpenDeleteLocationDialog] =
    useState(false);
  return (
    <div
      className="flex max-h-full w-96 flex-col gap-1 overflow-auto rounded-xl bg-white px-2 py-1 text-black"
      style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold">{location.name}</h3>
          <h3 className="text-xl text-gray-500">{location.popularName}</h3>
        </div>

        <CButton square variant="text" onClick={closeLocationDetails}>
          <IconX />
        </CButton>
      </div>
      <Image
        src={location.image}
        alt={location.name}
        width={384}
        height={200}
      />
      <div className="flex justify-between">
        <div className="flex gap-1">
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-100 pl-1 text-sm">
            {location.assessmentCount} avaliações{" "}
            <CButton square dense variant="text">
              <IconExternalLink />
            </CButton>
          </div>
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-100 pl-1 text-sm">
            {location.assessmentCount} contagens{" "}
            <CButton square dense variant="text">
              <IconExternalLink />
            </CButton>
          </div>
        </div>
        <div className="flex gap-1">
          <CButton square dense>
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
      <h4 className="font-semibold">Localização</h4>
      <div className="flex items-center">
        <CIconChip
          icon={<IconBuildingCommunity />}
          tooltip="Unidades Administrativas"
        />
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {location.narrowAdministrativeUnitName ?
            <div>{location.narrowAdministrativeUnitName}</div>
          : <IconX size={12} />}
          {location.intermediateAdministrativeUnitName ?
            <div>{location.intermediateAdministrativeUnitName}</div>
          : <IconX size={12} />}
          {location.broadAdministrativeUnitName ?
            <div>{location.broadAdministrativeUnitName}</div>
          : <IconX size={12} />}
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
        {`${location.typeName}`}
      </span>
      <span>
        <CIconChip icon={<IconCircleDashedLetterC />} tooltip="Categoria" />
        {`${location.categoryName}`}
      </span>
      <Divider />
      <h4 className="font-semibold">Características Físicas</h4>
      <span>{`Área na prefeitura: ${location.legalArea} m²`}</span>

      <span>{`Área útil: ${location.usableArea} m²`}</span>
      <Divider />
      <h4 className="font-semibold">Histórico</h4>
      <span>{`Ano de criação: ${location.creationYear}`}</span>
      <span>{`Última manutenção: ${location.lastMaintenanceYear}`}</span>
      <span>{`Prefeito fundador: ${location.overseeingMayor}`}</span>
      <span>{`Legislação: ${location.legislation}`}</span>
      <Divider />
      <h4 className="font-semibold">Observações gerais</h4>
      <div className="whitespace-pre-wrap">{location.notes}</div>
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
};

export default LocationDetails;
