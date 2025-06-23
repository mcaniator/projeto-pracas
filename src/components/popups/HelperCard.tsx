import {
  IconCircleCheck,
  IconExclamationCircle,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import React, { ReactNode } from "react";

import { Button } from "../button";

type HelperCardType = "INFO" | "ERROR" | "CONFIRM";

const helperIconMap = new Map<HelperCardType, React.ComponentType>([
  ["INFO", () => <IconInfoCircle />],
  ["ERROR", () => <IconExclamationCircle />],
  ["CONFIRM", () => <IconCircleCheck />],
]);

const helperBackgroundColorMap = new Map<HelperCardType, string>([
  ["CONFIRM", "bg-green-500"],
  ["ERROR", "bg-red-500"],
  ["INFO", "bg-blue-500"],
]);

const HelperCard = ({
  children,
  helperCardType,
  close,
}: {
  children: ReactNode;
  helperCardType: HelperCardType;
  close: () => void;
}) => {
  const SelectedIcon = helperIconMap.get(helperCardType);
  return (
    <div
      className={`${helperBackgroundColorMap.get(helperCardType)} z-50 flex -translate-x-1/2 items-start justify-between rounded-md p-1 text-center text-white shadow-[0_0_10px_rgba(0,0,0,0)] shadow-black`}
    >
      <div className="mb-1 p-2">
        {SelectedIcon ?
          <SelectedIcon />
        : <></>}
      </div>
      <div className="flex items-center justify-center py-2">{children}</div>

      <Button
        className="h-10 p-2"
        variant={"ghost"}
        onPress={() => {
          close();
        }}
      >
        <IconX size={24} />
      </Button>
    </div>
  );
};

export default HelperCard;
export type { HelperCardType };
