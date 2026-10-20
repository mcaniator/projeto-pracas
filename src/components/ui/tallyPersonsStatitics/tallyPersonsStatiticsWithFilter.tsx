"use client";

import { useEffect, useMemo, useState } from "react";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import type { GetModularTallySubmissionDataResult } from "@/lib/serverFunctions/queries/modularTally";
import { IconFilter } from "@tabler/icons-react";

import { ModularTallyResultFilterBox } from "./modularTallyResultFilters";
import TallyPersonsStatitics from "./tallyPersonsStatitics";

type TallyPersonsStatiticsWithFilterProps = Pick<
  GetModularTallySubmissionDataResult,
  "modularTallyTemplateStructure" | "personObservations"
>;

const TallyPersonsStatiticsWithFilter = ({
  modularTallyTemplateStructure,
  personObservations,
}: TallyPersonsStatiticsWithFilterProps) => {
  const templateGroups = modularTallyTemplateStructure.tallyTemplateGroups;
  const [activeCharacteristicIds, setActiveCharacteristicIds] = useState(
    () =>
      new Set(
        templateGroups.flatMap((group) =>
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

  useEffect(() => {
    setActiveCharacteristicIds(
      new Set(
        templateGroups.flatMap((group) =>
          group.personCharacteristicGroup.isTagGroup ?
            []
          : group.characteristics.map(
              ({ personCharacteristic }) => personCharacteristic.id,
            ),
        ),
      ),
    );
    setNoTagFilterGroupIds(new Set());
  }, [templateGroups]);

  const handleCharacteristicActiveChange = (
    personCharacteristicId: number,
    isActive: boolean,
  ) => {
    setActiveCharacteristicIds((current) => {
      const next = new Set(current);
      if (isActive) {
        next.add(personCharacteristicId);
      } else {
        next.delete(personCharacteristicId);
      }
      return next;
    });
  };

  const handleNoTagFilterChange = (
    groupId: number,
    noTagFilterIsActive: boolean,
  ) => {
    setNoTagFilterGroupIds((current) => {
      const next = new Set(current);
      if (noTagFilterIsActive) {
        next.add(groupId);
      } else {
        next.delete(groupId);
      }
      return next;
    });
  };

  const filteredPersonObservations = useMemo(() => {
    const tagGroups = templateGroups.filter(
      (group) => group.personCharacteristicGroup.isTagGroup,
    );
    const tagCharacteristicIds = new Set(
      tagGroups.flatMap((group) =>
        group.characteristics.map(
          ({ personCharacteristic }) => personCharacteristic.id,
        ),
      ),
    );

    return personObservations.filter((observation) => {
      const observationCharacteristicIds = new Set(
        observation.characteristics.map(
          ({ personCharacteristicId }) => personCharacteristicId,
        ),
      );

      // Keep observations only when every non-tag characteristic is active.
      const hasOnlyActiveCharacteristics = observation.characteristics.every(
        ({ personCharacteristicId }) =>
          tagCharacteristicIds.has(personCharacteristicId) ||
          activeCharacteristicIds.has(personCharacteristicId),
      );
      if (!hasOnlyActiveCharacteristics) return false;

      return tagGroups.every((group) => {
        const groupCharacteristicIds = group.characteristics.map(
          ({ personCharacteristic }) => personCharacteristic.id,
        );
        // When "No tags" is active, keep only observations with no characteristic from this group.
        if (noTagFilterGroupIds.has(group.id)) {
          return !groupCharacteristicIds.some((id) =>
            observationCharacteristicIds.has(id),
          );
        }

        // Otherwise, require every selected tag while allowing additional tags from the same group.
        const selectedCharacteristicIds = groupCharacteristicIds.filter((id) =>
          activeCharacteristicIds.has(id),
        );
        return selectedCharacteristicIds.every((id) =>
          observationCharacteristicIds.has(id),
        );
      });
    });
  }, [
    activeCharacteristicIds,
    noTagFilterGroupIds,
    personObservations,
    templateGroups,
  ]);

  const appliedFiltersCount = templateGroups.reduce((count, group) => {
    if (group.personCharacteristicGroup.isTagGroup) {
      if (noTagFilterGroupIds.has(group.id)) return count + 1;

      return (
        count +
        group.characteristics.filter(({ personCharacteristic }) =>
          activeCharacteristicIds.has(personCharacteristic.id),
        ).length
      );
    }

    const groupIds = group.characteristics.map(
      ({ personCharacteristic }) => personCharacteristic.id,
    );
    return (
      count + groupIds.filter((id) => !activeCharacteristicIds.has(id)).length
    );
  }, 0);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3">
      <div className="flex shrink-0 justify-end lg:hidden">
        <CButton
          square
          enableTopLeftChip
          topLeftChipLabel={appliedFiltersCount}
          onClick={() => setIsFiltersDialogOpen(true)}
        >
          <IconFilter />
        </CButton>
      </div>
      <CDialog
        open={isFiltersDialogOpen}
        onClose={() => setIsFiltersDialogOpen(false)}
        title="Filtros de pessoas"
        fullScreen
        disableDialogActions
      >
        <ModularTallyResultFilterBox
          modularTallyTemplateStructure={modularTallyTemplateStructure}
          activeCharacteristicIds={activeCharacteristicIds}
          noTagFilterGroupIds={noTagFilterGroupIds}
          onCharacteristicActiveChange={handleCharacteristicActiveChange}
          onNoTagFilterChange={handleNoTagFilterChange}
        />
      </CDialog>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row">
        <main className="min-h-0 min-w-0 flex-1 overflow-auto">
          <TallyPersonsStatitics
            modularTallyTemplateStructure={modularTallyTemplateStructure}
            personObservations={filteredPersonObservations}
          />
        </main>
        <aside className="hidden min-h-0 w-80 shrink-0 lg:block">
          <div className="h-full overflow-auto">
            <ModularTallyResultFilterBox
              modularTallyTemplateStructure={modularTallyTemplateStructure}
              activeCharacteristicIds={activeCharacteristicIds}
              noTagFilterGroupIds={noTagFilterGroupIds}
              onCharacteristicActiveChange={handleCharacteristicActiveChange}
              onNoTagFilterChange={handleNoTagFilterChange}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TallyPersonsStatiticsWithFilter;
