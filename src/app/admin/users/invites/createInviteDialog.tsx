import RolesHelpDialogTrigger from "@/app/admin/users/rolesHelpDialogTrigger";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { getRoleForGroup } from "@/lib/auth/rolesUtil";
import { FetchInvitesResponse } from "@/lib/serverFunctions/queries/invite";
import { _createInviteV2 } from "@/lib/serverFunctions/serverActions/inviteUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
import { Role } from "@prisma/client";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { SystemSection, roles, rows } from "../consts";

const CreateInviteDialog = ({
  open,
  invite,
  onClose,
  updateTable,
}: {
  open: boolean;
  invite?: FetchInvitesResponse["invites"][number];
  onClose: () => void;
  updateTable: () => void;
}) => {
  const [action, loading] = useServerAction({
    action: _createInviteV2,
    callbacks: {
      onSuccess() {
        updateTable();
        reset();
        onClose();
      },
      onError(response) {
        if (response.responseInfo.statusCode === 400) {
          setParkRoleWarning(true);
        }
      },
    },
  });
  const [email, setEmail] = useState(invite?.email ?? "");
  const [parkRoleWarning, setParkRoleWarning] = useState(false);
  const [userRoles, setUserRoles] = useState<
    { section: SystemSection; role: Role | null }[]
  >(
    invite ?
      [
        {
          section: "PARK",
          role: getRoleForGroup(invite.roles, "PARK"),
        },
        {
          section: "FORM",
          role: getRoleForGroup(invite.roles, "FORM"),
        },
        {
          section: "TALLY",
          role: getRoleForGroup(invite.roles, "TALLY"),
        },
        {
          section: "ASSESSMENT",
          role: getRoleForGroup(invite.roles, "ASSESSMENT"),
        },
        {
          section: "USER",
          role: getRoleForGroup(invite.roles, "USER"),
        },
      ]
    : [
        {
          section: "PARK",
          role: null,
        },
        {
          section: "FORM",
          role: null,
        },
        {
          section: "TALLY",
          role: null,
        },
        {
          section: "ASSESSMENT",
          role: null,
        },
        {
          section: "USER",
          role: null,
        },
      ],
  );

  const reset = () => {
    setEmail("");
    setUserRoles([
      {
        section: "PARK",
        role: null,
      },
      {
        section: "FORM",
        role: null,
      },
      {
        section: "TALLY",
        role: null,
      },
      {
        section: "ASSESSMENT",
        role: null,
      },
      {
        section: "USER",
        role: null,
      },
    ]);
  };

  useEffect(() => {
    setEmail(invite?.email ?? "");
    setUserRoles([
      {
        section: "PARK",
        role: getRoleForGroup(invite?.roles, "PARK"),
      },
      {
        section: "FORM",
        role: getRoleForGroup(invite?.roles, "FORM"),
      },
      {
        section: "TALLY",
        role: getRoleForGroup(invite?.roles, "TALLY"),
      },
      {
        section: "ASSESSMENT",
        role: getRoleForGroup(invite?.roles, "ASSESSMENT"),
      },
      {
        section: "USER",
        role: getRoleForGroup(invite?.roles, "USER"),
      },
    ]);
  }, [invite]);
  return (
    <CDialog
      mobileFullScreen
      open={open}
      onClose={onClose}
      title="Criar convite"
      onConfirm={() => {
        void action({
          email,
          roles: userRoles.map((ur) => ur.role).filter((r) => r !== null),
          inviteId: invite?.id,
        });
      }}
      confirmChildren={<IconCheck />}
      confirmLoading={loading}
    >
      <div className="flex flex-col gap-1">
        <CTextField
          required
          label="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          value={email}
        />
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

export default CreateInviteDialog;
