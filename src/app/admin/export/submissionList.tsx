"use client";

import { SubmissionGroup } from "./editPage";

const SubmissionComponent = ({
  checked,
  submissionGroup,
  handleSubmissionGroupChange,
}: {
  checked: boolean;
  submissionGroup: SubmissionGroup;
  handleSubmissionGroupChange(
    checked: boolean,
    submissionGroup: SubmissionGroup,
    removeSaveState: boolean,
  ): void;
}) => {
  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLInputElement)) {
      handleSubmissionGroupChange(!checked, submissionGroup, true);
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
            handleSubmissionGroupChange(
              e.target.checked,
              submissionGroup,
              true,
            );
          }}
        />
        {submissionGroup.date.toLocaleString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }) +
          ", " +
          submissionGroup.formName +
          ", Versão: " +
          submissionGroup.formVersion +
          ", " +
          submissionGroup.username}
      </span>
    </div>
  );
};

const SubmissionList = ({
  submissionsGroups,
  selectedSubmissionsGroups,
  handleSubmissionGroupChange,
}: {
  submissionsGroups: SubmissionGroup[];
  selectedSubmissionsGroups: SubmissionGroup[];
  handleSubmissionGroupChange(
    checked: boolean,
    submissionGroup: SubmissionGroup,
    removeSaveState: boolean,
  ): void;
}) => {
  submissionsGroups.sort((a, b) => b.date.getTime() - a.date.getTime());
  return submissionsGroups === undefined ?
      <h3>Nenhuma contagem para este local!</h3>
    : <div className="w-full overflow-auto p-2 text-black">
        {submissionsGroups.map((submissionGroup) => {
          const checked = selectedSubmissionsGroups?.some(
            (selectedSubmissionsGroup) =>
              selectedSubmissionsGroup.id === submissionGroup.id,
          );
          return (
            <SubmissionComponent
              key={submissionGroup.id}
              checked={checked}
              submissionGroup={submissionGroup}
              handleSubmissionGroupChange={handleSubmissionGroupChange}
            />
          );
        })}
      </div>;
};

export { SubmissionList };
