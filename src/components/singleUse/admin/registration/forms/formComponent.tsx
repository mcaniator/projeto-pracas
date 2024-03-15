"use client";

// import { handleDelete } from "@/serverActions/formUtil";
import { IconLink } from "@tabler/icons-react";
import Link from "next/link";

interface FormProps {
  id: number;
  name: string;
}

const FormComponent = ({ id, name }: FormProps) => {
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/forms/${id}`}
    >
      {name}
      {/* <div>
        <h4 className="text-lg font-semibold">{name}</h4>
      </div> */}
      {/* <div>
        <button
          onClick={() => void handleDelete(id)}
          className="text-red-500 hover:text-red-700"
        >
          Deletar
        </button>
      </div> */}
      <IconLink size={24} />
    </Link>
  );
};

export { FormComponent };
