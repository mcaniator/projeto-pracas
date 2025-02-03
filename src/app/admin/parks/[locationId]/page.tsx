import { searchLocationsById } from "@/serverActions/locationUtil";
import Link from "next/link";

const Page = async ({ params }: { params: { locationId: string } }) => {
  const location = await searchLocationsById(parseInt(params.locationId));
  const locationIdNumber = parseInt(params.locationId);

  if (location != null && location != undefined) {
    return (
      <div className={"flex max-h-full w-full flex-grow gap-5 overflow-auto"}>
        <div className="flex h-full w-full flex-col gap-5 overflow-auto text-white">
          <div
            className={
              "grid h-full grid-cols-1 gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-6 shadow-md md:grid-cols-[1fr_auto]"
            }
          >
            <div className="grid grid-cols-1 gap-3 text-white">
              <h3 className="text-2xl font-semibold">
                Informações de {location?.name}
              </h3>

              <div className="grid grid-cols-1 gap-2">
                <span>Nome: {location?.name}</span>

                {location.inactiveNotFound !== undefined ?
                  <span>
                    Inativo ou não encontrado:{" "}
                    {location.inactiveNotFound ? "Sim" : "Não"}
                  </span>
                : <span>
                    Inativo ou não encontrado:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.isPark !== undefined ?
                  <span>É Praça: {location.isPark ? "Sim" : "Não"}</span>
                : <span>
                    É Praça:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.notes ?
                  <span>Notas: {location.notes}</span>
                : <span>
                    Notas: <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.creationYear ?
                  <span>
                    Data de Criação:{" "}
                    {new Date(location.creationYear).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </span>
                : <span>
                    Data de Criação:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.lastMaintenanceYear ?
                  <span>
                    Data da Última Manutenção:{" "}
                    {new Date(location.lastMaintenanceYear).toLocaleString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      },
                    )}
                  </span>
                : <span>
                    Data da Última Manutenção:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.overseeingMayor ?
                  <span>
                    Prefeito Inaugurador: {location.overseeingMayor.toString()}
                  </span>
                : <span>
                    Prefeito Inaugurador:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.legislation ?
                  <span>Legislação: {location.legislation}</span>
                : <span>
                    Legislação:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.usableArea ?
                  <span>Área Útil: {location.usableArea}</span>
                : <span>
                    Área Útil:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.legalArea ?
                  <span>Área Prefeitura: {location.legalArea}</span>
                : <span>
                    Área Prefeitura:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.incline ?
                  <span>Inclinação: {location.incline}</span>
                : <span>
                    Inclinação:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }
              </div>
            </div>

            <div className="grid grid-cols-1 place-content-start gap-4">
              <Link
                className="flex items-center justify-center rounded-lg bg-true-blue p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
                href={`/admin/parks/${locationIdNumber}/edit`}
              >
                Editar
              </Link>

              <Link
                className="flex items-center justify-center rounded-lg bg-true-blue p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
                href={`/admin/parks/${locationIdNumber}/responses`}
              >
                Ver Avaliações
              </Link>

              <Link
                className="flex items-center justify-center rounded-lg bg-true-blue p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
                href={`/admin/parks/${locationIdNumber}/evaluation`}
              >
                Avaliar
              </Link>

              <Link
                className="flex items-center justify-center rounded-lg bg-true-blue p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
                href={`/admin/parks/${locationIdNumber}/tallys`}
              >
                Contagens
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <div>Local não encontrado</div>;
  }
};

export default Page;
