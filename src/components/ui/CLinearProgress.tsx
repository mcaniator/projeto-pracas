import { LinearProgress } from "@mui/material";

const CLinearProgress = ({ label }: { label?: string }) => {
  return (
    <div className="flex w-full flex-col justify-center text-lg">
      <LinearProgress />
      {label}
    </div>
  );
};

export default CLinearProgress;
