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
