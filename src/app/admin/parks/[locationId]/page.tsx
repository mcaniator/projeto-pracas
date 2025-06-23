import { searchLocationsById } from "@/serverActions/locationUtil";
import { IconMapPin } from "@tabler/icons-react";
import Link from "next/link";

import PermissionGuard from "../../../../components/auth/permissionGuard";

const Page = async (props: { params: Promise<{ locationId: string }> }) => {
  const params = await props.params;
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
          <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
            <Link
              className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
              href={`/admin/parks/${locationIdNumber}/edit`}
            >
              Editar
            </Link>
          </PermissionGuard>
          <PermissionGuard requiresAnyRoleGroups={["ASSESSMENT"]}>
            <Link
              className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
              href={`/admin/parks/${locationIdNumber}/responses`}
            >
              Ver Avaliações
            </Link>
          </PermissionGuard>

          <PermissionGuard
            requiresAnyRoles={["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"]}
          >
            <Link
              className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
              href={`/admin/parks/${locationIdNumber}/evaluation`}
            >
              Avaliar
            </Link>
          </PermissionGuard>
          <PermissionGuard requiresAnyRoleGroups={["TALLY"]}>
            <Link
              className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
              href={`/admin/parks/${locationIdNumber}/tallys`}
            >
              Contagens
            </Link>
          </PermissionGuard>
        </div>
      </div>
    );
  } else {
    return <div>Local não encontrado</div>;
  }
};

export default Page;
