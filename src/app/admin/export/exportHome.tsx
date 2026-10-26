"use client";

import LocationSelector from "@/app/admin/export/locationSelector";
import CButton from "@/components/ui/cButton";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { Paper, useMediaQuery, useTheme } from "@mui/material";
import { IconMenu2 } from "@tabler/icons-react";
import { useState } from "react";

import { SelectedLocationObj } from "./client";
import SelectedParks from "./selectedParks";

const ExportHome = () => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const [openMenuDialog, setOpenMenuDialog] = useState(false);

  const [selectedLocationsObjs, setSelectedLocationsObjs] = useState<
    SelectedLocationObj[]
  >([]);
  const [openLocationParamsDialog, setOpenLocationParamsDialog] =
    useState(false);
  const [selectedLocationForParamsDialog, setSelectedLocationForParamsDialog] =
    useState<SelectedLocationObj | null>(null);

  const handleSelectedLocationsAddition = (
    locationObj: FetchLocationsResponse["locations"][number],
  ) => {
    const newSelectedLocation: SelectedLocationObj = {
      ...locationObj,
      assessmentsIds: [],
    };

    setSelectedLocationsObjs((prev) => [...prev, newSelectedLocation]);
    setSelectedLocationForParamsDialog(newSelectedLocation);
    if (isMobileView) {
      setOpenMenuDialog(true);
    }
    setOpenLocationParamsDialog(true);
  };
  const handleSelectedLocationsRemoval = (id: number) => {
    if (selectedLocationsObjs.some((location) => location.id === id)) {
      setSelectedLocationsObjs((prev) => prev.filter((item) => item.id !== id));
      if (selectedLocationForParamsDialog?.id === id) {
        setSelectedLocationForParamsDialog(null);
        setOpenLocationParamsDialog(false);
      }
    }
  };

  const handleSelectedLocationObjChange = (
    locationObj: SelectedLocationObj,
  ) => {
    setSelectedLocationsObjs((prev) =>
      prev.map((item) => (item.id === locationObj.id ? locationObj : item)),
    );
    setSelectedLocationForParamsDialog((prev) => {
      if (prev?.id !== locationObj.id) return prev;
      return locationObj;
    });
  };
  return (
    <div className="flex h-full flex-row justify-center gap-5 overflow-auto">
      <div className="flex w-full flex-col gap-1 overflow-auto lg:basis-3/5">
        <h4 className="text-xl font-semibold">
          Selecione as praças as quais deseja exportar dados
        </h4>
        {isMobileView && (
          <CButton
            className="ml-2 w-fit"
            onClick={() => setOpenMenuDialog(true)}
            enableTopLeftChip
            topLeftChipLabel={selectedLocationsObjs.length}
            square
          >
            <IconMenu2 />
          </CButton>
        )}
        <LocationSelector
          onSelecion={(v) => {
            handleSelectedLocationsAddition(v);
          }}
          selectedLocations={selectedLocationsObjs}
        />
      </div>
      {isMobileView ?
        <SelectedParks
          selectedLocationsObjs={selectedLocationsObjs}
          isMobileView={isMobileView}
          openDialog={openMenuDialog}
          openLocationParamsDialog={openLocationParamsDialog}
          selectedLocation={selectedLocationForParamsDialog}
          handleSelectedLocationsRemoval={handleSelectedLocationsRemoval}
          handleSelectedLocationObjChange={handleSelectedLocationObjChange}
          handleOpenLocationParamsDialog={(location) => {
            setSelectedLocationForParamsDialog(location);
            setOpenLocationParamsDialog(true);
          }}
          handleCloseLocationParamsDialog={() => {
            setOpenLocationParamsDialog(false);
            setSelectedLocationForParamsDialog(null);
          }}
          handleDialogClose={() => setOpenMenuDialog(false)}
        />
      : <Paper
          elevation={5}
          className="flex w-full flex-col gap-2 overflow-auto p-2 lg:w-fit lg:basis-2/5"
        >
          <h4 className="text-xl font-semibold">Praças selecionadas</h4>

          <SelectedParks
            selectedLocationsObjs={selectedLocationsObjs}
            isMobileView={isMobileView}
            openDialog={openMenuDialog}
            openLocationParamsDialog={openLocationParamsDialog}
            selectedLocation={selectedLocationForParamsDialog}
            handleSelectedLocationsRemoval={handleSelectedLocationsRemoval}
            handleSelectedLocationObjChange={handleSelectedLocationObjChange}
            handleOpenLocationParamsDialog={(location) => {
              setSelectedLocationForParamsDialog(location);
              setOpenLocationParamsDialog(true);
            }}
            handleCloseLocationParamsDialog={() => {
              setOpenLocationParamsDialog(false);
              setSelectedLocationForParamsDialog(null);
            }}
            handleDialogClose={() => setOpenMenuDialog(false)}
          />
        </Paper>
      }
    </div>
  );
};

export { ExportHome };
