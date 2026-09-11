"use client";

import PermissionGuard from "@/components/auth/permissionGuard";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import type { FetchModularTallyTemplateStructureResponse } from "@/lib/serverFunctions/queries/modularTally";
import { useEffect, useState } from "react";

import PersonCharacteristicManager from "./personCharacteristicManager/personCharacteristicManager";
import TallyTemplateEditor from "./tallyTemplateEditor";

type ModularTallyTemplate = NonNullable<
  NonNullable<FetchModularTallyTemplateStructureResponse>["modularTallyTemplate"]
>;

const TallyTemplateClient = ({
  modularTallyTemplate,
}: {
  modularTallyTemplate: ModularTallyTemplate;
}) => {
  const [templateName, setTemplateName] = useState(modularTallyTemplate.name);
  const [isMobileView, setIsMobileView] = useState(true);
  const [isCharacteristicManagerOpen, setIsCharacteristicManagerOpen] =
    useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1000);

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader title="Protocolo de contagem" />
      <div className="grid h-full grid-cols-5 gap-2 overflow-auto">
        <div
          className={`${
            isMobileView ? "col-span-5" : "col-span-3"
          } overflow-auto`}
        >
          <TallyTemplateEditor
            modularTallyTemplate={modularTallyTemplate}
            name={templateName}
            onNameChange={setTemplateName}
          />
          {isMobileView && !modularTallyTemplate.finalized && (
            <div className="ml-2 mt-3">
              <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
                <CButton
                  onClick={() => setIsCharacteristicManagerOpen(true)}
                >
                  Características
                </CButton>
              </PermissionGuard>
            </div>
          )}
        </div>
        {!isMobileView && !modularTallyTemplate.finalized && (
          <div
            className="col-span-2 h-full overflow-auto"
            style={{
              borderLeft: "solid 1px gray",
              boxShadow: "-4px 0 6px -2px rgba(0, 0, 0, 0.3)",
            }}
          >
            <PersonCharacteristicManager showTitle />
          </div>
        )}
      </div>
      {isMobileView && !modularTallyTemplate.finalized && (
        <CDialog
          fullScreen
          keepMounted
          title="Administrar características"
          open={isCharacteristicManagerOpen}
          onClose={() => setIsCharacteristicManagerOpen(false)}
          disableDialogActions
        >
          <PersonCharacteristicManager showTitle={false} />
        </CDialog>
      )}
    </div>
  );
};

export default TallyTemplateClient;
