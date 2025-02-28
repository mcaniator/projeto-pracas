import { IconLoader2 } from "@tabler/icons-react";

const LoadingIcon = ({ className }: { className?: string }) => {
  return <IconLoader2 className={`animate-spin ${className}`} />;
};

export default LoadingIcon;
