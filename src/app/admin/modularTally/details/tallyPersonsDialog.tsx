"use client";

import TallyPersonsStatitics, {
  type TallyPersonsStatiticsObservation,
  type TallyPersonsStatiticsStructure,
} from "@/components/ui/tallyPersonsStatitics/tallyPersonsStatitics";
import CDialog from "@/components/ui/dialog/cDialog";

const TallyPersonsDialog = ({
  open,
  modularTallyTemplateStructure,
  personObservations,
  onClose,
}: {
  open: boolean;
  modularTallyTemplateStructure: TallyPersonsStatiticsStructure;
  personObservations: TallyPersonsStatiticsObservation[];
  onClose: () => void;
}) => (
  <CDialog
    open={open}
    onClose={onClose}
    title="Estatísticas"
    disableDialogActions
    fullScreen
  >
    <TallyPersonsStatitics
      modularTallyTemplateStructure={modularTallyTemplateStructure}
      personObservations={personObservations}
    />
  </CDialog>
);

export default TallyPersonsDialog;
