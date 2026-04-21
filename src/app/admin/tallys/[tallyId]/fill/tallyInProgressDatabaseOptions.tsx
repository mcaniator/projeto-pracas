"use client";

import CButton from "@/components/ui/cButton";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { Dayjs } from "dayjs";
import React from "react";

const TallyInProgressDatabaseOptions = ({
  startDate,
  setStartDate,
  onOpenSaveDialog,
}: {
  startDate: Dayjs;
  setStartDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  onOpenSaveDialog: () => void;
}) => {
  return (
    <div className="flex flex-col gap-3 overflow-auto py-1">
      <CDateTimePicker
        label="Inicio da contagem em:"
        value={startDate}
        onChange={(e) => {
          if (!e) return;
          setStartDate(e);
        }}
      />
      <CButton className="w-fit" onClick={onOpenSaveDialog}>
        <IconDeviceFloppy /> Salvar
      </CButton>
    </div>
  );
};

export { TallyInProgressDatabaseOptions };
