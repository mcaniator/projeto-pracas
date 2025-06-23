import { IconLoader2 } from "@tabler/icons-react";

const LoadingIcon = ({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) => {
  return <IconLoader2 className={`animate-spin ${className}`} size={size} />;
};

export default LoadingIcon;
