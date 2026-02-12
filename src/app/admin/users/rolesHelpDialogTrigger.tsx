import CDialogTrigger from "@/components/ui/dialog/cDialogTrigger";
import { Divider } from "@mui/material";
import { IconHelp } from "@tabler/icons-react";

const descriptions = [
  {
    section: "Praças",
    roles: {
      Visualizador:
        "Pode visualizar praças. Permissão obrigatória caso o usuário tenha outras permissões",
      Administrador: "Além de visualizar, pode criar e editar praças",
    },
  },
  {
    section: "Formulários",
    roles: {
      Visualizador: "Pode visualizar formulários.",
      Administrador: "Pode criar formularios, editá-los e excluí-los.",
    },
  },
  {
    section: "Avaliações físicas",
    roles: {
      Visualizador: "Pode visualizar avaliações fisicas.",
      Editor: "Pode criar avaliações fisicas, editá-los e excluí-los.",
      Administrador:
        "Pode criar avaliações fisicas, editá-las e excluí-las, além de editar e excluir qualquer avaliação física que não seja dele.",
    },
  },
  {
    section: "Contagens",
    roles: {
      Visualizador: "Pode visualizar contagens.",
      Editor: "Pode criar contagens, editá-las e excluí-las.",
      Administrador:
        "Pode criar contagens, editá-las e excluí-las, além de editar e excluir qualquer contagem que não seja dele.",
    },
  },
  {
    section: "Usuários",
    roles: {
      Visualizador: "Pode visualizar tela deusuários.",
      Administrador: "Pode criar usuários, editá-los e excluí-los.",
    },
  },
];

const RolesHelpDialogTrigger = () => {
  return (
    <CDialogTrigger
      triggerchildren={<IconHelp />}
      triggerProps={{
        variant: "text",
      }}
      title="Permissões"
      subtitle="A permissão de um usuário determina o que ele pode fazer na
          plataforma."
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          {descriptions.map((description, index, arr) => (
            <div key={description.section}>
              <h5 className="text-lg">{description.section}</h5>
              <ul className="list-disc pl-4">
                {Object.entries(description.roles).map(
                  ([role, description]) => (
                    <li key={role}>
                      {role}: {description}
                    </li>
                  ),
                )}
              </ul>
              {index < arr.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      </div>
    </CDialogTrigger>
  );
};

export default RolesHelpDialogTrigger;
