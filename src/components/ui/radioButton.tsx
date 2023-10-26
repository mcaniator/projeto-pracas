import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const RadioButton = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ ...props }, ref) => {
  const { children, className, ...attributes } = props;
  return (
    <label className={"flex w-fit select-none items-center gap-1"}>
      <input
        type="radio"
        className={cn(
          "m-0 h-4 w-4 appearance-none rounded-full border-2 border-off-white bg-clip-content p-[2px] transition-all checked:bg-amethyst",
          className,
        )}
        {...attributes}
        ref={ref}
      />
      <p className={"-mb-1"}>{children}</p>
    </label>
  );
});
RadioButton.displayName = "RadioButton";

export default RadioButton;
