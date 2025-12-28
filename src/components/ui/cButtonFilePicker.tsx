import { InputHTMLAttributes, useRef } from "react";

import CButton, { CButtonProps } from "./cButton";

type CButtonFilePickerProps = CButtonProps & {
  fileAccept?: InputHTMLAttributes<HTMLInputElement>["accept"];
  onFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
};

function CButtonFilePicker(props: CButtonFilePickerProps) {
  const { children, fileAccept, onFileInput, onClick, ...rest } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    fileInputRef.current?.click();
  };
  return (
    <>
      <CButton onClick={handleClick} {...rest}>
        {children}
      </CButton>
      <input
        type="file"
        accept={fileAccept}
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFileInput}
        multiple={props.multiple}
      />
    </>
  );
}

export default CButtonFilePicker;
