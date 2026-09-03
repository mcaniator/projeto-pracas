"use client";

import { IconButton, Menu, MenuItemOwnProps } from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { ReactNode, useState } from "react";

import CMenuItem from "./cMenuItem";

type CMenuOption = {
  label: ReactNode;
  onClick?: () => void;
  sx?: MenuItemOwnProps["sx"];
  href?: string;
  hide?: boolean;
  disabled?: boolean;
};

type CMenuProps = {
  options: CMenuOption[];
  icon?: ReactNode;
};

const CMenu = ({ options, icon }: CMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton onClick={(e) => handleOpenMenu(e)}>
        {icon ? icon : <IconDotsVertical />}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {options
          .filter((opt) => !opt.hide)
          .map((opt, index) => (
            <CMenuItem
              key={index}
              label={opt.label}
              href={opt.href}
              sx={opt.sx}
              disabled={opt.disabled}
              onClick={() => {
                handleCloseMenu();
                opt.onClick?.();
              }}
            ></CMenuItem>
          ))}
      </Menu>
    </>
  );
};

export default CMenu;
