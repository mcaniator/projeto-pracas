import CIconChip from "@components/ui/cIconChip";
import { QuestionGeometryTypes } from "@prisma/client";
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

  if (geometryTypes.length > 0) {
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
    return <></>;
  }

  return <CIconChip icon={icon} tooltip={tooltip} />;
};

export default CQuestionGeometryChip;
