import TallyProtocolFormManager from "@/app/admin/protocols/tallys/edit/tallyProtocolFormManager";
import PermissionGuard from "@/components/auth/permissionGuard";
import type { FormManagerRef } from "@/components/form/formManager/formManager";
import CButton from "@/components/ui/cButton";
import CTextField from "@/components/ui/cTextField";
import type { FetchTallyProtocolStructureResponse } from "@/lib/serverFunctions/queries/tally";
import { Divider } from "@mui/material";
import type { RefObject } from "react";

import TallyProtocolCounters from "./tallyProtocolCounters";
import type { TallyProtocolDraftGroup } from "./tallyProtocolDraft";

const TallyProtocolEditor = ({
  tallyProtocol,
  name,
  onNameChange,
  selectedForm,
  onSelectedFormChange,
  formManagerRef,
  groups,
  onChangeGroups,
  onSave,
}: {
  tallyProtocol: FetchTallyProtocolStructureResponse["tallyProtocol"];
  name: string;
  onNameChange: (name: string) => void;
  selectedForm: { id: number; name: string } | null;
  onSelectedFormChange: (form: { id: number; name: string } | null) => void;
  formManagerRef: RefObject<FormManagerRef | null>;
  groups: TallyProtocolDraftGroup[];
  onChangeGroups: (groups: TallyProtocolDraftGroup[]) => void;
  onSave: () => void;
}) => {
  return (
    <div className="ml-1 mr-2 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <CTextField
          label="Nome"
          value={name}
          readOnly={tallyProtocol.finalized}
          onChange={(event) => onNameChange(event.target.value)}
        />
        {!tallyProtocol.finalized && (
          <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
            <CButton sx={{ mt: "8px" }} onClick={onSave}>
              Salvar
            </CButton>
          </PermissionGuard>
        )}
      </div>
      <Divider />
      <TallyProtocolFormManager
        formManagerRef={formManagerRef}
        value={selectedForm}
        onValueChange={onSelectedFormChange}
      />
      <Divider />
      <TallyProtocolCounters
        groups={groups}
        isFinalized={tallyProtocol.finalized}
        onChangeGroups={onChangeGroups}
      />
    </div>
  );
};

export default TallyProtocolEditor;
