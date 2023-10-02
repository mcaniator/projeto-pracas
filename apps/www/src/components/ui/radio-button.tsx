import { InputHTMLAttributes, forwardRef } from "react";

const RadioButton = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ ...props }, ref) => {
  const { children, ...attributes } = props;
  return (
    <label>
      <input type="radio" {...attributes} ref={ref} />
      <span>{children}</span>
    </label>
  );
});
RadioButton.displayName = "RadioButton";

export default RadioButton;
