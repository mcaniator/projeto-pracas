import { Button } from "@/components/button";
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
                    {location.inactiveNotFound ? "Verdadeiro" : "Falso"}
                  </span>
                : <span>
                    Inativo ou não encontrado:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.isPark !== undefined ?
                  <span>
                    É Praça: {location.isPark ? "Verdadeiro" : "Falso"}
                  </span>
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
                    Data de Criação: {location.creationYear.toString()}
                  </span>
                : <span>
                    Data de Criação:{" "}
                    <span className="text-redwood">Não preenchido</span>
                  </span>
                }

                {location.lastMaintenanceYear ?
                  <span>
                    Data da Última Manutenção:{" "}
                    {location.lastMaintenanceYear.toString()}
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
              <Link href={`/admin/parks/${locationIdNumber}/edit`}>
                <Button type="button" className="w-full">
                  Editar
                </Button>
              </Link>

              <Link
                href={`/admin/parks/${locationIdNumber}/responses?action=responses`}
              >
                <Button className="w-full">Ver Respostas</Button>
              </Link>

              <Link href={`/admin/parks/${locationIdNumber}/evaluation`}>
                <Button className="w-full">Avaliar</Button>
              </Link>

              <Link href={`/admin/parks/${locationIdNumber}/tallys`}>
                <Button className="w-full">Contagens</Button>
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
