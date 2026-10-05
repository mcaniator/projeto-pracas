import TallyTemplateFormManager from "@/app/admin/protocols/tallys/edit/tallyTemplateFormManager";
import PermissionGuard from "@/components/auth/permissionGuard";
import type { FormManagerRef } from "@/components/form/formManager/formManager";
import CButton from "@/components/ui/cButton";
import CTextField from "@/components/ui/cTextField";
import type { FetchModularTallyTemplateStructureResponse } from "@/lib/serverFunctions/queries/modularTally";
import { Divider } from "@mui/material";
import type { RefObject } from "react";

import TallyTemplateCounters from "./tallyTemplateCounters";
import type { TallyTemplateDraftGroup } from "./tallyTemplateDraft";

const TallyTemplateEditor = ({
  modularTallyTemplate,
  name,
  onNameChange,
  selectedForm,
  onSelectedFormChange,
  formManagerRef,
  groups,
  onChangeGroups,
  onSave,
}: {
  modularTallyTemplate: FetchModularTallyTemplateStructureResponse["modularTallyTemplate"];
  name: string;
  onNameChange: (name: string) => void;
  selectedForm: { id: number; name: string } | null;
  onSelectedFormChange: (form: { id: number; name: string } | null) => void;
  formManagerRef: RefObject<FormManagerRef | null>;
  groups: TallyTemplateDraftGroup[];
  onChangeGroups: (groups: TallyTemplateDraftGroup[]) => void;
  onSave: () => void;
}) => {
  return (
    <div className="ml-1 mr-2 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <CTextField
          label="Nome"
          value={name}
          readOnly={modularTallyTemplate.finalized}
          onChange={(event) => onNameChange(event.target.value)}
        />
        {!modularTallyTemplate.finalized && (
          <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
            <CButton sx={{ mt: "8px" }} onClick={onSave}>
              Salvar
            </CButton>
          </PermissionGuard>
        )}
      </div>
      <Divider />
      <TallyTemplateFormManager
        formManagerRef={formManagerRef}
        value={selectedForm}
        onValueChange={onSelectedFormChange}
      />
      <Divider />
      <TallyTemplateCounters
        groups={groups}
        isFinalized={modularTallyTemplate.finalized}
        onChangeGroups={onChangeGroups}
      />
    </div>
  );
};

export default TallyTemplateEditor;
