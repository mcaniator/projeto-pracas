"use server";

import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/zodValidators";
import { BrazilianStates } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { ufToStateMap } from "../lib/types/brazilianFederativeUnits";
import { getPolygonsFromShp } from "./getPolygonsFromShp";
import { addPolygon, addPolygonFromWKT } from "./managePolygons";

const createLocation = async (
  _curStatus: { statusCode: number; message: string },
  formData: FormData,
) => {
  console.log("Iniciando a criação da localização...");

  let location;
  try {
    console.log("Validando os dados do formulário...");
    location = locationSchema.parse({
      name: formData.get("name"),
      firstStreet: formData.get("firstStreet"),
      secondStreet: formData.get("secondStreet"),
      creationYear: formData.get("creationYear"),
      lastMaintenanceYear: formData.get("lastMaintenanceYear"),
      overseeingMayor: formData.get("overseeingMayor"),
      legislation: formData.get("legislation"),
      legalArea: formData.get("legalArea"),
      usableArea: formData.get("usableArea"),
      incline: formData.get("incline"),
      notes: formData.get("notes"),
      isPark: formData.get("isPark") === "true",
      inactiveNotFound: formData.get("inactiveNotFound") === "true",
    });
    console.log("Dados do formulário validados com sucesso:", location);
  } catch (err) {
    console.error("Erro na validação dos dados do formulário:", err);
    return { statusCode: 400, message: "Invalid data" };
  }

  const cityName = formData.get("city");
  const stateName = ufToStateMap.get(formData.get("state") as string);
  const narrowAdministrativeUnitName = formData.get("narrowAdministrativeUnit");
  const intermediateAdministrativeUnitName = formData.get(
    "intermediateAdministrativeUnit",
  );
  const broadAdministrativeUnitName = formData.get("broadAdministrativeUnit");

  console.log("Dados administrativos obtidos:", {
    cityName,
    stateName,
    narrowAdministrativeUnitName,
    intermediateAdministrativeUnitName,
    broadAdministrativeUnitName,
  });

  let result;
  try {
    console.log("Iniciando transação no banco de dados...");
    await prisma.$transaction(async (prisma) => {
      if (cityName) {
        console.log("Criando ou atualizando a cidade...");
        const city = await prisma.city.upsert({
          where: {
            name_state: {
              name: cityName as string,
              state: stateName as BrazilianStates,
            },
          },
          update: {},
          create: {
            name: cityName as string,
            state: stateName as BrazilianStates,
          },
        });
        console.log("Cidade criada/atualizada:", city);

        let narrowAdministrativeUnitId: number | null = null;
        let intermediateAdministrativeUnitId: number | null = null;
        let broadAdministrativeUnitId: number | null = null;

        if (narrowAdministrativeUnitName) {
          console.log(
            "Criando ou atualizando unidade administrativa estreita...",
          );
          const narrowAdministrativeUnit =
            await prisma.narrowAdministrativeUnit.upsert({
              where: {
                cityId_narrowUnitName: {
                  cityId: city.id,
                  name: narrowAdministrativeUnitName as string,
                },
              },
              update: {},
              create: {
                name: narrowAdministrativeUnitName as string,
                city: {
                  connect: { id: city.id },
                },
              },
            });
          narrowAdministrativeUnitId = narrowAdministrativeUnit.id;
          console.log(
            "Unidade administrativa estreita criada/atualizada:",
            narrowAdministrativeUnit,
          );
        }

        if (intermediateAdministrativeUnitName) {
          console.log(
            "Criando ou atualizando unidade administrativa intermediária...",
          );
          const intermediateAdministrativeUnit =
            await prisma.intermediateAdministrativeUnit.upsert({
              where: {
                cityId_intermediateUnitName: {
                  cityId: city.id,
                  name: intermediateAdministrativeUnitName as string,
                },
              },
              update: {},
              create: {
                name: intermediateAdministrativeUnitName as string,
                city: {
                  connect: { id: city.id },
                },
              },
            });
          intermediateAdministrativeUnitId = intermediateAdministrativeUnit.id;
          console.log(
            "Unidade administrativa intermediária criada/atualizada:",
            intermediateAdministrativeUnit,
          );
        }

        if (broadAdministrativeUnitName) {
          console.log("Criando ou atualizando unidade administrativa ampla...");
          const broadAdministrativeUnit =
            await prisma.broadAdministrativeUnit.upsert({
              where: {
                cityId_broadUnitName: {
                  cityId: city.id,
                  name: broadAdministrativeUnitName as string,
                },
              },
              update: {},
              create: {
                name: broadAdministrativeUnitName as string,
                city: {
                  connect: { id: city.id },
                },
              },
            });
          broadAdministrativeUnitId = broadAdministrativeUnit.id;
          console.log(
            "Unidade administrativa ampla criada/atualizada:",
            broadAdministrativeUnit,
          );
        }

        if (
          !narrowAdministrativeUnitId &&
          !intermediateAdministrativeUnitId &&
          !broadAdministrativeUnitId
        ) {
          throw new Error("No administrative unit created or connect");
        }

        console.log("Criando a localização...");
        result = await prisma.location.create({
          data: {
            ...location,
            narrowAdministrativeUnitId,
            intermediateAdministrativeUnitId,
            broadAdministrativeUnitId,
          },
        });
        console.log("Localização criada com sucesso:", result);
      } else {
        console.log("Criando a localização sem cidade...");
        result = await prisma.location.create({ data: location });
        console.log("Localização criada com sucesso:", result);
      }
    });

    // Após a criação da localização, adicionar os polígonos
    try {
      if (formData.get("featuresGeoJson")) {
        console.log("Adicionando polígonos a partir de GeoJSON...");
        const featuresGeoJson = z
          .string()
          .parse(formData.get("featuresGeoJson"));

        await addPolygon(featuresGeoJson, result!.id);
        console.log("Valor de featuresGeoJson:", featuresGeoJson);
        console.log("Polígonos adicionados com sucesso.");
      }

      if (formData.get("file")) {
        console.log("Adicionando polígonos a partir de arquivo shapefile...");
        const wkt = await getPolygonsFromShp(formData.get("file") as File);
        if (wkt) {
          await addPolygonFromWKT(wkt, result!.id);
          console.log(
            "Polígonos adicionados com sucesso a partir do shapefile.",
          );
        }
      }
    } catch (err) {
      console.error("Erro ao adicionar polígonos:", err);
      throw new Error("Error inserting polygon into database");
    }
  } catch (err) {
    console.error("Erro na transação do banco de dados:", err);
    return { statusCode: 400, message: "Database error" };
  }

  console.log("Revalidando a tag 'location'...");
  revalidateTag("location");

  console.log("Localização criada com sucesso. Retornando status 201.");
  return { statusCode: 201, message: "locationCreated" };
};

const editLocationPolygon = async (id: number, featuresGeoJson: string) => {
  await addPolygon(featuresGeoJson, id);

  console.log("Valor de featuresGeoJson:", featuresGeoJson);
  console.log("Polígonos adicionados com sucesso.");
  revalidateTag("location");

  return { errorCode: 0, errorMessage: "" };
};

export { createLocation, editLocationPolygon };
