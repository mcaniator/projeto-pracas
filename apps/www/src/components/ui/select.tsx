import { cn } from "@/lib/utils";
import { ChevronsUpDownIcon } from "lucide-react";
import { SelectHTMLAttributes } from "react";

interface selectProps extends SelectHTMLAttributes<HTMLSelectElement> {}
const Select = ({ ...props }: selectProps) => {
  const { name, id, children, className } = props;

  return (
    <div className={"w-full flex"}>
      <select
        name={name}
        id={id}
        className={cn(className, "w-full appearance-none rounded-lg px-3 py-1 border-gray-500/40 border-2 bg-gray-400/50 text-lg")}
        {...props}
      >
        {children}
      </select>
      <div className={"relative flex items-center -ml-7 pointer-events-none"}>
        <ChevronsUpDownIcon className={"absolute"} />
      </div>
    </div>
  );
};

export { Select };
