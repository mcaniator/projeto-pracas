"use client";

// import { Button } from "@/components/ui/button";
// import { handleDelete } from "@/serverActions/locationUtil";
import { IconLink } from "@tabler/icons-react";
import Link from "next/link";

// import { useContext } from "react";

// import { ChangedContext } from "../registration/forms/parkForm";

interface FormProps {
  id: number;
  nome: string;
}

const LocalComponent = ({ id, nome }: FormProps) => {
  // const { changedContext, setChangedContext } = useContext(ChangedContext);
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${id}`}
    >
      {nome}
      <IconLink size={24} />
      {/* <div>
          <Button
            onClick={() => {
              void handleDelete(id);
              setChangedContext(changedContext + 1);
            }}
            variant="destructive"
          >
            <span className="-mb-1">Deletar</span>
          </Button>
        </div> */}
    </Link>
  );
};

export { LocalComponent };
