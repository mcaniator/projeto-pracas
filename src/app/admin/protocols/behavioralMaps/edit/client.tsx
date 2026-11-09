"use client";

import PersonCharacteristicManager from "@/app/admin/protocols/tallys/edit/personCharacteristicManager/personCharacteristicManager";
import type {
  PersonCharacteristic,
  PersonCharacteristicGroup,
} from "@/app/admin/protocols/tallys/edit/personCharacteristicManager/types";
import PermissionGuard from "@/components/auth/permissionGuard";
import type { FormManagerRef } from "@/components/form/formManager/formManager";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import { useUpdateBehavioralMapProtocol } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import type { FetchBehavioralMapProtocolStructureResponse } from "@/lib/serverFunctions/queries/behavioralMapProtocolStructure";
import { useRouter } from "next-nprogress-bar";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useRef, useState } from "react";

import BehavioralMapProtocolEditor, {
  type BehavioralMapProtocolDraftGroup,
} from "./behavioralMapProtocolEditor";
import SaveBehavioralMapProtocolDialog from "./saveBehavioralMapProtocolDialog";

type BehavioralMapProtocol =
  FetchBehavioralMapProtocolStructureResponse["behavioralMapProtocol"];

const BehavioralMapProtocolClient = ({
  behavioralMapProtocol,
}: {
  behavioralMapProtocol: BehavioralMapProtocol;
}) => {
  const router = useRouter();
  const [protocolName, setProtocolName] = useState(behavioralMapProtocol.name);
  const [selectedForm, setSelectedForm] = useState<{
    id: number;
    name: string;
  } | null>(behavioralMapProtocol.form);
  const [groups, setGroups] = useState<BehavioralMapProtocolDraftGroup[]>(() =>
    behavioralMapProtocol.behavioralMapProtocolGroups.map((group) => ({
      id: `person-characteristic-group-${group.personCharacteristicGroup.id}`,
      personCharacteristicGroupId: group.personCharacteristicGroup.id,
      position: group.position,
      personCharacteristicGroup: group.personCharacteristicGroup,
      characteristics: group.characteristics.map((item) => ({
        id: `person-characteristic-${item.personCharacteristic.id}`,
        personCharacteristicId: item.personCharacteristic.id,
        position: item.position,
        personCharacteristic: item.personCharacteristic,
      })),
    })),
  );
  const formManagerRef = useRef<FormManagerRef>(null);
  const [isMobileView, setIsMobileView] = useState(true);
  const [isCharacteristicManagerOpen, setIsCharacteristicManagerOpen] =
    useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveAsFinalized, setSaveAsFinalized] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [updateProtocol, isSaving] = useUpdateBehavioralMapProtocol();
  const addedPersonCharacteristicIds = useMemo(
    () =>
      groups.flatMap((group) =>
        group.characteristics.map((item) => item.personCharacteristicId),
      ),
    [groups],
  );

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1000);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onAddCharacteristic = (
    characteristic: PersonCharacteristic,
    group: PersonCharacteristicGroup,
  ) => {
    const groupId = `person-characteristic-group-${group.id}`;
    const characteristicId = `person-characteristic-${characteristic.id}`;
    setGroups((current) => {
      const existing = current.find((item) => item.id === groupId);
      if (
        existing?.characteristics.some((item) => item.id === characteristicId)
      )
        return current;
      if (existing)
        return current.map((item) =>
          item.id === groupId ?
            {
              ...item,
              characteristics: [
                ...item.characteristics,
                {
                  id: characteristicId,
                  personCharacteristicId: characteristic.id,
                  position: item.characteristics.length + 1,
                  personCharacteristic: characteristic,
                },
              ],
            }
          : item,
        );
      return [
        ...current,
        {
          id: groupId,
          personCharacteristicGroupId: group.id,
          position: current.length + 1,
          personCharacteristicGroup: group,
          characteristics: [
            {
              id: characteristicId,
              personCharacteristicId: characteristic.id,
              position: 1,
              personCharacteristic: characteristic,
            },
          ],
        },
      ];
    });
  };

  const saveProtocol = async () => {
    if (!protocolName.trim()) {
      enqueueSnackbar("Informe o nome do protocolo de mapa comportamental.", {
        variant: "error",
      });
      return;
    }
    try {
      const response = await updateProtocol({
        data: {
          behavioralMapProtocolId: behavioralMapProtocol.id,
          formId: selectedForm?.id ?? null,
          name: protocolName,
          finalized: saveAsFinalized,
          groups: groups.map((group) => ({
            personCharacteristicGroupId: group.personCharacteristicGroupId,
            position: group.position,
            characteristics: group.characteristics.map((item) => ({
              personCharacteristicId: item.personCharacteristicId,
              position: item.position,
            })),
          })),
        },
        projectOptions: { loadingMessage: "Salvando..." },
      });
      if (response.responseInfo.statusCode !== 200) {
        enqueueSnackbar(
          response.responseInfo.message ??
            "Erro ao salvar protocolo de mapa comportamental.",
          { variant: "error" },
        );
        return;
      }
      formManagerRef.current?.reload();
      if (saveAsFinalized) {
        setIsRedirecting(true);
        void router.push("/admin/protocols?type=behavioralMap");
        return;
      }
      setIsSaveDialogOpen(false);
      void router.refresh();
    } catch {
      enqueueSnackbar("Erro ao salvar protocolo de mapa comportamental.", {
        variant: "error",
      });
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader title="Protocolo de mapa comportamental" />
      <div className="grid h-full grid-cols-5 gap-2 overflow-auto">
        <div
          className={`${
            isMobileView || behavioralMapProtocol.finalized ?
              "col-span-5"
            : "col-span-3"
          } overflow-auto`}
        >
          <BehavioralMapProtocolEditor
            behavioralMapProtocol={behavioralMapProtocol}
            name={protocolName}
            onNameChange={setProtocolName}
            selectedForm={selectedForm}
            onSelectedFormChange={setSelectedForm}
            formManagerRef={formManagerRef}
            groups={groups}
            onChangeGroups={setGroups}
            onSave={() => setIsSaveDialogOpen(true)}
          />
          {isMobileView && !behavioralMapProtocol.finalized && (
            <div className="ml-2 mt-3">
              <PermissionGuard requiresAnyRoles={["TALLY_MANAGER"]}>
                <CButton onClick={() => setIsCharacteristicManagerOpen(true)}>
                  Características
                </CButton>
              </PermissionGuard>
            </div>
          )}
        </div>
        {!isMobileView && !behavioralMapProtocol.finalized && (
          <div
            className="col-span-2 h-full overflow-auto"
            style={{
              borderLeft: "solid 1px gray",
              boxShadow: "-4px 0 6px -2px rgba(0, 0, 0, 0.3)",
            }}
          >
            <PersonCharacteristicManager
              showTitle
              onAddCharacteristic={onAddCharacteristic}
              addedPersonCharacteristicIds={addedPersonCharacteristicIds}
            />
          </div>
        )}
      </div>
      {isMobileView && !behavioralMapProtocol.finalized && (
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
            onAddCharacteristic={onAddCharacteristic}
            addedPersonCharacteristicIds={addedPersonCharacteristicIds}
          />
        </CDialog>
      )}
      <SaveBehavioralMapProtocolDialog
        open={isSaveDialogOpen}
        finalized={saveAsFinalized}
        isRedirecting={isRedirecting}
        isSaving={isSaving}
        onClose={() => setIsSaveDialogOpen(false)}
        onFinalizedChange={setSaveAsFinalized}
        onSave={() => void saveProtocol()}
      />
    </div>
  );
};

export default BehavioralMapProtocolClient;
