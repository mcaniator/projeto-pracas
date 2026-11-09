"use client";

import CButton from "@/components/ui/cButton";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import type { ResponseFormGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import {
  IconFileSymlink,
  IconFileText,
  IconFilter,
  IconLink,
  IconMapPin,
  IconTags,
  IconUsersGroup,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import BehavioralMapFormGeometryLayer, {
  getBehavioralMapFormGeometryFeatures,
} from "./behavioralMapFormGeometryLayer";
import BehavioralMapMapFilterBox from "./behavioralMapMapFilterBox";
import BehavioralMapMapLayer from "./behavioralMapMapLayer";
import type {
  BehavioralMapGroup,
  BehavioralMapObservation,
  BehavioralMapObservationLink,
  BehavioralMapPendingPosition,
  BehavioralMapPosition,
  BehavioralMapResponseGeometryLink,
} from "./observationState";

const MapProvider = dynamic(() => import("@/app/admin/map/mapProvider"), {
  ssr: false,
});

const visibilityToggleGroupSx = {
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: { xs: "34px", sm: "42px" },
  "& .MuiToggleButtonGroup-grouped": { marginLeft: "0 !important" },
};

type BehavioralMapDetails =
  FetchBehavioralMapDetailsResponse["behavioralMapDetails"];
type ProtocolGroups =
  BehavioralMapDetails["behavioralMapSubmission"]["behavioralMapProtocolStructure"]["behavioralMapProtocolGroups"];

const BehavioralMapMap = ({
  details,
  formGeometries,
  groups,
  observations,
  observationLinks,
  responseGeometryLinks,
  personGroups,
  selectedGroupTargetLocalIds,
  selectedLinkTargetLocalIds,
  selectedGeometryTargetLocalIds,
  selectedLinkLocalId,
  selectedLinkSourceLocalId,
  selectedGroupLocalId,
  pendingPosition,
  selectedObservationLocalId,
  onMapClick,
  onObservationClick,
  onFormGeometryClick,
  onLinkClick,
  onGroupClick,
}: {
  details: BehavioralMapDetails;
  formGeometries?: ResponseFormGeometry[];
  groups: ProtocolGroups;
  observations: BehavioralMapObservation[];
  observationLinks: BehavioralMapObservationLink[];
  responseGeometryLinks: BehavioralMapResponseGeometryLink[];
  personGroups: BehavioralMapGroup[];
  selectedGroupTargetLocalIds: string[];
  selectedLinkTargetLocalIds: string[];
  selectedGeometryTargetLocalIds: string[];
  selectedLinkLocalId: string | null;
  selectedLinkSourceLocalId: string | null;
  selectedGroupLocalId: string | null;
  pendingPosition: BehavioralMapPendingPosition | null;
  selectedObservationLocalId: string | null;
  onMapClick: (position: [number, number]) => void;
  onObservationClick: (localId: string) => void;
  onFormGeometryClick?: (localId: string) => void;
  onLinkClick: (localId: string) => void;
  onGroupClick: (localId: string) => void;
}) => {
  const [activeCharacteristicIds, setActiveCharacteristicIds] = useState(
    () =>
      new Set(
        groups.flatMap((group) =>
          group.personCharacteristicGroup.isTagGroup ?
            []
          : group.characteristics.map(
              ({ personCharacteristic }) => personCharacteristic.id,
            ),
        ),
      ),
  );
  const [noTagFilterGroupIds, setNoTagFilterGroupIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const formCategories =
    details.behavioralMapSubmission.formSubmission?.formStructure.categories;
  const formGeometryFeatures = useMemo(
    () => getBehavioralMapFormGeometryFeatures(
      formGeometries ?? [],
      formCategories ?? [],
    ),
    [formCategories, formGeometries],
  );
  const formGeometryPositionsById = useMemo(() => {
    const positions = new Map<string, BehavioralMapPosition>();
    for (const { localId, position } of formGeometryFeatures) {
      if (localId !== undefined) positions.set(localId, position);
    }
    return positions;
  }, [formGeometryFeatures]);
  const [visibleLayers, setVisibleLayers] = useState([
    "groups",
    "observationLinks",
    ...(formGeometries ? ["responseGeometryLinks", "formGeometries"] : []),
    "observations",
  ]);
  const [visibleLabels, setVisibleLabels] = useState([
    "groups",
    "observationLinks",
    ...(formGeometries ? ["responseGeometryLinks", "formGeometries"] : []),
  ]);
  const visibilityOptions = [
    {
      value: "groups",
      label: <IconUsersGroup />,
      tooltip: "Mostrar grupos",
      labelsTooltip: "Mostrar rótulos dos grupos",
    },
    {
      value: "observationLinks",
      label: <IconLink />,
      tooltip: "Mostrar ligações entre observações",
      labelsTooltip: "Mostrar rótulos das ligações entre observações",
    },
    ...(formGeometries ?
      [
        {
          value: "responseGeometryLinks",
          label: <IconFileSymlink />,
          tooltip: "Mostrar ligações com geometrias do formulário",
          labelsTooltip:
            "Mostrar rótulos das ligações com geometrias do formulário",
        },
        {
          value: "formGeometries",
          label: <IconFileText />,
          tooltip: "Mostrar geometrias do formulário",
          labelsTooltip: "Mostrar rótulos das geometrias do formulário",
        },
      ]
    : []),
    {
      value: "observations",
      label: <IconMapPin />,
      tooltip: "Mostrar observações",
      labelsTooltip: null,
    },
  ];
  const labelVisibilityOptions = visibilityOptions.flatMap(
    ({ value, labelsTooltip }) =>
      labelsTooltip ? [{ value, tooltip: labelsTooltip }] : [],
  );

  useEffect(() => {
    setActiveCharacteristicIds(
      new Set(
        groups.flatMap((group) =>
          group.personCharacteristicGroup.isTagGroup ?
            []
          : group.characteristics.map(
              ({ personCharacteristic }) => personCharacteristic.id,
            ),
        ),
      ),
    );
    setNoTagFilterGroupIds(new Set());
  }, [groups]);

  const handleCharacteristicActiveChange = (
    personCharacteristicId: number,
    isActive: boolean,
  ) => {
    setActiveCharacteristicIds((current) => {
      const next = new Set(current);
      if (isActive) next.add(personCharacteristicId);
      else next.delete(personCharacteristicId);
      return next;
    });
  };

  const handleNoTagFilterChange = (groupId: number, isActive: boolean) => {
    setNoTagFilterGroupIds((current) => {
      const next = new Set(current);
      if (isActive) next.add(groupId);
      else next.delete(groupId);
      return next;
    });
  };

  const filteredObservations = useMemo(() => {
    const tagGroups = groups.filter(
      (group) => group.personCharacteristicGroup.isTagGroup,
    );
    const tagCharacteristicIds = new Set(
      tagGroups.flatMap((group) =>
        group.characteristics.map(
          ({ personCharacteristic }) => personCharacteristic.id,
        ),
      ),
    );

    return observations.filter((observation) => {
      const observationCharacteristicIds = new Set<number>();
      for (const { personCharacteristicId } of observation.characteristics) {
        if (
          !tagCharacteristicIds.has(personCharacteristicId) &&
          !activeCharacteristicIds.has(personCharacteristicId)
        ) {
          return false;
        }
        observationCharacteristicIds.add(personCharacteristicId);
      }

      return tagGroups.every((group) => {
        const groupCharacteristicIds = group.characteristics.map(
          ({ personCharacteristic }) => personCharacteristic.id,
        );
        if (noTagFilterGroupIds.has(group.id)) {
          return !groupCharacteristicIds.some((id) =>
            observationCharacteristicIds.has(id),
          );
        }

        const selectedCharacteristicIds = groupCharacteristicIds.filter((id) =>
          activeCharacteristicIds.has(id),
        );
        return selectedCharacteristicIds.every((id) =>
          observationCharacteristicIds.has(id),
        );
      });
    });
  }, [activeCharacteristicIds, groups, noTagFilterGroupIds, observations]);

  const visibleObservationIds = useMemo(
    () => new Set(filteredObservations.map(({ localId }) => localId)),
    [filteredObservations],
  );
  const areObservationLinksVisible = visibleLayers.includes("observationLinks");
  const areResponseGeometryLinksVisible =
    visibleLayers.includes("responseGeometryLinks");
  const filteredObservationLinks = useMemo(
    () =>
      areObservationLinksVisible ?
        observationLinks.filter(
          (link) =>
            visibleObservationIds.has(link.observationALocalId) &&
            visibleObservationIds.has(link.observationBLocalId),
        )
      : [],
    [areObservationLinksVisible, observationLinks, visibleObservationIds],
  );
  const filteredResponseGeometryLinks = useMemo(
    () =>
      areResponseGeometryLinksVisible ?
        responseGeometryLinks.filter(
          (link) =>
            visibleObservationIds.has(link.observationALocalId) &&
            formGeometryPositionsById.has(link.responseGeometryLocalId),
        )
      : [],
    [
      areResponseGeometryLinksVisible,
      formGeometryPositionsById,
      responseGeometryLinks,
      visibleObservationIds,
    ],
  );
  const selectedGeometryLocalIds = useMemo(() => {
    const selectedLink = filteredResponseGeometryLinks.find(
      (link) => link.localId === selectedLinkLocalId,
    );
    return selectedLink ?
        [...selectedGeometryTargetLocalIds, selectedLink.responseGeometryLocalId]
      : selectedGeometryTargetLocalIds;
  }, [
    filteredResponseGeometryLinks,
    selectedGeometryTargetLocalIds,
    selectedLinkLocalId,
  ]);

  const appliedFiltersCount = groups.reduce((count, group) => {
    if (group.personCharacteristicGroup.isTagGroup) {
      if (noTagFilterGroupIds.has(group.id)) return count + 1;
      return (
        count +
        group.characteristics.filter(({ personCharacteristic }) =>
          activeCharacteristicIds.has(personCharacteristic.id),
        ).length
      );
    }

    return (
      count +
      group.characteristics.filter(
        ({ personCharacteristic }) =>
          !activeCharacteristicIds.has(personCharacteristic.id),
      ).length
    );
  }, 0);

  return (
    <div className="relative h-2/3 min-h-0" aria-label="Mapa comportamental">
      <MapProvider>
        {formGeometries && formCategories && (
          <BehavioralMapFormGeometryLayer
            geometryFeatures={formGeometryFeatures}
            selectedGeometryLocalIds={selectedGeometryLocalIds}
            visible={visibleLayers.includes("formGeometries")}
            labelsVisible={visibleLabels.includes("formGeometries")}
          />
        )}
        <BehavioralMapMapLayer
          details={details}
          isGroupsVisible={visibleLayers.includes("groups")}
          areGroupLabelsVisible={visibleLabels.includes("groups")}
          areObservationLinkLabelsVisible={visibleLabels.includes(
            "observationLinks",
          )}
          areResponseGeometryLinkLabelsVisible={visibleLabels.includes(
            "responseGeometryLinks",
          )}
          isObservationsVisible={visibleLayers.includes("observations")}
          observations={filteredObservations}
          observationLinks={filteredObservationLinks}
          responseGeometryLinks={filteredResponseGeometryLinks}
          formGeometryPositionsById={formGeometryPositionsById}
          personGroups={personGroups}
          selectedGroupTargetLocalIds={selectedGroupTargetLocalIds}
          selectedLinkTargetLocalIds={selectedLinkTargetLocalIds}
          selectedLinkLocalId={selectedLinkLocalId}
          selectedLinkSourceLocalId={selectedLinkSourceLocalId}
          selectedGroupLocalId={selectedGroupLocalId}
          pendingPosition={pendingPosition}
          onMapClick={onMapClick}
          onObservationClick={onObservationClick}
          onFormGeometryClick={onFormGeometryClick}
          onLinkClick={onLinkClick}
          onGroupClick={onGroupClick}
          selectedObservationLocalId={selectedObservationLocalId}
        />
      </MapProvider>
      <div className="absolute left-3 top-3 z-20 flex flex-col items-start">
        <CToggleButtonGroup
          options={visibilityOptions}
          sx={visibilityToggleGroupSx}
          value={visibleLayers}
          multiple
          getLabel={(option) => option.label}
          getValue={(option) => option.value}
          getTooltip={(option) => option.tooltip}
          onMultipleChange={(_, selected) =>
            setVisibleLayers(selected.map(({ value }) => value))
          }
          aria-label="Visibilidade das camadas do mapa"
        />
        <CToggleButtonGroup
          options={labelVisibilityOptions}
          sx={visibilityToggleGroupSx}
          value={visibleLabels}
          multiple
          getLabel={() => <IconTags />}
          getValue={(option) => option.value}
          getTooltip={(option) => option.tooltip}
          onMultipleChange={(_, selected) =>
            setVisibleLabels(selected.map(({ value }) => value))
          }
          aria-label="Visibilidade dos rótulos do mapa"
        />
      </div>
      <div className="absolute right-3 top-3 z-20">
        <CButton
          square
          enableTopLeftChip
          topLeftChipLabel={appliedFiltersCount}
          aria-label="Filtrar observações do mapa"
          onClick={() => setIsFiltersDialogOpen(true)}
        >
          <IconFilter />
        </CButton>
      </div>

      <CDialog
        open={isFiltersDialogOpen}
        onClose={() => setIsFiltersDialogOpen(false)}
        title="Filtros do mapa"
        fullScreen
        disableDialogActions
      >
        <BehavioralMapMapFilterBox
          groups={groups}
          activeCharacteristicIds={activeCharacteristicIds}
          noTagFilterGroupIds={noTagFilterGroupIds}
          onCharacteristicActiveChange={handleCharacteristicActiveChange}
          onNoTagFilterChange={handleNoTagFilterChange}
        />
      </CDialog>
    </div>
  );
};

export default BehavioralMapMap;
