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
    e: React.ChangeEvent<HTMLInputElement>,
    removeSaveState: boolean,
  ): void;
}) => {
  return (
    <div className="mb-2 flex items-center justify-between rounded bg-white p-2">
      <span className="flex flex-row">
        <input
          type="checkbox"
          checked={checked}
          value={submissionGroupId}
          onChange={(e) => {
            handleSubmissionGroupChange(e, true);
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
    e: React.ChangeEvent<HTMLInputElement>,
    removeSaveState: boolean,
  ): void;
}) => {
  return submissionsGroups === undefined ?
      <h3>Nenhuma contagem para este local!</h3>
    : <div className="w-full overflow-auto text-black">
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
