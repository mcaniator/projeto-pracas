import { cn } from "@/lib/cn";
import { IconSelector } from "@tabler/icons-react";
import React, { ReactElement, SelectHTMLAttributes } from "react";

interface selectProps extends SelectHTMLAttributes<HTMLSelectElement> {}
const Select = ({ ...props }: selectProps) => {
  const { name, id, children, className } = props;

  return (
    <div className={"flex w-full"}>
      <select
        name={name}
        id={id}
        className={cn(
          className,
          "appearance-none rounded-lg border-2 border-off-white/80 bg-gray-400/50 px-3 py-1 text-lg shadow-md",
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === "option") {
            const optionChild = child as ReactElement<HTMLOptionElement>;
            return React.cloneElement(optionChild, {
              className: `${optionChild.props.className || ""} text-black`,
            });
          }
          return child;
        })}
      </select>
      <div className={"pointer-events-none relative -ml-7 flex items-center"}>
        <IconSelector className={"absolute"} />
      </div>
    </div>
  );
};

export { Select };
