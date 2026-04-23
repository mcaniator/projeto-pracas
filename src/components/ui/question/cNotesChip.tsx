import CIconChip from "@components/ui/cIconChip";
import { IconButtonOwnProps } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";

import CDialog from "../dialog/cDialog";

type NotesChipProps = {
  name?: string;
  notes?: string | null;
  sx?: IconButtonOwnProps["sx"];
};

const CNotesChip = ({ notes, name, sx }: NotesChipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!notes) {
    return;
  }
  const tooltip = "Possui observações. Clique para ver.";
  const icon = <IconInfoCircle />;

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
        clickable={!!notes}
      />
      <CDialog
        title="Observações"
        subtitle={name}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        disableDialogActions
      >
        <div className="p-2">{notes}</div>
      </CDialog>
    </>
  );
};

export default CNotesChip;
