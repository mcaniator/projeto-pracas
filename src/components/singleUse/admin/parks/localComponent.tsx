"use client";

import { Button } from "@/components/ui/button";
import { handleDelete } from "@/serverActions/locationUtil";
import { use, useContext } from "react";

import { ChangedContext } from "../registration/forms/parkForm";

interface FormProps {
  id: number;
  nome: string;
}

const LocalComponent = ({ id, nome }: FormProps) => {
  const { changedContext, setChangedContext } = useContext(ChangedContext);
  return (
    <div key={id} className="mb-2 flex items-center justify-between rounded bg-white p-2">
      <div
      //   onClick={() => handleRedirect(id)}
      >
        <h4 className="text-lg font-semibold">{nome}</h4>
      </div>
      <div>
        <Button
          onClick={() => {
            use(handleDelete(id));
            setChangedContext(changedContext + 1);
          }}
          variant="destructive"
        >
          <span className="-mb-1">Deletar</span>
        </Button>
      </div>
    </div>
  );
};

export { LocalComponent };
