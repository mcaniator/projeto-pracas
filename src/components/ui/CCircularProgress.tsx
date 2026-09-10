import { CircularProgress, type CircularProgressProps } from "@mui/material";
import type { ReactNode } from "react";

const CCircularProgress = ({
  label,
  ...circularProgressProps
}: {
  label?: ReactNode;
} & CircularProgressProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-lg">
      <CircularProgress {...circularProgressProps} />
      {label}
    </div>
  );
};

export default CCircularProgress;
