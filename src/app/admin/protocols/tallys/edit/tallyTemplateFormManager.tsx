import FormManager, {
  type FormManagerRef,
} from "@/components/form/formManager/formManager";
import type { RefObject } from "react";

const TallyTemplateFormManager = ({
  value,
  onValueChange,
  formManagerRef,
}: {
  value: { id: number; name: string } | null;
  onValueChange: (value: { id: number; name: string } | null) => void;
  formManagerRef: RefObject<FormManagerRef | null>;
}) => {
  return (
    <FormManager
      ref={formManagerRef}
      formUse="TALLY_AND_BEHAVIORAL_MAP"
      title="Formulário (opcional)"
      enablePreview
      value={value?.id ?? null}
      onValueChange={(form) =>
        onValueChange(form ? { id: form.id, name: form.name } : null)
      }
    />
  );
};

export default TallyTemplateFormManager;
