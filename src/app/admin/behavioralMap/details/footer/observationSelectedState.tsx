"use client";

import CButton from "@/components/ui/cButton";
import CColorViewer from "@/components/ui/cColorViewer";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import { IconArrowLeft } from "@tabler/icons-react";

type Details = FetchBehavioralMapDetailsResponse["behavioralMapDetails"];
type ProtocolGroups =
  Details["behavioralMapSubmission"]["behavioralMapProtocolStructure"]["behavioralMapProtocolGroups"];

const ObservationSelectedState = ({
  observation,
  groups,
  onClose,
}: {
  observation: {
    quantity: number;
    observedAt: Date;
    personCharacteristicIds: number[];
  };
  groups: ProtocolGroups;
  onClose: () => void;
}) => (
  <>
    <div className="min-h-0 flex-1 overflow-auto p-3">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">Observação selecionada</h2>
            <span className="text-sm text-gray-600">
              Data/hora:{" "}
              {dateTimeWithoutSecondsFormater.format(observation.observedAt)}
            </span>
          </div>
          <span className="shrink-0 rounded-full border border-blue-600 px-3 py-1 font-semibold text-blue-700">
            Quantidade: {observation.quantity}
          </span>
        </div>

        {groups.map((group) => {
          const selectedCharacteristics = group.characteristics.filter(
            ({ personCharacteristic }) =>
              observation.personCharacteristicIds.includes(
                personCharacteristic.id,
              ),
          );

          return (
            <section
              key={group.id}
              className="rounded-lg border border-gray-300 p-3"
            >
              <h3 className="mb-2 font-semibold">
                {group.personCharacteristicGroup.title}
              </h3>
              {selectedCharacteristics.length > 0 ?
                <div className="flex flex-wrap gap-2">
                  {selectedCharacteristics.map(({ personCharacteristic }) => (
                    <div
                      key={personCharacteristic.id}
                      className="flex items-center gap-2 rounded-full border px-3 py-2"
                      style={{ borderColor: personCharacteristic.color }}
                    >
                      <CColorViewer color={personCharacteristic.color} />
                      <CDynamicIcon iconKey={personCharacteristic.iconKey} />
                      <span>{personCharacteristic.name}</span>
                    </div>
                  ))}
                </div>
              : <p className="text-sm text-gray-500">
                  Nenhuma característica selecionada.
                </p>
              }
            </section>
          );
        })}
      </div>
    </div>

    <div className="flex justify-start border-t border-gray-300 p-3">
      <CButton onClick={onClose}>
        <IconArrowLeft />
        Voltar
      </CButton>
    </div>
  </>
);

export default ObservationSelectedState;
