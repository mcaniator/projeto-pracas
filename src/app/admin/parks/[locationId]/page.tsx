import { searchLocationsById } from "@/serverActions/locationUtil";
import { redirect } from "next/navigation";

import { Client } from "./client";

const Page = async ({ params }: { params: { locationId: string } }) => {
  const locationIdNumber = parseInt(params.locationId);
  const location = await searchLocationsById(locationIdNumber);
  if (location === null || location === undefined) redirect("/error");

  return <Client location={location} />;
};

export default Page;
