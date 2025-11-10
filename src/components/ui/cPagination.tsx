import { ButtonProps } from "@mui/material";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { PaginationInfo } from "../../lib/utils/apiCall";
import CButton from "./cButton";

const CPagination = ({
  paginationInfo,
  buttonColor,
  onForward,
  onBackwards,
}: {
  paginationInfo: PaginationInfo;
  buttonColor?: ButtonProps["color"];
  onForward: () => void;
  onBackwards: () => void;
}) => {
  const localButtonColor = buttonColor ?? "primary";
  return (
    <div className="flex flex-row gap-1">
      <CButton
        dense
        color={localButtonColor}
        disabled={paginationInfo.startIndex <= 1}
        onClick={onBackwards}
      >
        {" "}
        <IconChevronLeft />
      </CButton>
      {`${paginationInfo.startIndex} - ${paginationInfo.endIndex} / ${paginationInfo.totalItems}`}
      <CButton
        dense
        color={localButtonColor}
        disabled={paginationInfo.endIndex === paginationInfo.totalItems}
        onClick={onForward}
      >
        {" "}
        <IconChevronRight />
      </CButton>
    </div>
  );
};

export default CPagination;
