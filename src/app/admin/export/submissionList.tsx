"use client";

const SubmissionComponent = ({ date }: { date: string }) => {
  return (
    <div className="mb-2 flex items-center justify-between rounded bg-white p-2">
      <span className="flex flex-row">
        <input type="checkbox" />
        {date}
      </span>
    </div>
  );
};

const SubmissionList = ({ dates }: { dates: string[] }) => {
  return dates === undefined ?
      <h3>Nenhuma contagem para este local!</h3>
    : <div className="w-full overflow-auto text-black">
        {dates.map((date) => {
          //const checked = selectedTallys?.includes(tally.id);
          return <SubmissionComponent date={date} key={date} />;
        })}
      </div>;
};

export { SubmissionList };
