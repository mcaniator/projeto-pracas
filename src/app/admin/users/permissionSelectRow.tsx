"use client";

import { Role } from "@prisma/client";
import { IconHelp, IconSelector } from "@tabler/icons-react";
import {
  Button as Bu,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";

import { Button } from "../../../components/button";
import { SystemSection, roles } from "./permissionsModal";

const PermissionSelectRow = ({
  title,
  section,
  userRoles,
  darkBackground,
  parkRoleWarning,
  handleSetUserRoles,
}: {
  title: string;
  section: SystemSection;
  darkBackground: boolean;
  userRoles: { section: SystemSection; role: string | null }[];
  parkRoleWarning: boolean;
  handleSetUserRoles: (section: SystemSection, role: string | null) => void;
}) => {
  return (
    <div
      className={`flex items-center justify-between rounded-sm p-1 ${darkBackground ? "bg-gray-400/70" : "bg-gray-400/50"} ${parkRoleWarning && section === "PARK" ? "outline outline-2 outline-red-500" : ""}`}
    >
      <span>{title}</span>
      <div className="flex items-center justify-end">
        <Select
          selectedKey={
            userRoles.find((userRole) => userRole.section === section)?.role
          }
          onSelectionChange={(e) => {
            const role = e === "NONE" ? null : (e as string);
            handleSetUserRoles(section, role);
          }}
          className={`${
            roles.find(
              (role) =>
                role.section === section &&
                role.value ===
                  (userRoles.find((role) => role.section === section)
                    ?.role as Role),
            )?.color ?? "bg-gray-400/50"
          } appearance-none rounded-lg border-2 border-off-white/80 px-3 py-1 text-lg shadow-md`}
        >
          <Bu>
            <SelectValue>
              {({ defaultChildren, isPlaceholder }) => {
                return isPlaceholder ? <>Nenhuma</> : defaultChildren;
              }}
            </SelectValue>
            <span aria-hidden="true">
              <IconSelector className="inline" />
            </span>
          </Bu>
          <Popover>
            <ListBox>
              {roles
                .filter((role) => role.section === section)
                .map((role, index) => (
                  <ListBoxItem
                    key={index}
                    id={role.value ?? "NONE"}
                    className={`${role.color} cursor-pointer`}
                  >
                    {role.name}
                  </ListBoxItem>
                ))}
            </ListBox>
          </Popover>
        </Select>
        <Button className="px-2 text-black" variant={"ghost"}>
          <IconHelp />
        </Button>
      </div>
    </div>
  );
};

export default PermissionSelectRow;
