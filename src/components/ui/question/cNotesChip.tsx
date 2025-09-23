import CustomModal from "@components/modal/customModal";
import CIconChip from "@components/ui/cIconChip";
import { IconButtonOwnProps } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";

type NotesChipProps = {
  name?: string;
  notes?: string | null;
  sx?: IconButtonOwnProps["sx"];
};

const CNotesChip = ({ notes, name, sx }: NotesChipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltip =
    notes ? "Possui observações. Clique para ver." : "Sem observações";
  const icon = <IconInfoCircle />;
  const variant = notes ? "default" : "disabled";

  const handleChipClick = () => {
    if (!notes) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <CIconChip
        icon={icon}
        tooltip={tooltip}
        onClick={handleChipClick}
        sx={sx}
        variant={variant}
        clickable={!!notes}
      />
      <CustomModal
        title="Observações"
        subtitle={name}
        isOpen={isOpen}
        onOpenChange={(e) => {
          setIsOpen(e);
        }}
        disableModalActions
      >
        <div className="pl-2">{notes}</div>
      </CustomModal>
    </>
  );
};

export default CNotesChip;
