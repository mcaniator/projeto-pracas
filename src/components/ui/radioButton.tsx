import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { InputHTMLAttributes, forwardRef } from "react";

const radioButtonVariants = cva("m-0 h-5 w-5 appearance-none rounded-full border-[3px] border-white bg-clip-content p-[1.5px] transition-all", {
  variants: {
    variant: {
      default: "checked:bg-true-blue",
      admin: "checked:bg-purpureus",
      constructive: "checked:bg-cambridge-blue",
      destructive: "checked:bg-redwood",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface RadioButtonProps extends InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof radioButtonVariants> {}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(({ variant, className, ...props }, ref) => {
  const { children, ...attributes } = props;
  return (
    <label className={"flex w-fit select-none items-center gap-1"}>
      <input type="radio" className={cn(radioButtonVariants({ variant, className }))} {...attributes} ref={ref} />
      <p className={"-mb-1 text-lg"}>{children}</p>
    </label>
  );
});
RadioButton.displayName = "RadioButton";

export type { RadioButtonProps };
export { RadioButton, radioButtonVariants };
