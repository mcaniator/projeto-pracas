"use client";

import { handleDelete } from "@/lib/serverActions/formUtil";
import { use } from "react";

interface FormProps {
  id: number;
  nome: string;
}

const FormComponent = ({ id, nome }: FormProps) => {
  return (
    <div key={id} className="mb-2 flex items-center justify-between rounded bg-white p-2">
      <div>
        <h4 className="text-lg font-semibold">{nome}</h4>
      </div>
      <div>
        <button onClick={() => use(handleDelete(id))} className="text-red-500 hover:text-red-700">
          Deletar
        </button>
      </div>
    </div>
  );
};

export { FormComponent };
