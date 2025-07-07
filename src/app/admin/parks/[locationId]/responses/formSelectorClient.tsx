"use client";

import { FormListItem } from "@customTypes/forms/formList";
import { IconLink } from "@tabler/icons-react";
import Link from "next/link";

const FormSelectorClient = ({
  selectedFormId,
  name,
  locationId,
  version,
}: FormListItem) => {
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
