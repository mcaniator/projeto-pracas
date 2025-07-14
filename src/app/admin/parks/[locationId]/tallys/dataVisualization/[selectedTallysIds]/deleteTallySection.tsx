"use client";

import { Button } from "@/components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import { _deleteTallys, _redirectToTallysList } from "@serverActions/tallyUtil";
import { useState } from "react";
import React from "react";

const DeleteTallySection = ({
  tallyIds,
  locationId,
}: {
  tallyIds: number[];
  locationId: number;
}) => {
  const { setHelperCard } = useHelperCard();
  const [showDeletionConfirmation, setShowDeletionConfirmation] =
    useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleTallyDeletion = async () => {
    setDeleting(true);
    try {
      const response = await _deleteTallys(tallyIds);
      if (response.statusCode === 401) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para excluir contagens!</>,
        });
        setDeleting(false);
        return;
      } else if (response.statusCode === 403) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: (
            <>Você só possui permissão para excluir as próprias contagens!</>
          ),
        });
        setDeleting(false);
        return;
      } else if (response.statusCode === 500) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao excluir contagens!</>,
        });
        setDeleting(false);
        return;
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao excluir contagens!</>,
      });
      setDeleting(false);
      return;
    }
    _redirectToTallysList(locationId);
  };
  return (
    <div className="flex flex-col gap-2">
      <Button
        isDisabled={deleting}
        className="w-32"
        variant={"destructive"}
        onPress={() => setShowDeletionConfirmation(true)}
      >
        {deleting ? "Excluindo..." : "Excluir"}
      </Button>
      {showDeletionConfirmation && (
        <React.Fragment>
          <p>
            Excluir contagens?
            <br />
            Todos os dados de todas as contagens listadas serão perdidos!
          </p>
          <div className="flex flex-row gap-3">
            <Button
              isDisabled={deleting}
              variant={"destructive"}
              onPress={() => {
                handleTallyDeletion().catch(() => ({ statusCode: 1 }));
              }}
            >
              {deleting ? "Excluindo..." : "Confirmar e excluir"}
            </Button>
            <Button
              isDisabled={deleting}
              variant={"secondary"}
              onPress={() => setShowDeletionConfirmation(false)}
            >
              Cancelar
            </Button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export { DeleteTallySection };
