import { searchLocationsById } from "@serverActions/locationUtil";

import { FormSelector } from "./formSelector";

const Responses = async (props: {
  params: Promise<{ locationId: string }>;
}) => {
  const params = await props.params;
  const location = (await searchLocationsById(parseInt(params.locationId)))
    .location;

  return !location ?
      <div>Localização não encontrada</div>
    : <>
        <FormSelector location={location} />
      </>;
};
export default Responses;
