import CIconChip from "@components/ui/cIconChip";
import { QuestionGeometryTypes } from "@prisma/client";
import { IconMapOff } from "@tabler/icons-react";
import { FaMapPin } from "react-icons/fa6";
import { TbLassoPolygon, TbPolygon } from "react-icons/tb";

type QuestionGeometryChipProps = {
  geometryTypes: QuestionGeometryTypes[];
};

const CQuestionGeometryChip = ({
  geometryTypes,
}: QuestionGeometryChipProps) => {
  let icon;
  let tooltip;

  const hasGeometryType = geometryTypes.length > 0;
  const variant = hasGeometryType ? "default" : "disabled";

  if (hasGeometryType) {
    if (geometryTypes.length === 2) {
      icon = <TbLassoPolygon />;
      tooltip = "Permite adição de geometrias do tipo ponto e polígono no mapa";
    } else {
      if (geometryTypes[0] === "POLYGON") {
        icon = <TbPolygon />;
        tooltip = "Permite adição de polígonos no mapa";
      } else {
        icon = <FaMapPin />;
        tooltip = "Permite adição de pontos no mapa";
      }
    }
  } else {
    icon = <IconMapOff />;
    tooltip = "Não permite adição de geometrias ao mapa";
  }

  return <CIconChip icon={icon} tooltip={tooltip} variant={variant} />;
};

export default CQuestionGeometryChip;
