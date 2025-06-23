"use client";

import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DialogTrigger } from "react-aria-components";

import { Button } from "../../../../../components/button";
import { useHelperCard } from "../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../components/context/loadingContext";
import CustomModal from "../../../../../components/modal/customModal";
import { deleteLocation } from "../../../../../serverActions/locationUtil";

const DeleteLocationModal = ({
  locationId,
  locationName,
}: {
  locationId: number;
  locationName: string;
}) => {
  const router = useRouter();
  const { setLoadingOverlayVisible } = useLoadingOverlay();
  const { setHelperCard } = useHelperCard();
  const [locationResponse, setLocationResponse] = useState<{
    statusCode: number;
    formNamesAndVersions: Map<string, Set<number>> | null;
    itemsCount: { assessment: number; tally: number } | null;
  } | null>(null);
  const handleDeleteLocation = async () => {
    setLoadingOverlayVisible(true);
    try {
      const response = await deleteLocation(locationId);
      setLocationResponse(response);
      if (response.statusCode === 404) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Localização não encontrada!</>,
        });
      } else if (response.statusCode === 401) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para excluir avaliações!</>,
        });
      } else if (response.statusCode === 409) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Esta praça possui avaliações e/ou contagens associadas!</>,
        });
      } else if (response.statusCode === 500) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao excluir praça!</>,
        });
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao excluir praça!</>,
      });
    } finally {
      setLoadingOverlayVisible(false);
    }
  };
  useEffect(() => {
    if (locationResponse?.statusCode === 200) {
      router.replace("/admin");
    }
  }, [locationResponse]);
  return (
    <DialogTrigger>
      <Button variant={"destructive"}>
        <IconTrash /> Excluir praça
      </Button>
      <CustomModal
        title="Excluir praça"
        subtitle={locationName}
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={() => {
          void handleDeleteLocation();
        }}
      >
        {locationResponse?.statusCode === 409 && (
          <div className="flex flex-col gap-1">
            <div>
              Esta praça possui {locationResponse.itemsCount?.assessment}{" "}
              avaliações e {locationResponse.itemsCount?.tally} contagens.
            </div>
            <div>
              É necessário excluir os itens associados para excluir esta praça.
            </div>
            <div>Há avaliações com os formulários:</div>
            <div>
              {Array.from(
                locationResponse.formNamesAndVersions?.keys() || [],
              ).map((mapKey, mapIndex) => {
                return (
                  <ul className="list-disc pl-3" key={mapIndex}>
                    {Array.from(
                      locationResponse.formNamesAndVersions?.get(mapKey)!,
                    ).map((setValue) => {
                      return (
                        <li key={mapKey}>
                          {mapKey}, versão {setValue}
                        </li>
                      );
                    })}
                  </ul>
                );
              })}
            </div>
          </div>
        )}
      </CustomModal>
    </DialogTrigger>
  );
};

export default DeleteLocationModal;
