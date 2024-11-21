import { Button } from "@/components/button";
import { Dispatch, SetStateAction } from "react";

import { CreationWithoutDrawingModal } from "./creationWithouDrawingModal";

const CreationSelecion = ({
  setCurrentId,
}: {
  setCurrentId: Dispatch<SetStateAction<number>>;
}) => {
  const handleSetCurrentId = (id: number) => {
    setCurrentId(id);
  };
  return (
    <div className="flex flex-col gap-2 text-white">
      <Button variant={"admin"} onPress={() => handleSetCurrentId(-3)}>
        Desenhar
      </Button>
      <CreationWithoutDrawingModal setCurrentId={setCurrentId} />
    </div>
  );
};

export { CreationSelecion };
