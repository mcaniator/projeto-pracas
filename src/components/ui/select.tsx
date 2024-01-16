import { cn } from "@/lib/cn";
import { ChevronsUpDownIcon } from "lucide-react";
import { SelectHTMLAttributes } from "react";

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
          "w-full appearance-none rounded-lg border-2 border-off-white/80 bg-gray-400/50 px-3 py-1 text-lg shadow-md",
        )}
        {...props}
      >
        {children}
      </select>
      <div className={"pointer-events-none relative -ml-7 flex items-center"}>
        <ChevronsUpDownIcon className={"absolute"} />
      </div>
    </div>
  );
};

export { Select };
