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
}: {
  modularTallyTemplate: FetchModularTallyTemplateStructureResponse["modularTallyTemplate"];
  name: string;
  onNameChange: (name: string) => void;
  groups: TallyTemplateDraftGroup[];
  onChangeGroups: (groups: TallyTemplateDraftGroup[]) => void;
}) => {
  return (
    <div className="ml-1 mr-2 flex flex-col gap-3">
      <CTextField
        label="Nome"
        value={name}
        readOnly={modularTallyTemplate.finalized}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <Divider />
      <TallyTemplateCounters groups={groups} onChangeGroups={onChangeGroups} />
    </div>
  );
};

export default TallyTemplateEditor;
