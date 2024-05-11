"use client";

import { Input } from "react-aria-components";

const TallyFilter = () => {
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
        ></Input>
      </div>
    </div>
  );
};

export { TallyFilter };
