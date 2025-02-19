"use server";

import LocationRegisterForm from "../../../../components/locationForm/locationRegisterForm";
import { fetchCities } from "../../../../serverActions/cityUtil";

const RegisterLocation = async () => {
  const cities = await fetchCities();
  return (
    <div
      className={
        "flex h-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md"
      }
    >
      <h2 className="text-2xl font-semibold">Registrar praça</h2>
      <LocationRegisterForm formType="CREATE" cities={cities} />
    </div>
  );
};

export default RegisterLocation;
