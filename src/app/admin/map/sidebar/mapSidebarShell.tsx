"use client";

import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import CAutocomplete from "@components/ui/cAutoComplete";
import { Divider } from "@mui/material";
import { BrazilianStates } from "@prisma/client";
import { IconChartBar, IconListDetails } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";

import CButton from "../../../../components/ui/cButton";
import AssessmentsSidebar, {
  AssessmentsSidebarProps,
} from "../assessmentsSidebar/assessmentsSidebar";
import Sidebar, { LocationsSidebar, LocationsSidebarProps } from "./sidebar";

export const sidebarModes = {
  LOCATIONS: 0,
  ASSESSMENTS: 1,
};

export type SidebarMode = (typeof sidebarModes)[keyof typeof sidebarModes];

const sidebarModeOptions = [
  {
    label: <IconListDetails />,
    mobileLabel: "Praças",
    tooltip: "Praças",
    title: "Praças",
    value: sidebarModes.LOCATIONS,
  },
  {
    label: <IconChartBar />,
    mobileLabel: "Comparar",
    tooltip: "Comparar praças",
    title: "Comparar praças",
    value: sidebarModes.ASSESSMENTS,
  },
];

const MapSidebarShell = ({
  assessmentsSidebarProps,
  mode,
  locationsSidebarProps,
  setMode,
}: {
  assessmentsSidebarProps: AssessmentsSidebarProps;
  mode: SidebarMode;
  locationsSidebarProps: LocationsSidebarProps;
  setMode: Dispatch<SetStateAction<SidebarMode>>;
}) => {
  const {
    citiesOptions,
    isMobileView,
    loadingCities,
    locations,
    selectedCity,
    setCity,
    setSidebarDialogOpen,
    setState,
    sidebarDialogOpen,
    state,
  } = locationsSidebarProps;

  const content =
    mode === sidebarModes.LOCATIONS ?
      <LocationsSidebar {...locationsSidebarProps} />
    : <AssessmentsSidebar {...assessmentsSidebarProps} />;

  const selectedMode =
    sidebarModeOptions.find((option) => option.value === mode) ??
    sidebarModeOptions[0]!;
  const topLeftChipLabel =
    mode === sidebarModes.LOCATIONS ?
      locations.length
    : assessmentsSidebarProps.locations.length;

  const modeToggle = (
    <CToggleButtonGroup
      orientation={isMobileView ? "horizontal" : "vertical"}
      options={sidebarModeOptions}
      value={mode}
      getValue={(option) => option.value}
      getLabel={(option) => (isMobileView ? option.mobileLabel : option.label)}
      getTooltip={(option) => option.tooltip}
      onChange={(_, option) => setMode(option.value)}
      sx={{
        bgcolor: "white",
        boxShadow: "none",
      }}
    />
  );

  if (isMobileView) {
    return (
      <>
        <CDialog
          fullScreen
          keepMounted
          title={selectedMode.title}
          open={sidebarDialogOpen}
          onClose={() => {
            setSidebarDialogOpen(false);
          }}
        >
          <div className="flex h-full flex-col gap-2">
            <div className="flex justify-center">{modeToggle}</div>
            {content}
          </div>
        </CDialog>
        <div className="pointer-events-auto flex w-full justify-between">
          <CButton
            square={true}
            enableTopLeftChip
            topLeftChipLabel={topLeftChipLabel}
            onClick={() => {
              setSidebarDialogOpen(true);
            }}
          >
            {selectedMode.label}
          </CButton>
          <div className="ml-1 flex w-full gap-1">
            <CAutocomplete
              className="w-32"
              label="Estado"
              disableClearable
              options={Object.values(BrazilianStates)}
              value={state}
              onChange={(_, v) => setState(v)}
            />
            <CAutocomplete
              className="w-full"
              label="Cidade"
              loading={loadingCities}
              value={
                citiesOptions?.find((c) => c.id === selectedCity?.id) ?? {
                  id: -1,
                  name: "Nenhuma cidade selecionada",
                  state: state,
                  broadAdministrativeUnit: [],
                  intermediateAdministrativeUnit: [],
                  narrowAdministrativeUnit: [],
                  broadAdministrativeUnitTitle: null,
                  intermediateAdministrativeUnitTitle: null,
                  narrowAdministrativeUnitTitle: null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              }
              disableClearable
              options={citiesOptions ?? []}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(o) => o.name}
              onChange={(_, v) => setCity(v)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className="pointer-events-auto flex max-h-full rounded-xl bg-white"
      style={{ boxShadow: "0px 0px 10px 5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex h-full flex-col rounded-l-xl p-1 text-black">
        {modeToggle}
      </div>
      <Divider orientation="vertical" />
      {mode === sidebarModes.LOCATIONS ?
        <Sidebar {...locationsSidebarProps} isMobileView={false} />
      : <div className="flex max-h-full w-96 flex-col gap-1 overflow-auto rounded-r-xl bg-white p-1 text-black">
          {content}
        </div>
      }
    </div>
  );
};

export default MapSidebarShell;
