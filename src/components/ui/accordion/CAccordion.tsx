import { Accordion, AccordionProps } from "@mui/material";
import React from "react";

type CAccordionProps = AccordionProps;

const CAccordion = React.forwardRef<HTMLDivElement, CAccordionProps>(
  (props, ref) => {
    const { children, sx, ...rest } = props;
    const baseSx = {
      border: 1,
      borderColor: "primary.main",
      borderRadius: 1,
    };
    return (
      <Accordion ref={ref} sx={{ ...sx, ...baseSx }} {...rest}>
        {children}
      </Accordion>
    );
  },
);

CAccordion.displayName = "CAccordion";

export default CAccordion;
