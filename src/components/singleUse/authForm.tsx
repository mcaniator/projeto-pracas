"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";

const Form = ({
  children,
  action,
}: {
  children: React.ReactNode;
  action: string;
}) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  return (
    <>
      <form
        action={action}
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          setErrorMessage(null);
          const formData = new FormData(e.currentTarget);
          const responsePromise = fetch(action, {
            method: "POST",
            body: formData,
            redirect: "manual",
          });
          console.warn(responsePromise);
          let response;
          try {
            response = use(responsePromise);
          } catch (e) {
            console.log(e);
          }
          if (response?.status === 0) {
            return router.refresh();
          }
          if (!response?.ok) {
            const result = response?.json() as {
              error?: string;
            };
            setErrorMessage(result.error ?? null);
          }
        }}
      >
        {children}
      </form>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </>
  );
};

export default Form;
