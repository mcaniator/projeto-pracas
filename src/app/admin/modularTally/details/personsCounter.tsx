"use client";

import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import CPersonCharacteristicLegend from "@/components/ui/personCharacteristic/cPersonCharacteristicLegend";
import type { GetModularTallySubmissionDataResult } from "@/lib/serverFunctions/queries/modularTally";
import { Paper } from "@mui/material";
import { IconMoodPlus, IconTrash } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { GrGroup } from "react-icons/gr";

import {
  type PersonObservationState,
  getPersonObservationKey,
} from "./personObservationState";

type ModularTallyTemplateStructure =
  GetModularTallySubmissionDataResult["modularTallyTemplateStructure"];
type TemplateGroup =
  ModularTallyTemplateStructure["tallyTemplateGroups"][number];
type TemplateCharacteristic = TemplateGroup["characteristics"][number];

const sortCharacteristics = (characteristics: TemplateCharacteristic[]) =>
  characteristics.slice().sort((a, b) => a.position - b.position);

const CounterButton = ({
  characteristic,
  count,
  readOnly,
  onIncrement,
  onDecrement,
}: {
  characteristic: TemplateCharacteristic;
  count: number;
  readOnly: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}) => (
  <div className="flex min-w-28 flex-col items-center">
    <h6 className="flex items-center gap-1 text-xl font-semibold">
      <CDynamicIcon iconKey={characteristic.personCharacteristic.iconKey} />
      {characteristic.personCharacteristic.name}
    </h6>
    <div className="flex w-20 flex-col gap-1">
      <CButton
        disabled={readOnly}
        sx={{
          width: "100%",
          fontSize: "20px",
          backgroundColor: characteristic.personCharacteristic.color,
          "&:hover": {
            backgroundColor: characteristic.personCharacteristic.color,
          },
        }}
        onClick={onIncrement}
      >
        {`+ ${count}`}
      </CButton>
      <CButton
        disabled={readOnly || count === 0}
        sx={{
          py: 0,
          width: "100%",
          fontSize: "20px",
          height: "24px",
          backgroundColor: characteristic.personCharacteristic.color,
          "&:hover": {
            backgroundColor: characteristic.personCharacteristic.color,
          },
        }}
        onClick={onDecrement}
      >
        -
      </CButton>
    </div>
  </div>
);

const PersonsCounter = ({
  modularTallyTemplateStructure,
  personObservations,
  readOnly,
  onQuantityChange,
}: {
  modularTallyTemplateStructure: ModularTallyTemplateStructure;
  personObservations: PersonObservationState;
  readOnly: boolean;
  onQuantityChange: (personCharacteristicIds: number[], delta: 1 | -1) => void;
}) => {
  const groups = modularTallyTemplateStructure.tallyTemplateGroups;
  const counterGroup = groups.find((group) => group.displayMode === "COUNTERS");
  const stateGroup = groups.find(
    (group) => group.displayMode === "SCREEN_CONTEXT_SELECTOR",
  );
  const commonGroups = groups.filter((group) => group.displayMode === "COMMON");

  const stateCharacteristics = useMemo(
    () => sortCharacteristics(stateGroup?.characteristics ?? []),
    [stateGroup],
  );
  const [selectedStateCharacteristicId, setSelectedStateCharacteristicId] =
    useState<number | undefined>(
      stateCharacteristics[0]?.personCharacteristic.id,
    );
  const [selectedCommonCharacteristicIds, setSelectedCommonCharacteristicIds] =
    useState<Map<number, number>>(
      () =>
        new Map(
          commonGroups
            .filter((group) => !group.personCharacteristicGroup.isTagGroup)
            .flatMap((group) => {
              const firstCharacteristic = sortCharacteristics(
                group.characteristics,
              )[0];
              return firstCharacteristic ?
                  [
                    [
                      group.id,
                      firstCharacteristic.personCharacteristic.id,
                    ] as const,
                  ]
                : [];
            }),
        ),
    );
  const [selectedTagCharacteristicIds, setSelectedTagCharacteristicIds] =
    useState<Set<number>>(() => new Set());

  const selectedStateCharacteristic = stateCharacteristics.find(
    (characteristic) =>
      characteristic.personCharacteristic.id === selectedStateCharacteristicId,
  );
  const selectedBaseCharacteristics = useMemo(
    () => [
      ...(selectedStateCharacteristic ? [selectedStateCharacteristic] : []),
      ...commonGroups.flatMap((group) =>
        group.characteristics.filter((characteristic) =>
          group.personCharacteristicGroup.isTagGroup ?
            selectedTagCharacteristicIds.has(
              characteristic.personCharacteristic.id,
            )
          : selectedCommonCharacteristicIds.get(group.id) ===
            characteristic.personCharacteristic.id,
        ),
      ),
    ],
    [
      commonGroups,
      selectedCommonCharacteristicIds,
      selectedStateCharacteristic,
      selectedTagCharacteristicIds,
    ],
  );

  const cycleStateCharacteristic = () => {
    if (stateCharacteristics.length < 2) return;
    const currentIndex = stateCharacteristics.findIndex(
      (characteristic) =>
        characteristic.personCharacteristic.id ===
        selectedStateCharacteristicId,
    );
    const nextIndex = (currentIndex + 1) % stateCharacteristics.length;
    setSelectedStateCharacteristicId(
      stateCharacteristics[nextIndex]?.personCharacteristic.id,
    );
  };

  const getCounterCharacteristics = (
    counterCharacteristic: TemplateCharacteristic,
  ) => [...selectedBaseCharacteristics, counterCharacteristic];

  const notifyPersonQuantityChange = (
    characteristics: TemplateCharacteristic[],
    delta: 1 | -1,
  ) => {
    const personWasAdded = delta === 1;

    enqueueSnackbar({
      anchorOrigin: { vertical: "top", horizontal: "center" },
      autoHideDuration: 3000,
      variant: "node",
      preventDuplicate: false,
      backgroundColor: personWasAdded ? "#43a047" : "#d32f2f",
      node: (
        <div className="flex items-center gap-2">
          <span>
            {personWasAdded ?
              <IconMoodPlus />
            : <IconTrash />}
          </span>
          <div className="flex flex-wrap gap-1">
            {characteristics.map((characteristic) => (
              <span
                key={characteristic.id}
                title={characteristic.personCharacteristic.name}
              >
                <CDynamicIcon
                  iconKey={characteristic.personCharacteristic.iconKey}
                />
              </span>
            ))}
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="py-2">
      <div className="mb-1 flex items-center gap-1 text-xl font-semibold">
        <GrGroup /> Pessoas
      </div>
      <Paper
        elevation={5}
        sx={{
          display: "flex",
          borderLeft: `4px solid ${selectedStateCharacteristic?.personCharacteristic.color ?? "transparent"}`,
        }}
      >
        <div className="flex w-full flex-col gap-3 p-2">
          {stateGroup && selectedStateCharacteristic && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {stateGroup.personCharacteristicGroup.title}:
              </span>
              <CButton
                sx={{
                  backgroundColor:
                    selectedStateCharacteristic.personCharacteristic.color,
                  color: "white",
                  "&:hover": {
                    backgroundColor:
                      selectedStateCharacteristic.personCharacteristic.color,
                  },
                }}
                onClick={cycleStateCharacteristic}
              >
                <span className="flex items-center gap-1">
                  <CDynamicIcon
                    iconKey={
                      selectedStateCharacteristic.personCharacteristic.iconKey
                    }
                  />
                  {selectedStateCharacteristic.personCharacteristic.name}
                </span>
              </CButton>
            </div>
          )}

          {commonGroups.map((group) => {
            const characteristics = sortCharacteristics(group.characteristics);

            return (
              <div
                key={group.id}
                className="flex flex-col gap-2 rounded border border-gray-300 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-semibold">
                    {group.personCharacteristicGroup.title}
                  </h5>
                  {!group.personCharacteristicGroup.isTagGroup && (
                    <CPersonCharacteristicLegend
                      title={group.personCharacteristicGroup.title}
                      characteristics={characteristics}
                    />
                  )}
                </div>
                {group.personCharacteristicGroup.isTagGroup ?
                  <div className="flex flex-wrap justify-center gap-2">
                    {characteristics.map((characteristic) => {
                      const characteristicId =
                        characteristic.personCharacteristic.id;
                      return (
                        <CCheckbox
                          key={characteristic.id}
                          checked={selectedTagCharacteristicIds.has(
                            characteristicId,
                          )}
                          sx={{
                            "&.Mui-checked": {
                              color: characteristic.personCharacteristic.color,
                            },
                          }}
                          label={
                            <span className="flex items-center gap-1">
                              <CDynamicIcon
                                iconKey={
                                  characteristic.personCharacteristic.iconKey
                                }
                              />
                              {characteristic.personCharacteristic.name}
                            </span>
                          }
                          onChange={(event) => {
                            setSelectedTagCharacteristicIds((current) => {
                              const next = new Set(current);
                              if (event.target.checked) {
                                next.add(characteristicId);
                              } else {
                                next.delete(characteristicId);
                              }
                              return next;
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                : <div className="flex justify-center">
                    <CToggleButtonGroup
                      options={characteristics}
                      value={selectedCommonCharacteristicIds.get(group.id)}
                      toggleButtonSx={{
                        padding: { xs: "8px" },
                        fontSize: "32px",
                      }}
                      getToggleButtonColor={(characteristic) =>
                        characteristic.personCharacteristic.color
                      }
                      getLabel={(characteristic) => (
                        <CDynamicIcon
                          iconKey={characteristic.personCharacteristic.iconKey}
                        />
                      )}
                      getValue={(characteristic) =>
                        characteristic.personCharacteristic.id
                      }
                      getTooltip={(characteristic) =>
                        characteristic.personCharacteristic.name
                      }
                      onChange={(_, characteristic) => {
                        setSelectedCommonCharacteristicIds((current) => {
                          const next = new Map(current);
                          next.set(
                            group.id,
                            characteristic.personCharacteristic.id,
                          );
                          return next;
                        });
                      }}
                    />
                  </div>
                }
              </div>
            );
          })}

          {counterGroup && (
            <div className="mt-2">
              <h5 className="mb-2 font-semibold">
                {counterGroup.personCharacteristicGroup.title}
              </h5>
              <div className="flex min-h-24 flex-wrap justify-center gap-5 rounded p-1">
                {sortCharacteristics(counterGroup.characteristics).map(
                  (characteristic) => {
                    const characteristics =
                      getCounterCharacteristics(characteristic);
                    const characteristicIds = characteristics.map(
                      ({ personCharacteristic }) => personCharacteristic.id,
                    );
                    const count =
                      personObservations.get(
                        getPersonObservationKey(characteristicIds),
                      )?.quantity ?? 0;

                    return (
                      <CounterButton
                        key={characteristic.id}
                        characteristic={characteristic}
                        count={count}
                        readOnly={readOnly}
                        onIncrement={() => {
                          onQuantityChange(characteristicIds, 1);
                          notifyPersonQuantityChange(characteristics, 1);
                        }}
                        onDecrement={() => {
                          onQuantityChange(characteristicIds, -1);
                          notifyPersonQuantityChange(characteristics, -1);
                        }}
                      />
                    );
                  },
                )}
              </div>
            </div>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default PersonsCounter;
