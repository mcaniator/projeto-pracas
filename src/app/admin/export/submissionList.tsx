"use client";

import { SubmissionGroup } from "./editPage";

const SubmissionComponent = ({
  date,
  checked,
  submissionGroupId,
  handleSubmissionGroupChange,
}: {
  date: string;
  checked: boolean;
  submissionGroupId: number;
  handleSubmissionGroupChange(
    checked: boolean,
    value: number,
    removeSaveState: boolean,
  ): void;
}) => {
  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLInputElement)) {
      handleSubmissionGroupChange(!checked, submissionGroupId, true);
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
          value={submissionGroupId}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            handleSubmissionGroupChange(
              e.target.checked,
              Number(e.target.value),
              true,
            );
          }}
        />
        {date}
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
  selectedSubmissionsGroups: number[];
  handleSubmissionGroupChange(
    checked: boolean,
    value: number,
    removeSaveState: boolean,
  ): void;
}) => {
  return submissionsGroups === undefined ?
      <h3>Nenhuma contagem para este local!</h3>
    : <div className="w-full overflow-auto p-2 text-black">
        {submissionsGroups.map((submissionGroup) => {
          const checked = selectedSubmissionsGroups?.includes(
            submissionGroup.id,
          );
          return (
            <SubmissionComponent
              date={submissionGroup.date}
              key={submissionGroup.id}
              checked={checked}
              submissionGroupId={submissionGroup.id}
              handleSubmissionGroupChange={handleSubmissionGroupChange}
            />
          );
        })}
      </div>;
};

export { SubmissionList };
