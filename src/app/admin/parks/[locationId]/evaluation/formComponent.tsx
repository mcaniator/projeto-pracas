import { IconLink } from "@tabler/icons-react";
import Link from "next/link";

const FormComponent = ({
  locationId,
  formId,
  name,
  version,
}: {
  locationId: number;
  formId: number;
  name: string;
  version: number;
}) => {
  return (
    <Link
      key={formId}
      className="mb-2 flex items-center justify-between rounded bg-white p-2 text-black"
      href={`/admin/parks/${locationId}/evaluation/${formId}`}
    >
      {`${name}, versão ${version}`}
      <IconLink size={24} />
    </Link>
  );
};

export { FormComponent };
