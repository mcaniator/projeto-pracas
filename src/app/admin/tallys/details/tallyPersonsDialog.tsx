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
  keepMounted = true,
}: {
  open: boolean;
  tallyProtocolStructure: TallyPersonsStatiticsStructure;
  personObservations: TallyPersonsStatiticsObservation[];
  onClose: () => void;
  keepMounted?: boolean;
}) => (
  <CDialog
    open={open}
    keepMounted={keepMounted}
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
