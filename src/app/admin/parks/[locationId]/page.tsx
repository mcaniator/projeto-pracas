import { searchLocationsById } from "@/serverActions/locationUtil";
import { IconMapPin } from "@tabler/icons-react";
import Link from "next/link";

const Page = async ({ params }: { params: { locationId: string } }) => {
  const location = (await searchLocationsById(parseInt(params.locationId)))
    .location;
  const locationIdNumber = parseInt(params.locationId);
  const city =
    location?.narrowAdministrativeUnit?.city ??
    location?.intermediateAdministrativeUnit?.city ??
    location?.broadAdministrativeUnit?.city;
  if (location != null && location != undefined) {
    return (
      <div
        className={
          "flex h-full w-full flex-col items-center gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-6 text-center shadow-md md:grid-cols-[1fr_auto]"
        }
      >
        <h3 className="text-4xl font-semibold">{location?.name}</h3>
        {city && (
          <p className="flex items-center">
            <IconMapPin className="-mt-1" />
            {city?.name} - {city?.state}
          </p>
        )}

        <div className="flex flex-wrap place-content-center gap-3">
          <Link
            className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
            href={`/admin/parks/${locationIdNumber}/info`}
          >
            Informações
          </Link>
          <Link
            className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
            href={`/admin/parks/${locationIdNumber}/edit`}
          >
            Editar
          </Link>

          <Link
            className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
            href={`/admin/parks/${locationIdNumber}/responses`}
          >
            Ver Avaliações
          </Link>

          <Link
            className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
            href={`/admin/parks/${locationIdNumber}/evaluation`}
          >
            Avaliar
          </Link>

          <Link
            className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
            href={`/admin/parks/${locationIdNumber}/tallys`}
          >
            Contagens
          </Link>
        </div>
      </div>
    );
  } else {
    return <div>Local não encontrado</div>;
  }
};

export default Page;
