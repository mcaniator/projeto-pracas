"use server";

import { IconArrowBackUp } from "@tabler/icons-react";
import Link from "next/link";

import { searchLocationsById } from "../../../../../serverActions/locationUtil";

const ParkInfo = async ({ params }: { params: { locationId: string } }) => {
  const location = await searchLocationsById(parseInt(params.locationId));
  const city =
    location?.broadAdministrativeUnit?.city ??
    location?.intermediateAdministrativeUnit?.city ??
    location?.narrowAdministrativeUnit?.city;
  if (!location) {
    return (
      <div
        className={
          "flex h-full flex-col gap-5 overflow-auto rounded-3xl bg-gray-300/30 p-6 text-white shadow-md md:grid-cols-[1fr_auto]"
        }
      >
        <h2 className="text-2xl text-red-500">Localização não encontrada</h2>
      </div>
    );
  }
  return (
    <div
      className={
        "flex h-full flex-col gap-2 overflow-auto rounded-3xl bg-gray-300/30 p-6 text-white shadow-md md:grid-cols-[1fr_auto]"
      }
    >
      <h2 className="text-2xl">{location?.name}</h2>
      <div className="flex flex-col gap-2 rounded-md bg-gray-500/30 p-2 shadow-inner">
        {<span>{`Cidade: ${city?.name}`}</span>}
        {<span>{`Estado: ${city?.state}`}</span>}
        {location.broadAdministrativeUnit ?
          <span>
            Região administrativa ampla: {location.broadAdministrativeUnit.name}
          </span>
        : <span>
            Região administrativa ampla:{" "}
            <span className="text-red-500">Não preenchido</span>{" "}
          </span>
        }
        {location.intermediateAdministrativeUnit ?
          <span>
            Região administrativa intermediária:{" "}
            {location.intermediateAdministrativeUnit.name}
          </span>
        : <span>
            Região administrativa intermediária:{" "}
            <span className="text-red-500">Não preenchido</span>{" "}
          </span>
        }
        {location.narrowAdministrativeUnit ?
          <span>
            Região administrativa estreita:{" "}
            {location.narrowAdministrativeUnit.name}
          </span>
        : <span>
            Região administrativa estreita:{" "}
            <span className="text-red-500">Não preenchido</span>{" "}
          </span>
        }
        <span>Primeira rua: {location.firstStreet}</span>
        <span>Segunda rua: {location.secondStreet}</span>
        {location.inactiveNotFound !== undefined ?
          <span>
            Inativo ou não encontrado:{" "}
            {location.inactiveNotFound ? "Sim" : "Não"}
          </span>
        : <span>
            Inativo ou não encontrado:{" "}
            <span className="text-red-500">Não preenchido</span>
          </span>
        }

        {location.isPark !== undefined ?
          <span>É Praça: {location.isPark ? "Sim" : "Não"}</span>
        : <span>
            É Praça: <span className="text-red-500">Não preenchido</span>
          </span>
        }

        {location.notes ?
          <span>Observações: {location.notes}</span>
        : <span>
            Observações: <span className="text-red-500">Não preenchido</span>
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
            <span className="text-red-500">Não preenchido</span>
          </span>
        }

        {location.lastMaintenanceYear ?
          <span>
            Data da Última Manutenção:{" "}
            {new Date(location.lastMaintenanceYear).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          </span>
        : <span>
            Data da Última Manutenção:{" "}
            <span className="text-red-500">Não preenchido</span>
          </span>
        }

        {location.overseeingMayor ?
          <span>
            Prefeito Inaugurador: {location.overseeingMayor.toString()}
          </span>
        : <span>
            Prefeito Inaugurador:{" "}
            <span className="text-red-500">Não preenchido</span>
          </span>
        }

        {location.legislation ?
          <span>Legislação: {location.legislation}</span>
        : <span>
            Legislação: <span className="text-red-500">Não preenchido</span>
          </span>
        }

        {location.usableArea ?
          <span>Área Útil: {location.usableArea}</span>
        : <span>
            Área Útil: <span className="text-red-500">Não preenchido</span>
          </span>
        }

        {location.legalArea ?
          <span>Área Prefeitura: {location.legalArea}</span>
        : <span>
            Área Prefeitura:{" "}
            <span className="text-red-500">Não preenchido</span>
          </span>
        }

        {location.incline ?
          <span>Inclinação: {location.incline}</span>
        : <span>
            Inclinação: <span className="text-red-500">Não preenchido</span>
          </span>
        }
      </div>
      <Link
        className="flex items-center justify-center rounded-lg bg-true-blue p-2 text-xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
        href={`/admin/parks/${location.id}`}
      >
        <IconArrowBackUp />
      </Link>
    </div>
  );
};

export default ParkInfo;
