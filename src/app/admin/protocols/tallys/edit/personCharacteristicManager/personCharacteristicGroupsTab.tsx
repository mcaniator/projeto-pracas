import CLinearProgress from "@/components/ui/CLinearProgress";
import CAutocomplete from "@/components/ui/cAutoComplete";

import PersonCharacteristicGroupsList from "./personCharacteristicGroupsList";
import type { PersonCharacteristicGroup } from "./types";

const PersonCharacteristicGroupsTab = ({
  groups,
  selectedGroupId,
  selectedGroup,
  isLoadingSelectedGroup,
  onSelectedGroupIdChange,
}: {
  groups: PersonCharacteristicGroup[];
  selectedGroupId: number | undefined;
  selectedGroup: PersonCharacteristicGroup | null;
  isLoadingSelectedGroup: boolean;
  onSelectedGroupIdChange: (groupId: number | undefined) => void;
}) => {
  const selectedGroupOption = groups.find(
    (group) => group.id === selectedGroupId,
  );

  return (
    <>
      <CAutocomplete
        label="Grupo"
        options={groups}
        value={selectedGroupOption ?? null}
        getOptionLabel={(group) => group.title}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        disableClearable
        onChange={(_, group) => onSelectedGroupIdChange(group?.id)}
      />
      {isLoadingSelectedGroup ?
        <CLinearProgress label="Carregando grupo..." />
      : <PersonCharacteristicGroupsList group={selectedGroup} showAddToTemplate />}
    </>
  );
};

export default PersonCharacteristicGroupsTab;
