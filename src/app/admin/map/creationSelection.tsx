import { Button } from "@/components/button";
import { Dispatch, SetStateAction } from "react";

import { CreationWithoutDrawingModal } from "./creationWithouDrawingModal";

const CreationSelecion = ({
  setCurrentId,
  setDrawingWindowVisible,
}: {
  setCurrentId: Dispatch<SetStateAction<number>>;
  setDrawingWindowVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleSetCurrentId = (id: number) => {
    setCurrentId(id);
  };
  return (
    <div className="flex flex-col gap-2 text-white">
      <Button variant={"admin"} onPress={() => handleSetCurrentId(-3)}>
        Criar com desenho
      </Button>
      <CreationWithoutDrawingModal
        setCurrentId={setCurrentId}
        setDrawingWindowVisible={setDrawingWindowVisible}
      />
    </div>
  );
};

export { CreationSelecion };
