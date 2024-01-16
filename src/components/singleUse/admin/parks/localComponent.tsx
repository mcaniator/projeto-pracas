"use client";

import { Button } from "@/components/ui/button";
import { handleDelete } from "@/serverActions/locationUtil";
import { useContext } from "react";

import { ChangedContext } from "../registration/forms/parkForm";
import Link from "next/link";

interface FormProps {
  id: number;
  nome: string;
}

const LocalComponent = ({ id, nome }: FormProps) => {
  const { changedContext, setChangedContext } = useContext(ChangedContext);
  return (
    <div key={id} className="mb-2 flex items-center justify-between rounded bg-white p-2">
      <div>
        <Link className="text-lg font-semibold" href={`/admin/parks/${id}`}>{nome}</Link>
      </div>
      <div>
        <Button
          onClick={() => {
            void handleDelete(id);
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
