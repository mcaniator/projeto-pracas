import FormManager from "@/components/form/formManager/formManager";

const TallyTemplateFormManager = ({
  value,
  onValueChange,
}: {
  value: { id: number; name: string } | null;
  onValueChange: (value: { id: number; name: string } | null) => void;
}) => {
  return (
    <FormManager
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
