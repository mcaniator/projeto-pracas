import {
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";

import { Button } from "../../../components/button";
import { Order, OrderProperty } from "./usersTable";

const SortMenu = ({
  order,
  orderProperty,
  changeOrder,
}: {
  order: Order;
  orderProperty: OrderProperty;
  changeOrder: (order: Order, orderProperty: OrderProperty) => void;
}) => {
  const baseClassname = "rounded-sm px-1 cursor-pointer hover:bg-blue-300";
  return (
    <MenuTrigger>
      <Button variant={"secondary"} aria-label="Menu">
        {order === "none" ?
          <IconArrowsSort />
        : order === "desc" ?
          <IconSortDescending />
        : <IconSortAscending />}
      </Button>
      <Popover className={"rounded-md bg-white p-1"}>
        <Menu>
          <MenuItem
            className={`${order === "desc" ? "bg-blue-500" : ""} ${baseClassname}`}
            onAction={() => changeOrder("desc", orderProperty)}
          >
            Decrescente
          </MenuItem>
          <MenuItem
            className={`${order === "asc" ? "bg-blue-500" : ""} ${baseClassname}`}
            onAction={() => changeOrder("asc", orderProperty)}
          >
            Crescente
          </MenuItem>
          <MenuItem
            className={`${order === "none" ? "bg-blue-500" : ""} ${baseClassname}`}
            onAction={() => changeOrder("none", orderProperty)}
          >
            Desativado
          </MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
};

export default SortMenu;
