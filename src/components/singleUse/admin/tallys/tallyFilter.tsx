"use client";

import { Input } from "react-aria-components";

const TallyFilter = ({
  setInitialDate,
  setFinalDate,
}: {
  setInitialDate: React.Dispatch<React.SetStateAction<number>>;
  setFinalDate: React.Dispatch<React.SetStateAction<number>>;
}) => {
  //const [initialDate, setInitialDate] = useState(0);
  //const [finalDate, setFinalDate] = useState(0);
  const handleInitialDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch) setInitialDate(millisecondsSinceEpoch);
    else setInitialDate(0);
  };
  const handleFinalDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const millisecondsSinceEpoch =
      selectedDate ? new Date(selectedDate).getTime() : null;
    if (millisecondsSinceEpoch) setFinalDate(millisecondsSinceEpoch);
    else setFinalDate(0);
  };
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="initial-date" className="mr-2">
          De:{" "}
        </label>
        <Input
          id="initial-date"
          type="datetime-local"
          className={"text-black"}
          onChange={handleInitialDateChange}
        ></Input>
      </div>
      <div>
        <label htmlFor="final-date" className="mr-2">
          A:{" "}
        </label>
        <Input
          id="final-date"
          type="datetime-local"
          className={"text-black"}
          onChange={handleFinalDateChange}
        ></Input>
      </div>
    </div>
  );
};

export { TallyFilter };
