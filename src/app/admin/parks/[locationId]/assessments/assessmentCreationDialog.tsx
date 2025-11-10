import { Skeleton } from "@mui/material";
import { Suspense, use, useEffect, useState } from "react";
import { Form } from "react-aria-components";

import CDialog from "../../../../../components/ui/dialog/cDialog";
import FormsList from "./formsList";

const AssessmentCreationDialog = ({
  open,
  locationName,
  formsPromise,
  onClose,
}: {
  open: boolean;
  locationName: string;
  onClose: () => void;
  formsPromise: Promise<{
    statusCode: number;
    forms: {
      id: number;
      updatedAt: Date;
      name: string;
      finalized: boolean;
    }[];
  }>;
}) => {
  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Criar nova avaliação"
      subtitle={locationName}
      fullScreen
    >
      <div className="flex flex-col">
        <Suspense
          fallback={
            <div className="flex flex-col gap-1">
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
            </div>
          }
        >
          <FormsList formsPromise={formsPromise} />
        </Suspense>
      </div>
    </CDialog>
  );
};

export default AssessmentCreationDialog;
