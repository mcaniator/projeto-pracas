import { Divider } from "@mui/material";
import { ReactNode } from "react";

const CAdminHeader = ({
  title,
  subtitle,
  titleIcon,
  append,
  below,
}: {
  title: string;
  subtitle?: string;
  titleIcon?: ReactNode;
  append?: ReactNode;
  below?: ReactNode;
}) => {
  return (
    <div className="mb-2 flex flex-col">
      <div className="flex justify-between">
        <h3 className="flex items-center">
          {titleIcon}
          <span className="ml-2 text-2xl font-semibold">{title}</span>
        </h3>
        {append}
      </div>

      <h4 className="text-md">{subtitle}</h4>
      {below}
      <Divider className="pt-2" />
    </div>
  );
};

export default CAdminHeader;
