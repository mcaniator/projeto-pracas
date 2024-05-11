"use client";

import { IconLink } from "@tabler/icons-react";
import Link from "next/link";

interface FormProps {
  id: number;
  name: string;
  version: number;
}

const FormComponent = ({ id, name }: FormProps) => {
  return (
    <Link
      key={id}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/forms/${id}`}
    >
      {name}
      <IconLink size={24} />
    </Link>
  );
};

export { FormComponent };
