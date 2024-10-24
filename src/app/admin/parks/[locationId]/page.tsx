import { Button } from "@/components/button";
import { searchLocationsById } from "@/serverActions/locationUtil";
import Link from "next/link";

const Page = async ({ params }: { params: { locationId: string } }) => {
  const location = await searchLocationsById(parseInt(params.locationId));
  const locationIdNumber = parseInt(params.locationId);

  if (location != null && location != undefined) {
    return (
      <div>
        <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
          <div className="flex basis-3/5 flex-col gap-5 text-white">
            <div
              className={
                "flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"
              }
            >
              <div className="flex">
                <h3 className={"text-2xl font-semibold"}>
                  Informações de {location?.name}
                </h3>
                <Link
                  href={`/admin/parks/${locationIdNumber}/edit`}
                  className="ml-auto"
                >
                  <Button type="button">Editar</Button>
                </Link>
                <Link
                  href={`/admin/parks/${locationIdNumber}/responses?action=responses`}
                  className="ml-auto"
                >
                  <Button>Ver Respostas</Button>
                </Link>
                <Link
                  href={`/admin/parks/${locationIdNumber}/evaluation`}
                  className="ml-auto"
                >
                  <Button>Avaliar</Button>
                </Link>
              </div>
              <span>Nome: {location?.name}</span>
              {location.inactiveNotFound ?
                <span>Inativo ou não encontrado: Verdadeiro</span>
              : location.inactiveNotFound === false ?
                <span>Inativo ou não encontrado: Falso</span>
              : <span>
                  Inativo ou não encontrado:
                  <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.isPark ?
                <span>É Praça: Verdadeiro</span>
              : location.isPark === false ?
                <span>É Praça: Falso</span>
              : <span>
                  É Praça: <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.notes ?
                <span>Notas: {location?.notes}</span>
              : <span>
                  Notas: <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.creationYear ?
                <span>
                  Data de Criação: {location?.creationYear.toString()}
                </span>
              : <span>
                  Data de Criação:
                  <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.lastMaintenanceYear ?
                <span>
                  Data da Última Manutenção:
                  {location?.lastMaintenanceYear.toString()}
                </span>
              : <span>
                  Data da Última Manutenção:
                  <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.overseeingMayor ?
                <span>
                  Prefeito Inaugurador: {location?.overseeingMayor.toString()}
                </span>
              : <span>
                  Prefeito Inaugurador:
                  <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.legislation ?
                <span>Legislação: {location?.legislation}</span>
              : <span>
                  Legislação:
                  <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.usableArea ?
                <span>Área Útil: {location?.usableArea}</span>
              : <span>
                  Área Útil:
                  <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.legalArea ?
                <span>Área Prefeitura: {location?.legalArea}</span>
              : <span>
                  Área Prefeitura:
                  <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              {location.incline ?
                <span>Inclinação: {location?.incline}</span>
              : <span>
                  Inclinação:
                  <span className="text-redwood"> Não preenchido</span>
                </span>
              }
              <Link
                href={`/admin/parks/${locationIdNumber}/tallys`}
                className="ml-auto"
              >
                <Button type="button">Contagens</Button>
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
