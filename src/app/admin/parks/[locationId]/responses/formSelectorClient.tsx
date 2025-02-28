"use client";

import { IconLink } from "@tabler/icons-react";
import Link from "next/link";

interface FormProps {
  selectedFormId: number;
  name: string;
  locationId: number;
  version?: number;
}

const FormSelectorClient = ({
  selectedFormId,
  name,
  locationId,
  version,
}: FormProps) => {
  return (
    <Link
      key={selectedFormId}
      className="mb-2 flex items-center justify-between rounded bg-white p-2"
      href={`/admin/parks/${locationId}/responses/${selectedFormId}`}
    >
      {name} Versão {version}
      <IconLink size={24} />
    </Link>
  );
};

export { FormSelectorClient };
