"use client";

import TallyPersonsStatitics, {
  type TallyPersonsStatiticsObservation,
  type TallyPersonsStatiticsStructure,
} from "@/components/ui/tallyPersonsStatitics/tallyPersonsStatitics";
import CDialog from "@/components/ui/dialog/cDialog";

const TallyPersonsDialog = ({
  open,
  tallyProtocolStructure,
  personObservations,
  onClose,
}: {
  open: boolean;
  tallyProtocolStructure: TallyPersonsStatiticsStructure;
  personObservations: TallyPersonsStatiticsObservation[];
  onClose: () => void;
}) => (
  <CDialog
    open={open}
    keepMounted
    onClose={onClose}
    title="Estatísticas"
    disableDialogActions
    fullScreen
  >
    <TallyPersonsStatitics
      tallyProtocolStructure={tallyProtocolStructure}
      personObservations={personObservations}
    />
  </CDialog>
);

export default TallyPersonsDialog;
