"use client";

import type { FormValues } from "@/lib/types/assessments/responseFormTypes";
import { useEffect } from "react";
import { type Control, useWatch } from "react-hook-form";

const PreviewValuesSynchronizer = ({
  control,
  onValuesChange,
}: {
  control: Control<FormValues, unknown, FormValues>;
  onValuesChange: (values: FormValues) => void;
}) => {
  const allValues = useWatch({ control });

  useEffect(() => {
    const normalizedValues = Object.fromEntries(
      Object.entries(allValues).map(([key, value]) => [
        key,
        value === undefined ? null : value,
      ]),
    ) as FormValues;

    onValuesChange(normalizedValues);
  }, [allValues, onValuesChange]);

  return null;
};

export default PreviewValuesSynchronizer;
