"use client";

import PermissionGuard from "@/components/auth/permissionGuard";
import type { FormManagerRef } from "@/components/form/formManager/formManager";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import { useUpdateTallyProtocol } from "@/lib/serverFunctions/apiCalls/tally";
import type { FetchTallyProtocolStructureResponse } from "@/lib/serverFunctions/queries/tally";
import { useRouter } from "next-nprogress-bar";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import PersonCharacteristicManager from "./personCharacteristicManager/personCharacteristicManager";
import type {
  PersonCharacteristic,
  PersonCharacteristicGroup,
} from "./personCharacteristicManager/types";
import SaveTallyProtocolDialog from "./saveTallyProtocolDialog";
import {
  type TallyProtocolDraftGroup,
  buildTallyProtocolDraftGroups,
  reorderTallyProtocolDraftGroups,
  tallyProtocolGroupDisplayModes,
} from "./tallyProtocolDraft";
import TallyProtocolEditor from "./tallyProtocolEditor";

const TallyProtocolClient = ({
  tallyProtocol,
}: {
  tallyProtocol: FetchTallyProtocolStructureResponse["tallyProtocol"];
}) => {
  const router = useRouter();
  const formManagerRef = useRef<FormManagerRef>(null);
  const [templateName, setTemplateName] = useState(tallyProtocol.name);
  const [selectedForm, setSelectedForm] = useState<{
    id: number;
    name: string;
  } | null>(tallyProtocol.form);
  const [templateGroups, setTemplateGroups] = useState<
    TallyProtocolDraftGroup[]
  >(() =>
    buildTallyProtocolDraftGroups(tallyProtocol.tallyProtocolGroups),
  );
  const [isMobileView, setIsMobileView] = useState(true);
  const [isCharacteristicManagerOpen, setIsCharacteristicManagerOpen] =
    useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveAsFinalized, setSaveAsFinalized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [updateTallyProtocol, isSaving] = useUpdateTallyProtocol();
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
        const newGroup: TallyProtocolDraftGroup = {
          ...newGroupBase,
          position: currentGroups.length + 1,
          displayMode:
            currentGroups.length === 0 ?
              tallyProtocolGroupDisplayModes.COUNTERS
            : tallyProtocolGroupDisplayModes.COMMON,
        };

        return reorderTallyProtocolDraftGroups([...currentGroups, newGroup]);
      });
    },
    [templateGroups],
  );

  const saveTallyProtocol = async () => {
    if (!templateName.trim()) {
      enqueueSnackbar("Informe o nome do protocolo de contagem.", {
        variant: "error",
      });
      return;
    }

    try {
      const response = await updateTallyProtocol({
        data: {
          tallyProtocolId: tallyProtocol.id,
          formId: selectedForm?.id ?? null,
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

            return {
              ...baseGroup,
              position: group.position,
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

      formManagerRef.current?.reload();

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
            isMobileView || tallyProtocol.finalized ?
              "col-span-5"
            : "col-span-3"
          } overflow-auto`}
        >
          <TallyProtocolEditor
            formManagerRef={formManagerRef}
            tallyProtocol={tallyProtocol}
            name={templateName}
            onNameChange={setTemplateName}
            selectedForm={selectedForm}
            onSelectedFormChange={setSelectedForm}
            groups={templateGroups}
            onChangeGroups={setTemplateGroups}
            onSave={() => setIsSaveDialogOpen(true)}
          />
          {isMobileView && !tallyProtocol.finalized && (
            <div className="ml-2 mt-3">
              <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
                <CButton onClick={() => setIsCharacteristicManagerOpen(true)}>
                  Características
                </CButton>
              </PermissionGuard>
            </div>
          )}
        </div>
        {!isMobileView && !tallyProtocol.finalized && (
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
      {isMobileView && !tallyProtocol.finalized && (
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
      <SaveTallyProtocolDialog
        open={isSaveDialogOpen}
        finalized={saveAsFinalized}
        isRedirecting={isRedirecting}
        isSaving={isSaving}
        onClose={() => setIsSaveDialogOpen(false)}
        onFinalizedChange={setSaveAsFinalized}
        onSave={() => {
          void saveTallyProtocol();
        }}
      />
    </div>
  );
};

export default TallyProtocolClient;
