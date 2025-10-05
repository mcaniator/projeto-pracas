import { AccordionDetails, AccordionDetailsProps } from "@mui/material";
import React from "react";

type CAccordionDetailsProps = AccordionDetailsProps;

const CAccordionDetails = React.forwardRef<
  HTMLDivElement,
  CAccordionDetailsProps
>((props, ref) => {
  const { children, sx, ...rest } = props;
  const baseSx = {
    padding: { xs: "2px 4px 4px", sm: "8px 16px 16px" },
  };
  return (
    <AccordionDetails ref={ref} sx={{ ...sx, ...baseSx }} {...rest}>
      {children}
    </AccordionDetails>
  );
});

CAccordionDetails.displayName = "CAccordionDetails";

export default CAccordionDetails;
