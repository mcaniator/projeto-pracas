import LocationRegisterForm from "@components/locationForm/locationRegisterForm";
import { fetchCities } from "@queries/city";
import { fetchLocationCategories } from "@queries/locationCategory";
import { fetchLocationTypes } from "@queries/locationType";

const RegisterLocation = async () => {
  const cities = await fetchCities();
  const locationCategories = await fetchLocationCategories();
  const locationTypes = await fetchLocationTypes();
  return (
    <div
      className={
        "flex h-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md"
      }
    >
      <h2 className="text-2xl font-semibold">Registrar praça</h2>
      <LocationRegisterForm
        formType="CREATE"
        hasDrawing={false}
        cities={cities}
        locationCategories={locationCategories}
        locationTypes={locationTypes}
      />
    </div>
  );
};

export default RegisterLocation;
