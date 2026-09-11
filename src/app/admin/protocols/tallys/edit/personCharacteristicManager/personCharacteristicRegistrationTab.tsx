import CAutocomplete from "@/components/ui/cAutoComplete";
import CButton from "@/components/ui/cButton";
import { Divider } from "@mui/material";
import { IconPencil, IconPlus } from "@tabler/icons-react";

import PersonCharacteristicGroupsList from "./personCharacteristicGroupsList";
import type {
  PersonCharacteristic,
  PersonCharacteristicGroup,
} from "./types";

const PersonCharacteristicRegistrationTab = ({
  groups,
  selectedGroupId,
  selectedGroup,
  canManage,
  onSelectedGroupIdChange,
  onCreateGroup,
  onEditGroup,
  onCreateCharacteristic,
  onEditCharacteristic,
}: {
  groups: PersonCharacteristicGroup[];
  selectedGroupId: number | undefined;
  selectedGroup: PersonCharacteristicGroup | null;
  canManage: boolean;
  onSelectedGroupIdChange: (groupId: number | undefined) => void;
  onCreateGroup: () => void;
  onEditGroup: () => void;
  onCreateCharacteristic: () => void;
  onEditCharacteristic: (
    characteristic: PersonCharacteristic,
    group: PersonCharacteristicGroup,
  ) => void;
}) => {
  const selectedGroupOption = groups.find(
    (group) => group.id === selectedGroupId,
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <h4>Cadastro de grupos e características</h4>
        <p className="text-red-600">
          Antes de criar uma característica, verifique se ela já não existe para
          evitar duplicidade.
        </p>
        <p>
          Grupos e características são reutilizáveis entre protocolos para manter
          comparações consistentes.
        </p>
        <div className="flex items-center gap-1">
          <CAutocomplete
            className="w-full"
            label="Grupo"
            options={groups}
            value={selectedGroupOption ?? null}
            getOptionLabel={(group) => group.title}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable
            appendIconButton={
              selectedGroup && canManage ? <IconPencil /> : undefined
            }
            appendIconButtonSx={{ color: "primary.main" }}
            onAppendIconButtonClick={onEditGroup}
            onChange={(_, group) => onSelectedGroupIdChange(group?.id)}
          />
          {canManage && (
            <CButton
              square
              sx={{ marginTop: "8px" }}
              tooltip="Criar grupo"
              aria-label="Criar grupo"
              onClick={onCreateGroup}
            >
              <IconPlus />
            </CButton>
          )}
        </div>
        {canManage && (
          <CButton
            disabled={!selectedGroup}
            onClick={onCreateCharacteristic}
          >
            Criar característica
          </CButton>
        )}
      </div>
      <Divider />
      <h4>Características já cadastradas</h4>
      {selectedGroup ?
        <PersonCharacteristicGroupsList
          group={selectedGroup}
          showAddToTemplate={false}
          onEditCharacteristic={canManage ? onEditCharacteristic : undefined}
        />
      : <p className="p-2 text-center text-sm text-gray-600">
          Crie ou selecione um grupo para administrar características.
        </p>}
    </>
  );
};

export default PersonCharacteristicRegistrationTab;
