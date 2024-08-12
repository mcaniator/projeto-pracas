import { cn } from "@/lib/cn";
import { IconCheck } from "@tabler/icons-react";
import { VariantProps, cva } from "class-variance-authority";
import { InputHTMLAttributes, forwardRef } from "react";

const checkboxVariant = cva(
  "peer m-0 h-5 w-5 appearance-none self-center rounded-lg border-[3px] border-white bg-clip-content p-[1.5px] transition-all",
  {
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
  },
);

interface CheckboxProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof checkboxVariant> {}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, ...props }, ref) => {
    const { children, ...attributes } = props;
    return (
      <label className={"flex w-fit select-none"}>
        <input
          type="checkbox"
          className={cn(checkboxVariant({ variant, className }))}
          {...attributes}
          ref={ref}
        />
        <IconCheck
          className={
            "translate-x-[-15px] translate-y-[0.35rem] text-white opacity-0 transition-all peer-checked:opacity-100"
          }
          size={10}
          stroke={5}
        />
        <span className={"-mb-1 self-center text-lg"}>{children}</span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariant };
export type { CheckboxProps };
