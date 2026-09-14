"use client";

import PermissionGuard from "@/components/auth/permissionGuard";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import { useUpdateTallyTemplate } from "@/lib/serverFunctions/apiCalls/modularTally";
import type { FetchModularTallyTemplateStructureResponse } from "@/lib/serverFunctions/queries/modularTally";
import { useRouter } from "next-nprogress-bar";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";

import PersonCharacteristicManager from "./personCharacteristicManager/personCharacteristicManager";
import type {
  PersonCharacteristic,
  PersonCharacteristicGroup,
} from "./personCharacteristicManager/types";
import SaveTallyTemplateDialog from "./saveTallyTemplateDialog";
import {
  type TallyTemplateDraftGroup,
  buildTallyTemplateDraftGroups,
  tallyTemplateGroupDisplayModes,
} from "./tallyTemplateDraft";
import TallyTemplateEditor from "./tallyTemplateEditor";

const TallyTemplateClient = ({
  modularTallyTemplate,
}: {
  modularTallyTemplate: FetchModularTallyTemplateStructureResponse["modularTallyTemplate"];
}) => {
  const router = useRouter();
  const [templateName, setTemplateName] = useState(modularTallyTemplate.name);
  const [templateGroups, setTemplateGroups] = useState<
    TallyTemplateDraftGroup[]
  >(() =>
    buildTallyTemplateDraftGroups(modularTallyTemplate.tallyTemplateGroups),
  );
  const [isMobileView, setIsMobileView] = useState(true);
  const [isCharacteristicManagerOpen, setIsCharacteristicManagerOpen] =
    useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveAsFinalized, setSaveAsFinalized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [updateTallyTemplate, isSaving] = useUpdateTallyTemplate();
  const addedPersonCharacteristicIds = useMemo(
    () =>
      templateGroups.flatMap((group) =>
        group.characteristics.map(
          (characteristic) => characteristic.personCharacteristicId,
        ),
      ),
    [templateGroups],
  );

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1000);

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addCharacteristicToTemplate = useCallback(
    (
      characteristic: PersonCharacteristic,
      personCharacteristicGroup: PersonCharacteristicGroup,
    ) => {
      if (templateGroups.length === 0 && personCharacteristicGroup.isTagGroup) {
        enqueueSnackbar(
          "O primeiro grupo adicionado não deve ser um grupo de tags!",
          { variant: "error" },
        );
        return;
      }

      setTemplateGroups((currentGroups) => {
        const currentGroup = currentGroups.find(
          (group) =>
            group.personCharacteristicGroupId === personCharacteristicGroup.id,
        );

        if (currentGroup) {
          if (
            currentGroup.characteristics.some(
              (item) => item.personCharacteristicId === characteristic.id,
            )
          ) {
            return currentGroups;
          }

          return currentGroups.map((group) =>
            group.id === currentGroup.id ?
              {
                ...group,
                characteristics: [
                  ...group.characteristics,
                  {
                    id: `person-characteristic-${characteristic.id}`,
                    personCharacteristicId: characteristic.id,
                    position: group.characteristics.length + 1,
                    personCharacteristic: characteristic,
                  },
                ],
              }
            : group,
          );
        }

        const newGroupBase = {
          id: `person-characteristic-group-${personCharacteristicGroup.id}`,
          personCharacteristicGroupId: personCharacteristicGroup.id,
          personCharacteristicGroup: {
            id: personCharacteristicGroup.id,
            title: personCharacteristicGroup.title,
            isTagGroup: personCharacteristicGroup.isTagGroup,
          },
          characteristics: [
            {
              id: `person-characteristic-${characteristic.id}`,
              personCharacteristicId: characteristic.id,
              position: 1,
              personCharacteristic: characteristic,
            },
          ],
        };
        const newGroup: TallyTemplateDraftGroup =
          currentGroups.length === 0 ?
            {
              ...newGroupBase,
              position: null,
              displayMode: tallyTemplateGroupDisplayModes.COUNTERS,
            } // The first group is always counters, because it's the mandatory interaction during tally
          : {
              ...newGroupBase,
              position:
                Math.max(
                  0,
                  ...currentGroups.flatMap((group) =>
                    group.position === null ? [] : [group.position],
                  ),
                ) + 1,
              displayMode: tallyTemplateGroupDisplayModes.COMMON,
            };

        return [...currentGroups, newGroup];
      });
    },
    [templateGroups],
  );

  const saveTallyTemplate = async () => {
    if (!templateName.trim()) {
      enqueueSnackbar("Informe o nome do protocolo de contagem.", {
        variant: "error",
      });
      return;
    }

    try {
      const response = await updateTallyTemplate({
        data: {
          modularTallyTemplateId: modularTallyTemplate.id,
          name: templateName,
          finalized: saveAsFinalized,
          groups: templateGroups.map((group) => {
            const baseGroup = {
              personCharacteristicGroupId: group.personCharacteristicGroupId,
              characteristics: group.characteristics.map((characteristic) => ({
                personCharacteristicId: characteristic.personCharacteristicId,
                position: characteristic.position,
              })),
            };

            if (group.displayMode === tallyTemplateGroupDisplayModes.COMMON) {
              return {
                ...baseGroup,
                position: group.position,
                displayMode: tallyTemplateGroupDisplayModes.COMMON,
              };
            }

            return {
              ...baseGroup,
              position: null,
              displayMode: group.displayMode,
            };
          }),
        },
        projectOptions: { loadingMessage: "Salvando..." },
      });

      if (response.responseInfo.statusCode !== 200) {
        enqueueSnackbar(
          response.responseInfo.message ??
            "Erro ao salvar protocolo de contagem.",
          { variant: "error" },
        );
        return;
      }

      if (saveAsFinalized) {
        setIsRedirecting(true);
        void router.push("/admin/protocols?type=tally");
        return;
      }

      setIsSaveDialogOpen(false);
    } catch {
      enqueueSnackbar("Erro ao salvar protocolo de contagem.", {
        variant: "error",
      });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader title="Protocolo de contagem" />
      <div className="grid h-full grid-cols-5 gap-2 overflow-auto">
        <div
          className={`${
            isMobileView || modularTallyTemplate.finalized ?
              "col-span-5"
            : "col-span-3"
          } overflow-auto`}
        >
          <TallyTemplateEditor
            modularTallyTemplate={modularTallyTemplate}
            name={templateName}
            onNameChange={setTemplateName}
            groups={templateGroups}
            onChangeGroups={setTemplateGroups}
            onSave={() => setIsSaveDialogOpen(true)}
          />
          {isMobileView && !modularTallyTemplate.finalized && (
            <div className="ml-2 mt-3">
              <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
                <CButton onClick={() => setIsCharacteristicManagerOpen(true)}>
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
            <PersonCharacteristicManager
              showTitle
              onAddCharacteristic={addCharacteristicToTemplate}
              addedPersonCharacteristicIds={addedPersonCharacteristicIds}
            />
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
          <PersonCharacteristicManager
            showTitle={false}
            onAddCharacteristic={addCharacteristicToTemplate}
            addedPersonCharacteristicIds={addedPersonCharacteristicIds}
          />
        </CDialog>
      )}
      <SaveTallyTemplateDialog
        open={isSaveDialogOpen}
        finalized={saveAsFinalized}
        isRedirecting={isRedirecting}
        isSaving={isSaving}
        onClose={() => setIsSaveDialogOpen(false)}
        onFinalizedChange={setSaveAsFinalized}
        onSave={() => {
          void saveTallyTemplate();
        }}
      />
    </div>
  );
};

export default TallyTemplateClient;
