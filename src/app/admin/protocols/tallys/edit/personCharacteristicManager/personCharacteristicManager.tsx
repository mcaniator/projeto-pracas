"use client";

import { useUserContext } from "@/components/context/UserContext";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import { checkIfRolesArrayContainsAny } from "@/lib/auth/rolesUtil";
import { useFetchPersonCharacteristicGroups } from "@/lib/serverFunctions/apiCalls/personCharacteristic";
import { FetchPersonCharacteristicGroupsResponse } from "@/lib/serverFunctions/queries/personCharacteristic";
import { useCallback, useEffect, useState } from "react";

import PersonCharacteristicDeletionDialog from "./personCharacteristicDeletionDialog";
import PersonCharacteristicFormDialog from "./personCharacteristicFormDialog";
import PersonCharacteristicGroupDeletionDialog from "./personCharacteristicGroupDeletionDialog";
import PersonCharacteristicGroupFormDialog from "./personCharacteristicGroupFormDialog";
import PersonCharacteristicGroupsTab from "./personCharacteristicGroupsTab";
import PersonCharacteristicRegistrationTab from "./personCharacteristicRegistrationTab";
import type { PersonCharacteristic, PersonCharacteristicGroup } from "./types";

const managerModes = {
  GROUPS: 0,
  REGISTER: 1,
};

const managerModeOptions = [
  { id: managerModes.GROUPS, label: "Grupos" },
  { id: managerModes.REGISTER, label: "Cadastros" },
];

const PersonCharacteristicManager = ({
  showTitle,
}: {
  showTitle: boolean;
}) => {
  const { user } = useUserContext();
  const canManage = checkIfRolesArrayContainsAny(user?.roles, {
    roles: ["TALLY_MANAGER"],
  });
  const [mode, setMode] = useState(managerModes.GROUPS);
  const [groups, setGroups] = useState<
    NonNullable<FetchPersonCharacteristicGroupsResponse>["personCharacteristicGroups"]
  >([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number>();
  const [selectedGroup, setSelectedGroup] =
    useState<PersonCharacteristicGroup | null>(null);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [isCharacteristicFormOpen, setIsCharacteristicFormOpen] =
    useState(false);
  const [isGroupDeletionOpen, setIsGroupDeletionOpen] = useState(false);
  const [isCharacteristicDeletionOpen, setIsCharacteristicDeletionOpen] =
    useState(false);
  const [groupToEdit, setGroupToEdit] =
    useState<PersonCharacteristicGroup | null>(null);
  const [groupToDelete, setGroupToDelete] =
    useState<PersonCharacteristicGroup | null>(null);
  const [characteristicToEdit, setCharacteristicToEdit] =
    useState<PersonCharacteristic | null>(null);
  const [characteristicToDelete, setCharacteristicToDelete] =
    useState<PersonCharacteristic | null>(null);

  const [fetchSelectedGroup, isLoadingSelectedGroup] =
    useFetchPersonCharacteristicGroups({
      callbacks: {
        onSuccess: (response) => {
          setSelectedGroup(
            response.data?.personCharacteristicGroups[0] ?? null,
          );
        },
        onError: () => setSelectedGroup(null),
      },
    });
  const [fetchGroups, isLoadingGroups] = useFetchPersonCharacteristicGroups({
    callbacks: {
      onSuccess: (response) => {
        setGroups(response.data?.personCharacteristicGroups ?? []);
      },
      onError: () => setGroups([]),
    },
  });

  const reloadGroups = useCallback(() => {
    void fetchGroups({});
  }, [fetchGroups]);

  useEffect(() => {
    reloadGroups();
  }, [reloadGroups]);

  useEffect(() => {
    if (groups.length === 0) {
      setSelectedGroupId(undefined);
      return;
    }
    if (!groups.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId(groups[0]?.id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    if (!selectedGroupId) {
      setSelectedGroup(null);
      return;
    }

    setSelectedGroup(null);
    void fetchSelectedGroup({
      params: { personCharacteristicGroupId: selectedGroupId },
    });
  }, [fetchSelectedGroup, selectedGroupId]);

  const handleGroupsChanged = () => {
    reloadGroups();
    if (selectedGroupId) {
      void fetchSelectedGroup({
        params: { personCharacteristicGroupId: selectedGroupId },
      });
    }
  };

  const openCreateGroup = () => {
    setGroupToEdit(null);
    setIsGroupFormOpen(true);
  };

  const openEditGroup = () => {
    if (!selectedGroup) return;
    setGroupToEdit(selectedGroup);
    setIsGroupFormOpen(true);
  };

  const openCreateCharacteristic = () => {
    if (!selectedGroup) return;
    setCharacteristicToEdit(null);
    setIsCharacteristicFormOpen(true);
  };

  const openEditCharacteristic = (
    characteristic: PersonCharacteristic,
    group: PersonCharacteristicGroup,
  ) => {
    setSelectedGroupId(group.id);
    setCharacteristicToEdit(characteristic);
    setIsCharacteristicFormOpen(true);
  };

  if (isLoadingGroups) {
    return (
      <div className="flex flex-col gap-2 overflow-auto bg-white py-8 text-black sm:px-3">
        <CLinearProgress label="Carregando características..." />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-auto bg-white py-2 text-black sm:px-3">
      {showTitle && (
        <h3 className="text-2xl font-semibold">
          Administração de características
        </h3>
      )}
      <CToggleButtonGroup
        options={managerModeOptions}
        getLabel={(option) => option.label}
        getValue={(option) => option.id}
        value={mode}
        onChange={(_, option) => setMode(option.id)}
      />

      {mode === managerModes.GROUPS ?
        <PersonCharacteristicGroupsTab
          groups={groups}
          selectedGroupId={selectedGroupId}
          selectedGroup={selectedGroup}
          isLoadingSelectedGroup={isLoadingSelectedGroup}
          onSelectedGroupIdChange={setSelectedGroupId}
        />
      : <PersonCharacteristicRegistrationTab
          groups={groups}
          selectedGroupId={selectedGroupId}
          selectedGroup={selectedGroup}
          canManage={canManage}
          onSelectedGroupIdChange={setSelectedGroupId}
          onCreateGroup={openCreateGroup}
          onEditGroup={openEditGroup}
          onCreateCharacteristic={openCreateCharacteristic}
          onEditCharacteristic={openEditCharacteristic}
        />
      }

      <PersonCharacteristicGroupFormDialog
        open={isGroupFormOpen}
        group={groupToEdit}
        onClose={() => setIsGroupFormOpen(false)}
        onSaved={handleGroupsChanged}
        onRequestDelete={() => {
          setGroupToDelete(groupToEdit);
          setIsGroupDeletionOpen(true);
        }}
      />
      <PersonCharacteristicGroupDeletionDialog
        open={isGroupDeletionOpen}
        group={groupToDelete}
        onClose={() => setIsGroupDeletionOpen(false)}
        onDeleted={handleGroupsChanged}
      />
      <PersonCharacteristicFormDialog
        open={isCharacteristicFormOpen}
        group={selectedGroup ?? null}
        characteristic={characteristicToEdit}
        onClose={() => setIsCharacteristicFormOpen(false)}
        onSaved={handleGroupsChanged}
        onRequestDelete={() => {
          setCharacteristicToDelete(characteristicToEdit);
          setIsCharacteristicDeletionOpen(true);
        }}
      />
      <PersonCharacteristicDeletionDialog
        open={isCharacteristicDeletionOpen}
        characteristic={characteristicToDelete}
        onClose={() => setIsCharacteristicDeletionOpen(false)}
        onDeleted={handleGroupsChanged}
      />
    </div>
  );
};

export default PersonCharacteristicManager;
