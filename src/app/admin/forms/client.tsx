"use client";

import { useHelperCard } from "@components/context/helperCardContext";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const FormsClient = () => {
  const params = useSearchParams();
  const { setHelperCard } = useHelperCard();
  const isFormCreated = params.get("formCreated") === "true";
  useEffect(() => {
    if (isFormCreated) {
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Nova versão de formulário criada!</>,
      });
    }
  }, [isFormCreated, setHelperCard]);

  return <></>;
};

export default FormsClient;
