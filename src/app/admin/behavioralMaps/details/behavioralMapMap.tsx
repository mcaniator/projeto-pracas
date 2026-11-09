"use client";

import CButton from "@/components/ui/cButton";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import {
  IconFilter,
  IconLink,
  IconMapPin,
  IconUsersGroup,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import BehavioralMapMapFilterBox from "./behavioralMapMapFilterBox";
import BehavioralMapMapLayer from "./behavioralMapMapLayer";
import type {
  BehavioralMapGroup,
  BehavioralMapInteraction,
} from "./observationState";
import type {
  BehavioralMapObservation,
  BehavioralMapPendingPosition,
} from "./observationState";

const MapProvider = dynamic(() => import("@/app/admin/map/mapProvider"), {
  ssr: false,
});

type BehavioralMapDetails =
  FetchBehavioralMapDetailsResponse["behavioralMapDetails"];
type ProtocolGroups =
  BehavioralMapDetails["behavioralMapSubmission"]["behavioralMapProtocolStructure"]["behavioralMapProtocolGroups"];

const BehavioralMapMap = ({
  details,
  groups,
  observations,
  interactions,
  personGroups,
  selectedGroupTargetLocalIds,
  selectedInteractionTargetLocalIds,
  selectedInteractionLocalId,
  selectedInteractionSourceLocalId,
  selectedGroupLocalId,
  pendingPosition,
  selectedObservationLocalId,
  onMapClick,
  onObservationClick,
  onInteractionClick,
  onGroupClick,
}: {
  details: BehavioralMapDetails;
  groups: ProtocolGroups;
  observations: BehavioralMapObservation[];
  interactions: BehavioralMapInteraction[];
  personGroups: BehavioralMapGroup[];
  selectedGroupTargetLocalIds: string[];
  selectedInteractionTargetLocalIds: string[];
  selectedInteractionLocalId: string | null;
  selectedInteractionSourceLocalId: string | null;
  selectedGroupLocalId: string | null;
  pendingPosition: BehavioralMapPendingPosition | null;
  selectedObservationLocalId: string | null;
  onMapClick: (position: [number, number]) => void;
  onObservationClick: (localId: string) => void;
  onInteractionClick: (localId: string) => void;
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
  const [visibleLayers, setVisibleLayers] = useState([
    "observations",
    "groups",
    "interactions",
  ]);
  const visibilityOptions = [
    {
      value: "observations",
      label: <IconMapPin />,
      tooltip: "Mostrar observações",
    },
    { value: "groups", label: <IconUsersGroup />, tooltip: "Mostrar grupos" },
    {
      value: "interactions",
      label: <IconLink />,
      tooltip: "Mostrar intera��es",
    },
  ];

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
      const observationCharacteristicIds = new Set(
        observation.personCharacteristicIds,
      );
      const hasOnlyActiveCharacteristics =
        observation.personCharacteristicIds.every(
          (id) =>
            tagCharacteristicIds.has(id) || activeCharacteristicIds.has(id),
        );
      if (!hasOnlyActiveCharacteristics) return false;

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
  const filteredInteractions = useMemo(
    () =>
      interactions.filter(
        (interaction) =>
          visibleObservationIds.has(interaction.observationALocalId) &&
          visibleObservationIds.has(interaction.observationBLocalId),
      ),
    [interactions, visibleObservationIds],
  );

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
    <div className="relative h-1/2 min-h-0" aria-label="Mapa comportamental">
      <MapProvider>
        <BehavioralMapMapLayer
          details={details}
          isGroupsVisible={visibleLayers.includes("groups")}
          isInteractionsVisible={visibleLayers.includes("interactions")}
          isObservationsVisible={visibleLayers.includes("observations")}
          observations={filteredObservations}
          interactions={filteredInteractions}
          personGroups={personGroups}
          selectedGroupTargetLocalIds={selectedGroupTargetLocalIds}
          selectedInteractionTargetLocalIds={selectedInteractionTargetLocalIds}
          selectedInteractionLocalId={selectedInteractionLocalId}
          selectedInteractionSourceLocalId={selectedInteractionSourceLocalId}
          selectedGroupLocalId={selectedGroupLocalId}
          pendingPosition={pendingPosition}
          onMapClick={onMapClick}
          onObservationClick={onObservationClick}
          onInteractionClick={onInteractionClick}
          onGroupClick={onGroupClick}
          selectedObservationLocalId={selectedObservationLocalId}
        />
      </MapProvider>
      <div className="absolute left-3 top-3 z-20">
        <CToggleButtonGroup
          options={visibilityOptions}
          value={visibleLayers}
          multiple
          getLabel={(option) => option.label}
          getValue={(option) => option.value}
          getTooltip={(option) => option.tooltip}
          onMultipleChange={(_, selected) =>
            setVisibleLayers(selected.map(({ value }) => value))
          }
          aria-label="Visibilidade de grupos, intera��es e observa��es"
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
