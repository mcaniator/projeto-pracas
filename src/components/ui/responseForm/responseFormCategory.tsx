import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CNotesChip from "@/components/ui/question/cNotesChip";
import type { AssessmentCategoryItem } from "@/lib/serverFunctions/queries/assessment";
import type { ReactNode } from "react";

const ResponseFormCategory = ({
  category,
  expanded,
  onExpandedChange,
  children,
}: {
  category: Pick<AssessmentCategoryItem, "name" | "notes">;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
}) => {
  return (
    <CAccordion
      expanded={expanded}
      onChange={(_, nextExpanded) => onExpandedChange?.(nextExpanded)}
      slotProps={{
        transition: {
          unmountOnExit: true,
        },
      }}
    >
      <CAccordionSummary>
        <div className="flex flex-row items-center gap-1">
          <CNotesChip notes={category.notes} />
          {category.name}
        </div>
      </CAccordionSummary>
      <CAccordionDetails>
        <div className="flex flex-col gap-3">{children}</div>
      </CAccordionDetails>
    </CAccordion>
  );
};

export default ResponseFormCategory;
