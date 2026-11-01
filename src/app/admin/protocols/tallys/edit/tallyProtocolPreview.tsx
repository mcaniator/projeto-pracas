"use client";

import {
  type PersonObservationState,
  changePersonObservationQuantity,
  serializePersonObservationState,
} from "@/app/admin/tallys/details/personObservationState";
import PersonsCounter from "@/app/admin/tallys/details/personsCounter";
import TallyPersonsDialog from "@/app/admin/tallys/details/tallyPersonsDialog";
import { buildFormPreviewSubmission } from "@/components/form/formPreviewUtils";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import { useFetchFormStructure } from "@/lib/serverFunctions/apiCalls/form";
import type { fetchFormStructureResponse } from "@/lib/serverFunctions/queries/form";
import type { GetTallySubmissionDataResult } from "@/lib/serverFunctions/queries/tally";
import { IconChartBar, IconEye } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import type { TallyProtocolDraftGroup } from "./tallyProtocolDraft";

const ResponseFormV2 = dynamic(
  () => import("@/components/ui/responseForm/responseFormV2"),
  {
    ssr: false,
    loading: () => <CLinearProgress label="Carregando prévia..." />,
  },
);

type TallyProtocolGroups =
  GetTallySubmissionDataResult["tallyProtocolStructure"]["tallyProtocolGroups"];

const buildTallyProtocolGroups = (
  groups: TallyProtocolDraftGroup[],
): TallyProtocolGroups =>
  groups.map((group) => ({
    id: group.personCharacteristicGroupId,
    position: group.position,
    displayMode: group.displayMode,
    personCharacteristicGroup: group.personCharacteristicGroup,
    characteristics: group.characteristics.map((characteristic) => ({
      id: characteristic.personCharacteristicId,
      position: characteristic.position,
      personCharacteristic: characteristic.personCharacteristic,
    })),
  }));

const TallyProtocolPreview = ({
  groups,
  selectedForm,
}: {
  groups: TallyProtocolDraftGroup[];
  selectedForm: { id: number; name: string } | null;
}) => {
  const [open, setOpen] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
  const [formStructure, setFormStructure] = useState<
    fetchFormStructureResponse["formStructure"] | undefined
  >();
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [personObservations, setPersonObservations] =
    useState<PersonObservationState>(() => new Map());
  const [fetchFormStructure] = useFetchFormStructure();
  const tallyProtocolGroups = useMemo(
    () => buildTallyProtocolGroups(groups),
    [groups],
  );
  const serializedPersonObservations = useMemo(
    () => serializePersonObservationState(personObservations),
    [personObservations],
  );
  const formSubmission = useMemo(
    () =>
      formStructure ? buildFormPreviewSubmission({ formStructure }) : undefined,
    [formStructure],
  );

  useEffect(() => {
    setPersonObservations(new Map());
  }, [groups, open]);

  useEffect(() => {
    if (!open || !selectedForm) {
      setFormStructure(undefined);
      setIsLoadingForm(false);
      return;
    }

    let isActive = true;
    setFormStructure(undefined);
    setIsLoadingForm(true);

    const loadFormStructure = async () => {
      try {
        const response = await fetchFormStructure({
          params: { formId: selectedForm.id },
        });
        if (isActive) {
          setFormStructure(response.data?.formStructure);
        }
      } catch {
        if (isActive) setFormStructure(undefined);
      } finally {
        if (isActive) setIsLoadingForm(false);
      }
    };

    void loadFormStructure();
    return () => {
      isActive = false;
    };
  }, [fetchFormStructure, open, selectedForm]);

  const personsCounter = (
    <PersonsCounter
      groups={tallyProtocolGroups}
      personObservations={personObservations}
      readOnly={false}
      onQuantityChange={(personCharacteristicIds, delta) => {
        setPersonObservations((current) =>
          changePersonObservationQuantity({
            state: current,
            personCharacteristicIds,
            delta,
          }),
        );
      }}
    />
  );

  return (
    <>
      <CButton
        tooltip="Prévia do protocolo"
        aria-label="Abrir prévia do protocolo"
        onClick={() => setOpen(true)}
      >
        <IconEye />
      </CButton>
      <CDialog
        fullScreen
        title="Prévia do protocolo de contagem"
        cancelChildren={
          <>
            <IconChartBar />
            Estatísticas
          </>
        }
        onCancel={() => setIsStatisticsOpen(true)}
        open={open}
        onClose={() => setOpen(false)}
      >
        {isLoadingForm ?
          <div>
            <CLinearProgress label="Carregando formulário..." />
          </div>
        : formSubmission ?
          <div className="h-full min-h-0">
            <ResponseFormV2
              key={formSubmission.formStructure.formId}
              formSubmission={formSubmission}
              readOnly={false}
              footer={personsCounter}
              disableFilledQuestionsCounter
            />
          </div>
        : selectedForm ?
          <div className="flex h-full items-center justify-center text-sm text-gray-600">
            Não foi possível carregar o formulário selecionado.
          </div>
        : <div className="h-full overflow-auto">{personsCounter}</div>}
      </CDialog>
      <TallyPersonsDialog
        open={isStatisticsOpen}
        tallyProtocolStructure={{ tallyProtocolGroups }}
        personObservations={serializedPersonObservations}
        keepMounted={
          false // Needed for the dialog to appear in front of the current dialog
        }
        onClose={() => setIsStatisticsOpen(false)}
      />
    </>
  );
};

export default TallyProtocolPreview;
