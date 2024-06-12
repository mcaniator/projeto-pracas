import { cn } from "@/lib/cn";
import {
  FieldError as FieldErrorPrimitive,
  Input as InputPrimitive,
  Label as LabelPrimitive,
  TextField as TextFieldPrimitive,
  TextFieldProps as TextFieldPropsPrimitive,
  Text as TextPrimitive,
  ValidationResult as ValidationResultPrimitive,
} from "react-aria-components";

interface TextFieldProps extends TextFieldPropsPrimitive {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResultPrimitive) => string);
  className?: string;
}

const Input = ({
  label,
  description,
  errorMessage,
  className,
  ...props
}: TextFieldProps) => {
  return (
    <TextFieldPrimitive className={cn("flex flex-col", className)} {...props}>
      <LabelPrimitive className="-mb-1 text-xl font-semibold">
        {label}
      </LabelPrimitive>
      <InputPrimitive
        className={
          "rounded-xl border-[3px] border-off-white/80 bg-gray-400/50 px-2 pb-1 pt-2 text-xl font-normal outline-none transition-all data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring invalid:border-redwood"
        }
      ></InputPrimitive>
      {description && (
        <TextPrimitive slot="description" className="text-gray-500">
          {description}
        </TextPrimitive>
      )}
      <FieldErrorPrimitive className={"text-xl font-medium text-redwood"}>
        {errorMessage ? errorMessage : ""}
      </FieldErrorPrimitive>
    </TextFieldPrimitive>
  );
};

export { Input };
