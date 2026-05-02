import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CNotesChip from "@/components/ui/question/cNotesChip";
import type { AssessmentCategoryItem } from "@/lib/serverFunctions/queries/assessment";
import type { ReactNode } from "react";

const ResponseFormCategory = ({
  category,
  children,
}: {
  category: Pick<AssessmentCategoryItem, "name" | "notes">;
  children: ReactNode;
}) => {
  return (
    <CAccordion defaultExpanded>
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
