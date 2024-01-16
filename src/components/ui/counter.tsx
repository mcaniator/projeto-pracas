"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface CounterProps extends InputHTMLAttributes<HTMLInputElement> {
  counter: number;
  setCounter: (value: number) => void;
}

const Counter = forwardRef<HTMLInputElement, CounterProps>(
  ({ counter, setCounter, ...props }, ref) => {
    return (
      <div>
        <button onClick={() => setCounter(counter + 1)}>+</button>
        <button
          onClick={() => {
            if (counter > 0) setCounter(counter - 1);
          }}
        >
          -
        </button>
        <input
          type="number"
          onChange={(e) => {
            if (!isNaN(parseInt(e.target.value)))
              setCounter(parseInt(e.target.value));
            else setCounter(0);
          }}
          value={counter}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Counter.displayName = "Counter";

export default Counter;
