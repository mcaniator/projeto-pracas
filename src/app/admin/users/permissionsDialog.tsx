import CAutocomplete from "@/components/ui/cAutoComplete";
import CDialog from "@/components/ui/dialog/cDialog";
import { FetchUsersResponse } from "@/lib/serverFunctions/queries/user";
import { _updateUserRolesV2 } from "@/lib/serverFunctions/serverActions/userUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
import { Role } from "@prisma/client";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type SystemSection = "PARK" | "FORM" | "ASSESSMENT" | "TALLY" | "USER";
const rows: { title: string; section: SystemSection }[] = [
  {
    title: "Praças",
    section: "PARK",
  },
  {
    title: "Formulários",
    section: "FORM",
  },
  {
    title: "Avaliações físicas",
    section: "ASSESSMENT",
  },
  {
    title: "Contagens",
    section: "TALLY",
  },
  {
    title: "Usuários",
    section: "USER",
  },
];

const warningColors = {
  none: "bg-gray-400 hover:bg-gray-500",
  level0: "bg-white hover:bg-gray-100",
  level1: "bg-yellow-500 hover:bg-yellow-600",
  level2: "bg-orange-600 hover:bg-orange-700",
  level3: "bg-red-500 hover:bg-red-600",
};

const roles = [
  {
    section: "PARK",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "PARK",
    name: "Visualizador",
    value: "PARK_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "PARK",
    name: "Administrador",
    value: "PARK_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "FORM",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "FORM",
    name: "Visualizador",
    value: "FORM_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "FORM",
    name: "Administrador",
    value: "FORM_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "ASSESSMENT",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "ASSESSMENT",
    name: "Visualizador",
    value: "ASSESSMENT_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "ASSESSMENT",
    name: "Editor",
    value: "ASSESSMENT_EDITOR",
    color: warningColors.level2,
  },
  {
    section: "ASSESSMENT",
    name: "Administrador",
    value: "ASSESSMENT_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "TALLY",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "TALLY",
    name: "Visualizador",
    value: "TALLY_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "TALLY",
    name: "Editor",
    value: "TALLY_EDITOR",
    color: warningColors.level2,
  },
  {
    section: "TALLY",
    name: "Administrador",
    value: "TALLY_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "USER",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "USER",
    name: "Visualizador",
    value: "USER_VIEWER",
    color: warningColors.level2,
  },
  {
    section: "USER",
    name: "Administrador",
    value: "USER_MANAGER",
    color: warningColors.level3,
  },
] as {
  section: SystemSection;
  name: string;
  value: Role | null;
  color: string;
}[];
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
