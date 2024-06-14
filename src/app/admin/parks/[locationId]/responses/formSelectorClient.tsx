"use client";

import { IconLink } from "@tabler/icons-react";
import Link from "next/link";

interface FormProps {
  selectedFormId: number;
  name: string;
  locationId: number;
  action?: string;
  version?: number;
}

const FormSelectorClient = ({
  selectedFormId,
  name,
  locationId,
  action,
  version,
}: FormProps) => {
  if (action === "evaluation") {
    return (
      <Link
        key={selectedFormId}
        className="mb-2 flex items-center justify-between rounded bg-white p-2"
        href={`/admin/parks/${locationId}/${action}/${selectedFormId}`}
      >
        {name}
        <IconLink size={24} />
      </Link>
    );
  }
  if (action === "responses" && version && version > 0) {
    return (
      <Link
        key={selectedFormId}
        className="mb-2 flex items-center justify-between rounded bg-white p-2"
        href={`/admin/parks/${locationId}/${action}/${selectedFormId}`}
      >
        {name} Versão {version}
        <IconLink size={24} />
      </Link>
    );
  }
};

export { FormSelectorClient };
