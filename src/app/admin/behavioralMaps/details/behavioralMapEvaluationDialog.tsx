"use client";

import CButton from "@/components/ui/cButton";
import CChip from "@/components/ui/cChip";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import {
  IconArrowBackUp,
  IconClipboardData,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import type { Dayjs } from "dayjs";

const BehavioralMapEvaluationDialog = ({
  open,
  protocolName,
  username,
  startDate,
  onStartDateChange,
  pendingSave,
  onRevertDraft,
  onDelete,
  onClose,
}: {
  open: boolean;
  protocolName: string;
  username: string;
  startDate: Dayjs;
  onStartDateChange: (value: Dayjs) => void;
  pendingSave: boolean;
  onRevertDraft: () => void;
  onDelete?: () => void;
  onClose: () => void;
}) => (
  <CDialog
    open={open}
    fullScreen
    keepMounted
    title="Avaliação de mapa comportamental"
    disableDialogActions
    onClose={onClose}
  >
    <div className="flex flex-col gap-3 p-2">
      <div className="flex flex-wrap items-center gap-1">
        <CChip
          label={protocolName}
          icon={<IconClipboardData />}
          sx={{ fontSize: 16 }}
          tooltip="Protocolo"
        />
        <CChip
          label={username}
          icon={<IconUser />}
          sx={{ fontSize: 16 }}
          tooltip="Responsável"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <CDateTimePicker
          label="Início"
          value={startDate}
          onChange={(value) => {
            if (value) onStartDateChange(value);
          }}
        />
        <div className="flex items-center gap-2">
          <CButton
            topLeftChipLabel="!"
            enableTopLeftChip={pendingSave}
            tooltip="Reverter alterações locais"
            aria-label="Reverter alterações locais"
            square
            color="warning"
            disabled={!pendingSave}
            onClick={onRevertDraft}
          >
            <IconArrowBackUp />
          </CButton>
          <CButton
            square
            color="error"
            tooltip="Excluir mapa comportamental"
            disabled={!onDelete}
            onClick={onDelete}
          >
            <IconTrash />
          </CButton>
        </div>
      </div>
    </div>
  </CDialog>
);

export default BehavioralMapEvaluationDialog;
