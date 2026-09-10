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
    <div className="flex flex-col">
      <div className="flex justify-between px-2">
        <h3 className="flex items-center">
          {titleIcon}
          <span className="ml-2 text-xl font-semibold sm:text-2xl">
            {title}
          </span>
        </h3>
        {append}
      </div>
      <div className="flex flex-col px-2">
        <h4 className="text-md">{subtitle}</h4>
        {below}
      </div>

      <Divider className="pt-2" />
    </div>
  );
};

export default CAdminHeader;
