import { CircularProgress } from "@mui/material";

const CCircularProgress = ({ label }: { label?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-lg">
      <CircularProgress />
      {label}
    </div>
  );
};

export default CCircularProgress;
