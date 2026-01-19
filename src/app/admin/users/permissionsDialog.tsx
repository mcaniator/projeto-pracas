import RolesHelpDialogTrigger from "@/app/admin/users/rolesHelpDialogTrigger";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchUsersResponse } from "@/lib/serverFunctions/queries/user";
import { _updateUserRolesV2 } from "@/lib/serverFunctions/serverActions/userUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
import { Role } from "@prisma/client";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { SystemSection, roles, rows } from "./consts";

const PermissionsDialog = ({
  open,
  onClose,
  user,
  updateTable,
}: {
  open: boolean;
  onClose: () => void;
  user: FetchUsersResponse["users"][number];
  updateTable: () => void;
}) => {
  const [update, loading] = useServerAction({
    action: _updateUserRolesV2,
    callbacks: {
      onSuccess() {
        updateTable();
        onClose();
      },
      onError(response) {
        if (response.responseInfo.statusCode === 400) {
          setParkRoleWarning(true);
        }
      },
    },
  });
  const [parkRoleWarning, setParkRoleWarning] = useState(false);
  const [userRoles, setUserRoles] =
    useState<{ section: SystemSection; role: Role | null }[]>();
  useEffect(() => {
    setUserRoles([
      {
        section: "ASSESSMENT",
        role:
          user.roles.find(
            (r) =>
              r === "ASSESSMENT_MANAGER" ||
              r === "ASSESSMENT_EDITOR" ||
              r === "ASSESSMENT_VIEWER",
          ) ?? null,
      },
      {
        section: "FORM",
        role:
          user.roles.find((r) => r === "FORM_MANAGER" || r === "FORM_VIEWER") ??
          null,
      },
      {
        section: "PARK",
        role:
          user.roles.find((r) => r === "PARK_MANAGER" || r === "PARK_VIEWER") ??
          null,
      },
      {
        section: "TALLY",
        role:
          user.roles.find(
            (r) =>
              r === "TALLY_MANAGER" ||
              r === "TALLY_EDITOR" ||
              r === "TALLY_VIEWER",
          ) ?? null,
      },
      {
        section: "USER",
        role:
          user.roles.find((r) => r === "USER_MANAGER" || r === "USER_VIEWER") ??
          null,
      },
    ]);
  }, [user]);
  if (!userRoles) return null;
  return (
    <CDialog
      title="Permissões"
      mobileFullScreen
      subtitle={user.username ?? user.email}
      open={open}
      onClose={onClose}
      confirmChildren={<IconCheck />}
      confirmLoading={loading}
      onConfirm={() => {
        void update({
          userId: user.id,
          roles: userRoles.map((ur) => ur.role).filter((r) => r !== null),
        });
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center">
          Permissões
          <RolesHelpDialogTrigger />
        </div>
        {rows.map((row, index) => {
          const options = roles.filter((role) => role.section === row.section);
          const userRoleFiltered = userRoles.find(
            (ur) => ur.section === row.section,
          )!;
          const currentRole = options.find(
            (o) => o.value === userRoleFiltered.role,
          );
          return (
            <CAutocomplete
              key={index}
              label={row.title}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(a, b) => a.value === b.value}
              options={options}
              value={currentRole}
              onChange={(_, v) =>
                setUserRoles((prev) => {
                  const result: {
                    section: SystemSection;
                    role: Role | null;
                  }[] = [];
                  if (prev) {
                    prev.forEach((p) => {
                      if (p.section !== row.section) {
                        result.push(p);
                      } else {
                        result.push({
                          section: p.section,
                          role: v ? v.value : null,
                        });
                      }
                    });
                  }
                  return result;
                })
              }
              error={parkRoleWarning && row.section === "PARK"}
            />
          );
        })}
      </div>
    </CDialog>
  );
};

export default PermissionsDialog;
