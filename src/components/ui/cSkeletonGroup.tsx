import { Skeleton, SkeletonProps } from "@mui/material";

type CSkeletonGroupPros = SkeletonProps & {
  quantity: number;
  gap?: number;
};

const CSkeletonGroup = (props: CSkeletonGroupPros) => {
  const {
    quantity,
    gap = 4,
    variant = "rectangular",
    height = 53,
    ...rest
  } = props;
  return (
    <div className="flex flex-col" style={{ gap: `${gap}px` }}>
      {Array.from({ length: quantity }).map((_, i) => (
        <Skeleton key={i} variant={variant} height={height} {...rest} />
      ))}
    </div>
  );
};

export default CSkeletonGroup;
