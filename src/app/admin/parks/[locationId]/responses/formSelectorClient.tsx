"use client";

import { IconLink } from "@tabler/icons-react";
import Link from "next/link";

interface FormProps {
  selectedFormId: number;
  name: string;
  locationId: number;
  action?: string;
}

const FormSelectorClient = ({
  selectedFormId,
  name,
  locationId,
  action,
}: FormProps) => {
  if (action === "evaluate")
    return (
      <Link
        key={selectedFormId}
        className="mb-2 flex items-center justify-between rounded bg-white p-2"
        href={`/admin/parks/${locationId}/evaluation/${selectedFormId}`}
      >
        {name}
        <IconLink size={24} />
      </Link>
    );
  if (action === "viewResponses")
    return (
      <Link
        key={selectedFormId}
        className="mb-2 flex items-center justify-between rounded bg-white p-2"
        href={`/admin/parks/${locationId}/responses/${selectedFormId}`}
      >
        {name}
        <IconLink size={24} />
      </Link>
    );
};

export { FormSelectorClient };
