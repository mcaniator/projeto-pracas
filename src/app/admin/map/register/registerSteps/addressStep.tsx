import CTextField from "../../../../../components/ui/cTextField";

const AddressStep = () => {
  return (
    <div className="flex flex-col gap-1">
      <CTextField
        maxCharacters={255}
        required
        label="Primeira rua"
        onRequiredCheck={(e) => {
          //setRequiredFieldsFilled((prev) => ({ ...prev, firstStreet: e }));
        }}
      />
      <CTextField maxCharacters={255} label="Segunda rua" />
      <CTextField maxCharacters={255} label="Terceira rua" />
      <CTextField maxCharacters={255} label="Quarta rua" />
    </div>
  );
};

export default AddressStep;
