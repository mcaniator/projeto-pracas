"use client";

import { Button } from "@/components/button";
import { TallyDataFetchedToTallyList } from "@/components/singleUse/admin/tallys/tallyListPage";
import { Select } from "@/components/ui/select";
import { fetchTallysByLocationId } from "@/serverActions/tallyUtil";
import {
  IconArrowBackUp,
  IconArrowBackUpDouble,
  IconArrowForwardUp,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { ExportPageModes } from "./client";
import { TallyList } from "./tallyList";

type FetchedTallysStatus = "LOADING" | "LOADED" | "ERROR";
const EditPage = ({
  locationId,
  locations,
  handlePageStateChange,
}: {
  locationId: number | undefined;
  locations: { id: number; name: string }[];
  handlePageStateChange: (
    id: number | undefined,
    pageMode: ExportPageModes,
  ) => void;
}) => {
  const [fetchedTallysStatus, setFetchedTallysStatus] =
    useState<FetchedTallysStatus>("LOADING");
  const [fetchedTallys, setFetchedTallys] = useState<
    TallyDataFetchedToTallyList[] | null
  >(null);
  useEffect(() => {
    if (locationId) {
      const fetchTallys = async () => {
        try {
          const tallys = await fetchTallysByLocationId(locationId);
          setFetchedTallys(tallys);
          setFetchedTallysStatus("LOADED");
        } catch (error) {
          setFetchedTallysStatus("ERROR");
        }
      };
      fetchTallys().catch(() => ({ statusCode: 1 }));
    }
  }, [locationId]);
  if (!locationId) {
    return <h4 className="text-xl font-semibold">Erro!</h4>;
  }

  const locationName =
    locations.find((location) => location.id === locationId)?.name || "Erro!";
  return (
    <div className="flex flex-col gap-1 overflow-auto">
      <h4 className="text-xl font-semibold">{`Selecione os parâmetros para ${locationName}`}</h4>
      <label htmlFor="assessment">Avaliação física</label>
      <Select id="assessment">
        <option value="NONE">Nenhuma</option>
      </Select>
      <h5>Contagens</h5>
      {fetchedTallysStatus === "LOADING" && <span>Carregando...</span>}
      {fetchedTallysStatus === "ERROR" && <span>Erro!</span>}
      {fetchedTallysStatus === "LOADED" && fetchedTallys?.length === 0 && (
        <span>Nenhuma contagem encontrada!</span>
      )}
      {fetchedTallys && <TallyList tallys={fetchedTallys} />}
      <div className="my-2 flex flex-row gap-1">
        <div className="flex flex-col gap-1">
          <Button
            onPress={() => {
              handlePageStateChange(undefined, "HOME");
            }}
          >
            <IconArrowBackUpDouble size={24} />
            Voltar às praças
          </Button>

          <Button variant={"constructive"}>
            <IconDeviceFloppy size={24} />
            Salvar
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Button>
            <IconArrowBackUp /> Praça anteterior
          </Button>
          <Button variant={"constructive"}>
            <IconDeviceFloppy /> + <IconArrowBackUp />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <Button>
            Próxima praça <IconArrowForwardUp />
          </Button>
          <Button variant={"constructive"}>
            <IconDeviceFloppy /> + <IconArrowForwardUp />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { EditPage };
