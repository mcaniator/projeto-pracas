import Image, { ImageProps } from "next/image";
import { ReactNode } from "react";
import { LuImageOff } from "react-icons/lu";

type CImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  imageOffSize?: number;
  fallback?: ReactNode;
};

const CImage = ({ src, fallback = null, ...props }: CImageProps) => {
  if (!src) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex items-center justify-center">
        <LuImageOff
          size={props.imageOffSize ?? props.height ?? props.width ?? 20}
        />
      </div>
    );
  }

  return <Image src={src} {...props} />;
};

export default CImage;
