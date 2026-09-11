import CTextField from "@/components/ui/cTextField";
import type { FetchModularTallyTemplateStructureResponse } from "@/lib/serverFunctions/queries/modularTally";

type ModularTallyTemplate = NonNullable<
  NonNullable<FetchModularTallyTemplateStructureResponse>["modularTallyTemplate"]
>;

const TallyTemplateEditor = ({
  modularTallyTemplate,
  name,
  onNameChange,
}: {
  modularTallyTemplate: ModularTallyTemplate;
  name: string;
  onNameChange: (name: string) => void;
}) => {
  return (
    <div className="ml-1 mr-2 flex flex-col gap-3">
      <CTextField
        label="Nome"
        value={name}
        readOnly={modularTallyTemplate.finalized}
        onChange={(event) => onNameChange(event.target.value)}
      />
      {modularTallyTemplate.tallyTemplateGroups.length === 0 ?
        <div className="rounded border border-gray-300 p-4 text-sm text-gray-600">
          Nenhum grupo foi adicionado ao protocolo.
        </div>
      : <div className="rounded border border-gray-300 p-4 text-sm text-gray-600">
          {modularTallyTemplate.tallyTemplateGroups.length} grupo(s) já fazem
          parte deste protocolo.
        </div>
      }
    </div>
  );
};

export default TallyTemplateEditor;
