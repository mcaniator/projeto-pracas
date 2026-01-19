"use client";

import { MenuItem, MenuItemOwnProps } from "@mui/material";
import Link from "next/link";
import { ReactNode } from "react";

type CMenuItemType = {
  label: ReactNode;
  href?: string;
  sx?: MenuItemOwnProps["sx"];
  onClick?: () => void;
};

const CMenuItem = ({ label, href, sx, onClick }: CMenuItemType) => {
  const defaultMenuItemSx = { px: "8px", py: "4px" };
  const linkMenuItemSx = { px: "0px", py: "0px" };
  return (
    <MenuItem
      onClick={onClick}
      sx={{ ...(href ? linkMenuItemSx : defaultMenuItemSx), ...sx }}
    >
      {href ?
        <Link href={href} className="w-full px-2 py-1">
          {label}
        </Link>
      : <>{label}</>}
    </MenuItem>
  );
};

export default CMenuItem;
