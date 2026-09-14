import CColorViewer from "@/components/ui/cColorViewer";
import CIconChip from "@/components/ui/cIconChip";
import CDialog from "@/components/ui/dialog/cDialog";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { IconButtonOwnProps } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";

type CPersonCharacteristicLegendProps = {
  title: string;
  characteristics: {
    id: string;
    name: string;
    iconKey: string | null;
    color: string;
  }[];
  sx?: IconButtonOwnProps["sx"];
};

const CPersonCharacteristicLegend = ({
  title,
  characteristics,
  sx,
}: CPersonCharacteristicLegendProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <CIconChip
        icon={<IconInfoCircle />}
        tooltip="Ver legenda"
        clickable
        sx={sx}
        onClick={() => setIsOpen(true)}
      />
      <CDialog
        title="Legenda"
        subtitle={title}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        disableDialogActions
      >
        <div className="flex flex-col gap-2">
          {characteristics.map((characteristic) => (
            <div
              key={characteristic.id}
              className="flex items-center gap-2 rounded border border-gray-300 p-2"
            >
              <CColorViewer color={characteristic.color} />
              <CDynamicIcon iconKey={characteristic.iconKey} />
              <span>{characteristic.name}</span>
            </div>
          ))}
        </div>
      </CDialog>
    </>
  );
};

export default CPersonCharacteristicLegend;
