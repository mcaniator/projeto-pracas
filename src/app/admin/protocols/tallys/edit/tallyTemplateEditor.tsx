import PermissionGuard from "@/components/auth/permissionGuard";
import CButton from "@/components/ui/cButton";
import CTextField from "@/components/ui/cTextField";
import type { FetchModularTallyTemplateStructureResponse } from "@/lib/serverFunctions/queries/modularTally";
import { Divider } from "@mui/material";

import TallyTemplateCounters from "./tallyTemplateCounters";
import type { TallyTemplateDraftGroup } from "./tallyTemplateDraft";

const TallyTemplateEditor = ({
  modularTallyTemplate,
  name,
  onNameChange,
  groups,
  onChangeGroups,
  onSave,
}: {
  modularTallyTemplate: FetchModularTallyTemplateStructureResponse["modularTallyTemplate"];
  name: string;
  onNameChange: (name: string) => void;
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
      <TallyTemplateCounters
        groups={groups}
        isFinalized={modularTallyTemplate.finalized}
        onChangeGroups={onChangeGroups}
      />
    </div>
  );
};

export default TallyTemplateEditor;
