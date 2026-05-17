import CDialog from "@/components/ui/dialog/cDialog";
import { FetchquestionUsesResponse } from "@/lib/serverFunctions/queries/question";
import { Chip, Divider } from "@mui/material";
import { IconEye } from "@tabler/icons-react";
import { useState } from "react";

const QuestionUses = ({
  questionUses,
}: {
  questionUses: FetchquestionUsesResponse;
}) => {
  const [openFormUsesDialog, setOpenFormUsesDialog] = useState(false);
  const [openAssessmentUsesDialog, setOpenAssessmentUsesDialog] =
    useState(false);
  return (
    <div className="flex flex-col gap-1">
      <Chip
        label={`Questão usada em ${questionUses.numberOfForms} formulário${questionUses.numberOfForms === 1 ? "" : "s"}`}
        icon={
          questionUses.numberOfForms > 0 ?
            <IconEye className="rounded-lg outline outline-1" />
          : undefined
        }
        onClick={() => setOpenFormUsesDialog(true)}
        color={questionUses.numberOfForms > 0 ? "warning" : "default"}
      />
      <Chip
        label={`Questão usada em ${questionUses.numberOfAssessments} avaliaç${questionUses.numberOfAssessments === 1 ? "ão" : "ões"}`}
        icon={
          questionUses.numberOfAssessments > 0 ?
            <IconEye className="rounded-lg outline outline-1" />
          : undefined
        }
        onClick={() => setOpenAssessmentUsesDialog(true)}
        color={questionUses.numberOfAssessments > 0 ? "warning" : "default"}
      />
      <FormUsesDialog
        open={openFormUsesDialog}
        onClose={() => setOpenFormUsesDialog(false)}
        questionUses={questionUses}
      />
      <AssessmentUsesDialog
        open={openAssessmentUsesDialog}
        onClose={() => setOpenAssessmentUsesDialog(false)}
        questionUses={questionUses}
      />
    </div>
  );
};

const FormUsesDialog = ({
  questionUses,
  open,
  onClose,
}: {
  questionUses: FetchquestionUsesResponse;
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <CDialog title="Uso em formulários" open={open} onClose={onClose}>
      <ul className="list-inside list-disc space-y-2">
        {questionUses.forms.map((form) => (
          <li key={form.id}>{form.name}</li>
        ))}
      </ul>
    </CDialog>
  );
};

const AssessmentUsesDialog = ({
  questionUses,
  open,
  onClose,
}: {
  questionUses: FetchquestionUsesResponse;
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <CDialog title="Uso em avaliações" open={open} onClose={onClose}>
      <ul className="list-inside list-disc space-y-2">
        {questionUses.assessments.map((assessment) => (
          <li key={assessment.assessmentId}>
            {`${assessment.location.name} - ${assessment.assessmentId}`}
          </li>
        ))}
      </ul>
    </CDialog>
  );
};

export default QuestionUses;
