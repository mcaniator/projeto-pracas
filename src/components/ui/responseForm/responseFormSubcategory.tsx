import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CNotesChip from "@/components/ui/question/cNotesChip";
import type { AssessmentSubcategoryItem } from "@/lib/serverFunctions/queries/assessment";
import { Box } from "@mui/material";
import type { ReactNode } from "react";

const ResponseFormSubcategory = ({
  subcategory,
  children,
}: {
  subcategory: Pick<AssessmentSubcategoryItem, "name" | "notes">;
  children: ReactNode;
}) => {
  return (
    <Box
      sx={{
        padding: "6px",
        border: 1,
        borderColor: "primary.main",
        borderRadius: 1,
      }}
    >
      <CAccordion defaultExpanded>
        <CAccordionSummary>
          <div className="flex flex-row items-center gap-1">
            <CNotesChip notes={subcategory.notes} />
            {subcategory.name}
          </div>
        </CAccordionSummary>
        <CAccordionDetails>
          <div className="flex flex-col gap-3">{children}</div>
        </CAccordionDetails>
      </CAccordion>
    </Box>
  );
};

export default ResponseFormSubcategory;
