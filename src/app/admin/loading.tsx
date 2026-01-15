import { Skeleton } from "@mui/material";

const Loading = () => {
  return (
    <div className="flex flex-col gap-1 p-2">
      <div>
        <Skeleton variant="circular" width={24} height={24} />
      </div>

      <Skeleton variant="rectangular" height={100} />
      <Skeleton variant="rectangular" height={100} />
    </div>
  );
};

export default Loading;
