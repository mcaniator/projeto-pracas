"use client";

import { LocationAssessment } from "@/serverActions/assessmentUtil";

const SubmissionComponent = ({
  checked,
  assessment,
  handleAssessmentChange,
}: {
  checked: boolean;
  assessment: LocationAssessment;
  handleAssessmentChange: (
    checked: boolean,
    assessment: LocationAssessment,
    removeSaveState: boolean,
  ) => void;
}) => {
  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLInputElement)) {
      handleAssessmentChange(!checked, assessment, true);
    }
  };
  return (
    <div
      className="mb-2 flex items-center justify-between rounded bg-white p-2 outline-blue-500 hover:outline"
      onClick={(e) => handleDivClick(e)}
    >
      <span className="flex flex-row">
        <input
          type="checkbox"
          checked={checked}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            handleAssessmentChange(e.target.checked, assessment, true);
          }}
        />
        {assessment.startDate.toLocaleString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }) +
          ", " +
          assessment.form.name +
          ", Versão: " +
          assessment.form.version +
          ", " +
          assessment.user.username}
      </span>
    </div>
  );
};

const SubmissionList = ({
  assessments,
  selectedAssessments,
  handleAssessmentChange,
}: {
  assessments: LocationAssessment[];
  selectedAssessments: LocationAssessment[];
  handleAssessmentChange: (
    checked: boolean,
    assessment: LocationAssessment,
    removeSaveState: boolean,
  ) => void;
}) => {
  assessments.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  return assessments === undefined ?
      <h3>Nenhuma contagem para este local!</h3>
    : <div className="w-full p-2 text-black">
        {assessments.map((assessment) => {
          const checked = selectedAssessments?.some(
            (selectedAssessment) => selectedAssessment.id === assessment.id,
          );
          return (
            <SubmissionComponent
              key={assessment.id}
              checked={checked}
              assessment={assessment}
              handleAssessmentChange={handleAssessmentChange}
            />
          );
        })}
      </div>;
};

export { SubmissionList };
