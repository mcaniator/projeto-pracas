"use client";

import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CColorViewer from "@/components/ui/cColorViewer";
import CCounterButtons from "@/components/ui/cCounterButtons";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import { IconArrowLeft, IconArrowRight, IconCheck } from "@tabler/icons-react";
import { useMemo, useState } from "react";

type Details = FetchBehavioralMapDetailsResponse["behavioralMapDetails"];
type ProtocolGroups =
  Details["behavioralMapSubmission"]["behavioralMapProtocolStructure"]["behavioralMapProtocolGroups"];

const AddingObservationState = ({
  groups,
  observedAt,
  onCancel,
  onSubmitObservation,
}: {
  groups: ProtocolGroups;
  observedAt: Date;
  onCancel: () => void;
  onSubmitObservation: (
    personCharacteristicIds: number[],
    quantity: number,
  ) => void;
}) => {
  const [groupIndex, setGroupIndex] = useState(0);
  const [selectedCharacteristicsByGroup, setSelectedCharacteristicsByGroup] =
    useState<Record<number, number[]>>({});
  const [isQuantityStep, setIsQuantityStep] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const currentGroup = groups[groupIndex];
  const currentSelection =
    currentGroup ? (selectedCharacteristicsByGroup[currentGroup.id] ?? []) : [];
  const selectedIds = useMemo(
    () =>
      groups.flatMap((group) => selectedCharacteristicsByGroup[group.id] ?? []),
    [groups, selectedCharacteristicsByGroup],
  );

  const toggleCharacteristic = (
    characteristicId: number,
    isSelected: boolean,
  ) => {
    if (!currentGroup) return;

    setSelectedCharacteristicsByGroup((current) => {
      const selected = current[currentGroup.id] ?? [];
      const next =
        currentGroup.personCharacteristicGroup.isTagGroup ?
          isSelected ? [...selected, characteristicId]
          : selected.filter((id) => id !== characteristicId)
        : [characteristicId];

      return { ...current, [currentGroup.id]: next };
    });
  };

  const canAdvance =
    !!currentGroup?.personCharacteristicGroup.isTagGroup ||
    currentSelection.length > 0;

  const goBack = () => {
    if (isQuantityStep) {
      setIsQuantityStep(false);
      setGroupIndex(Math.max(groups.length - 1, 0));
    } else if (groupIndex > 0) {
      setGroupIndex((index) => index - 1);
    } else {
      onCancel();
    }
  };

  const goForward = () => {
    if (!canAdvance) return;

    if (groupIndex < groups.length - 1) {
      setGroupIndex((index) => index + 1);
    } else {
      setIsQuantityStep(true);
    }
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <p className="mb-3 text-sm text-gray-600">
          Data/hora da observação:{" "}
          {dateTimeWithoutSecondsFormater.format(observedAt)}
        </p>
        {isQuantityStep ?
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <h2 className="text-lg font-semibold">Quantidade de pessoas</h2>
            <CCounterButtons
              count={quantity}
              min={1}
              onIncrement={() => setQuantity((value) => value + 1)}
              onDecrement={() => setQuantity((value) => Math.max(1, value - 1))}
            />
          </div>
        : currentGroup ?
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">
                {currentGroup.personCharacteristicGroup.title}
              </h2>
              <span className="shrink-0 text-sm text-gray-600">
                Grupo {groupIndex + 1} de {groups.length}
              </span>
            </div>

            {currentGroup.personCharacteristicGroup.isTagGroup && (
              <p className="text-sm text-gray-600">
                Selecione as características que se aplicam. Este grupo é
                opcional.
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {currentGroup.characteristics.map(({ personCharacteristic }) => {
                const characteristicId = personCharacteristic.id;
                const isSelected = currentSelection.includes(characteristicId);
                const color = personCharacteristic.color;

                return currentGroup.personCharacteristicGroup.isTagGroup ?
                    <div
                      key={characteristicId}
                      className="flex min-h-14 items-center rounded-lg border p-2"
                      style={{
                        borderColor: isSelected ? color : "#d1d5db",
                        backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                      }}
                    >
                      <CCheckbox
                        checked={isSelected}
                        onChange={(event) =>
                          toggleCharacteristic(
                            characteristicId,
                            event.target.checked,
                          )
                        }
                        sx={{
                          "&.Mui-checked": { color },
                        }}
                        formControlLabelSx={{
                          margin: 0,
                          width: "100%",
                        }}
                        label={
                          <span className="flex items-center gap-2">
                            <CColorViewer color={color} />
                            <CDynamicIcon
                              iconKey={personCharacteristic.iconKey}
                            />
                            <span>{personCharacteristic.name}</span>
                          </span>
                        }
                      />
                    </div>
                  : <button
                      key={characteristicId}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        toggleCharacteristic(characteristicId, true)
                      }
                      className="flex min-h-16 items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors"
                      style={{
                        borderColor: isSelected ? color : "#d1d5db",
                        backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                      }}
                    >
                      <CColorViewer color={color} />
                      <CDynamicIcon iconKey={personCharacteristic.iconKey} />
                      <span className="font-medium">
                        {personCharacteristic.name}
                      </span>
                    </button>;
              })}
            </div>
          </div>
        : <div className="flex h-full items-center justify-center text-center">
            Este protocolo não possui grupos de características.
          </div>
        }
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-gray-300 p-3">
        <CButton onClick={goBack}>
          <IconArrowLeft />
          {groupIndex === 0 && !isQuantityStep ? "Cancelar" : "Voltar"}
        </CButton>

        {isQuantityStep ?
          <CButton
            disabled={quantity < 1}
            onClick={() => onSubmitObservation(selectedIds, quantity)}
          >
            <IconCheck />
            Adicionar
          </CButton>
        : <CButton disabled={!canAdvance} onClick={goForward}>
            Avançar
            <IconArrowRight />
          </CButton>
        }
      </div>
    </>
  );
};

export default AddingObservationState;
