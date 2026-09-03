import { Divider, Skeleton } from "@mui/material";

const Loading = () => {
  return (
    <div className="flex h-full flex-col gap-1 p-2">
      <div className="flex items-center gap-1 p-2">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton
          variant="rectangular"
          sx={{ borderRadius: "12px" }}
          width={200}
          height={24}
        />
      </div>
      <Divider />
      <Skeleton
        variant="rectangular"
        sx={{
          height: "100%",
        }}
      />
    </div>
  );
};

export default Loading;
