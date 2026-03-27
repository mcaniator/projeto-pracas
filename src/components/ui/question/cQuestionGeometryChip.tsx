import CIconChip from "@components/ui/cIconChip";
import { QuestionGeometryTypes } from "@prisma/client";
import { IconLassoPolygon, IconMapOff, IconPolygon } from "@tabler/icons-react";
import { FaMapPin } from "react-icons/fa6";

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
      icon = <IconLassoPolygon />;
      tooltip = "Permite adição de geometrias do tipo ponto e polígono no mapa";
    } else {
      if (geometryTypes[0] === "POLYGON") {
        icon = <IconPolygon />;
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
