import { InputHTMLAttributes, forwardRef } from "react";

const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ ...props }, ref) => {
  const { children, ...attributes } = props;
  return (
    <label>
      <input type="checkbox" {...attributes} ref={ref} />
      <span>{children}</span>
    </label>
  );
});
Checkbox.displayName = "Checkbox";

export default Checkbox;
