"use client";

import { Button } from "@/components/button";
import { deleteTallys } from "@/serverActions/tallyUtil";
import { useRouter } from "next/navigation";
import { useState } from "react";
import React from "react";

const DeleteTallySection = ({ tallyIds }: { tallyIds: number[] }) => {
  const router = useRouter();
  const [showDeletionConfirmation, setShowDeletionConfirmation] =
    useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleTallyDeletion = async () => {
    setDeleting(true);
    await deleteTallys(tallyIds);
    router.back();
    router.refresh();
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
