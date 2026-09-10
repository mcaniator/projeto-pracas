"use client";

import dayjs from "@/lib/dayjs";
import type { FormValues } from "@/lib/types/assessments/responseFormTypes";
import { Chip } from "@mui/material";
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import { type Control, useWatch } from "react-hook-form";

const isFilled = (value: FormValues[string] | undefined) => {
  const normalizedValue = value === undefined ? null : value;

  return (
    normalizedValue != null &&
    normalizedValue !== "" &&
    (!(normalizedValue instanceof Array) || normalizedValue.length > 0) &&
    (!dayjs.isDayjs(normalizedValue) || normalizedValue.isValid())
  );
};

const FilledQuestionsCounter = ({
  control,
  totalQuestions,
}: {
  control: Control<FormValues, unknown, FormValues>;
  totalQuestions: number;
}) => {
  const filledCount = useWatch({
    control,
    compute: (values: FormValues) =>
      Object.values(values).filter(isFilled).length,
  });

  return (
    <Chip
      label={`Campos preenchidos: ${filledCount} / ${totalQuestions}`}
      icon={
        filledCount < totalQuestions ? <IconAlertTriangle /> : <IconCheck />
      }
      color={filledCount < totalQuestions ? "warning" : "success"}
    />
  );
};

export default FilledQuestionsCounter;
