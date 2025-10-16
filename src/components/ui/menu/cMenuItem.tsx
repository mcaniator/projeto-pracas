"use client";

import { MenuItem } from "@mui/material";
import Link from "next/link";

type CMenuItemType = {
  label: string;
  href?: string;
  onClick?: () => void;
};

const CMenuItem = ({ label, href, onClick }: CMenuItemType) => {
  const defaultMenuItemSx = { px: "8px", py: "4px" };
  const linkMenuItemSx = { px: "0px", py: "0px" };
  return (
    <MenuItem onClick={onClick} sx={href ? linkMenuItemSx : defaultMenuItemSx}>
      {href ?
        <Link href={href} className="px-2 py-1">
          {label}
        </Link>
      : <>{label}</>}
    </MenuItem>
  );
};

export default CMenuItem;
