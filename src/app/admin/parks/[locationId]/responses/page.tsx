import { searchLocationsById } from "@/serverActions/locationUtil";

import { FormSelector } from "./formSelector";

const Responses = async ({ params }: { params: { locationId: string } }) => {
  const location = (await searchLocationsById(parseInt(params.locationId)))
    .location;

  return !location ?
      <div>Localização não encontrada</div>
    : <>
        <FormSelector location={location} />
      </>;
};
export default Responses;
