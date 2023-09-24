"use client";

import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { Button } from "./ui/button";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending}>{pending ? "Submitting..." : "Submit"}</Button>
  );
};

export default SubmitButton;
