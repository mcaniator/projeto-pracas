import { InputHTMLAttributes, forwardRef } from "react";

const RadioButton = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ ...props }, ref) => {
  const { children, ...attributes } = props;
  return (
    <label className={"relative w-fit cursor-pointer select-none"}>
      {children}
      <input type="radio" className={"absolute h-0 w-0 cursor-pointer opacity-0"} {...attributes} ref={ref} />
      <span className={""} />
    </label>
  );
});
RadioButton.displayName = "RadioButton";

export default RadioButton;
