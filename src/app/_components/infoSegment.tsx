import clsx from "clsx";
import Image from "next/image";
import { ReactNode } from "react";

import fotoPraca from "/public/fotoPraca.jpg";

const InfoSegment = ({
  children,
  rightJustify = false,
}: {
  children: ReactNode;
  rightJustify?: boolean;
}) => {
  const randomRotation =
    (rightJustify ? "-" : "") + (Math.floor(Math.random() * (13 - 8)) + 8);

  return (
    <article
      className={clsx(
        "flex flex-col items-center gap-20 p-10 pt-20 sm:p-32  xl:items-start xl:justify-center",
        rightJustify && ["xl:flex-row-reverse"],
        !rightJustify && "xl:flex-row",
      )}
    >
      <Image
        src={fotoPraca}
        alt="foto praça jf"
        style={{ transform: `rotate(${randomRotation}deg)` }}
        className={clsx(
          "h-auto w-[100vw] shadow-lg sm:w-[610px]",
          rightJustify && "sm:translate-x-8",
          !rightJustify && "sm:-translate-x-8",
        )}
      />
      <div className="mt-7 flex h-full max-w-md flex-col gap-1 self-center">
        {children}
      </div>
    </article>
  );
};

export { InfoSegment };
