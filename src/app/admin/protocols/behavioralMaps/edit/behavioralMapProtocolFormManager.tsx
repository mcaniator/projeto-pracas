import FormManager, {
  type FormManagerRef,
} from "@/components/form/formManager/formManager";
import type { fetchFormStructureResponse } from "@/lib/serverFunctions/queries/form";
import type { RefObject } from "react";

const BehavioralMapProtocolFormManager = ({
  value,
  onValueChange,
  formManagerRef,
  onLoadingFormStructureChange,
  onPreviewFormStructureChange,
}: {
  value: { id: number; name: string } | null;
  onValueChange: (value: { id: number; name: string } | null) => void;
  formManagerRef: RefObject<FormManagerRef | null>;
  onLoadingFormStructureChange: (isLoading: boolean) => void;
  onPreviewFormStructureChange: (
    formStructure: fetchFormStructureResponse["formStructure"] | undefined,
  ) => void;
}) => (
  <FormManager
    ref={formManagerRef}
    formUse="TALLY_AND_BEHAVIORAL_MAP"
    title="Formulário (opcional)"
    enablePreview
    value={value?.id ?? null}
    onLoadingFormStructureChange={onLoadingFormStructureChange}
    onPreviewFormStructureChange={onPreviewFormStructureChange}
    onValueChange={(form) =>
      onValueChange(form ? { id: form.id, name: form.name } : null)
    }
  />
);

export default BehavioralMapProtocolFormManager;
