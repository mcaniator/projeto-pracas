import { searchLocationsById } from "@/serverActions/locationUtil";

import { FormSelector } from "./formSelector";

const Responses = async ({
  params,
  searchParams,
}: {
  params: { locationId: string };
  searchParams: { action?: string };
}) => {
  const location = await searchLocationsById(parseInt(params.locationId));

  // TODO: add error handling
  return location == null ?
      <div>Localização não encontrada</div>
    : <>
        <FormSelector location={location} action={searchParams.action} />
        {/* <div>O valor de action em FormSelector é: {searchParams.action}</div> */}
      </>;
};
export default Responses;
