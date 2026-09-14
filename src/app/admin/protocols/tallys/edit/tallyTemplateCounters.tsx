"use client";

import CAutocomplete from "@/components/ui/cAutoComplete";
import CButton from "@/components/ui/cButton";
import CColorViewer from "@/components/ui/cColorViewer";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import CPersonCharacteristicGroupTypeChip from "@/components/ui/personCharacteristic/cPersonCharacteristicGroupTypeChip";
import CPersonCharacteristicLegend from "@/components/ui/personCharacteristic/cPersonCharacteristicLegend";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Chip, Paper } from "@mui/material";
import {
  IconAlertTriangle,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import {
  type TallyTemplateDraftCharacteristic,
  type TallyTemplateDraftGroup,
  type TallyTemplateDraftSpecialGroup,
  isTallyTemplateDraftCommonGroup,
  tallyTemplateGroupDisplayModes,
} from "./tallyTemplateDraft";

const sortByPosition = <T extends { position: number }>(items: T[]) =>
  items.slice().sort((first, second) => first.position - second.position);

const getReorderedItems = <T extends { id: string; position: number }>(
  items: T[],
  activeId: string,
  overId: string,
) => {
  const sortedItems = sortByPosition(items);
  const oldIndex = sortedItems.findIndex((item) => item.id === activeId);
  const newIndex = sortedItems.findIndex((item) => item.id === overId);
  if (oldIndex === -1 || newIndex === -1) return items;

  return arrayMove(sortedItems, oldIndex, newIndex).map((item, index) => ({
    ...item,
    position: index + 1,
  }));
};

const SortableCounterCharacteristic = ({
  characteristic,
  isFinalized,
  onRemove,
}: {
  characteristic: TallyTemplateDraftCharacteristic;
  isFinalized: boolean;
  onRemove: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: characteristic.id });

  return (
    <div
      ref={setNodeRef}
      {...(!isFinalized ? attributes : {})}
      className="flex min-w-28 flex-col items-center rounded border border-gray-300 bg-white px-3 py-2 text-center shadow-sm"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
    >
      <div
        {...(!isFinalized ? listeners : {})}
        className={`flex items-center gap-1 text-sm font-semibold ${
          isFinalized ? "" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        {!isFinalized && <IconGripVertical size={18} />}
        <CColorViewer color={characteristic.personCharacteristic.color} />
        <CDynamicIcon iconKey={characteristic.personCharacteristic.iconKey} />
        <span>{characteristic.personCharacteristic.name}</span>
      </div>
      <span className="mt-1 text-2xl font-bold text-primary">0</span>
      {!isFinalized && (
        <CButton
          dense
          disableMinWidth
          variant="text"
          color="error"
          tooltip="Remover característica"
          aria-label={`Remover ${characteristic.personCharacteristic.name}`}
          onClick={onRemove}
        >
          <IconTrash size={18} />
        </CButton>
      )}
    </div>
  );
};

const SortableCommonCharacteristic = ({
  characteristic,
  isFinalized,
  onRemove,
}: {
  characteristic: TallyTemplateDraftCharacteristic;
  isFinalized: boolean;
  onRemove: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: characteristic.id });

  return (
    <div
      ref={setNodeRef}
      {...(!isFinalized ? attributes : {})}
      {...(!isFinalized ? listeners : {})}
      className={`flex items-center gap-1 rounded border border-gray-300 bg-white p-2 ${
        isFinalized ? "" : "cursor-grab active:cursor-grabbing"
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
    >
      {!isFinalized && <IconGripVertical size={18} />}
      <CColorViewer color={characteristic.personCharacteristic.color} />
      <CDynamicIcon iconKey={characteristic.personCharacteristic.iconKey} />
      {!isFinalized && (
        <CButton
          dense
          disableMinWidth
          variant="text"
          color="error"
          tooltip="Remover característica"
          aria-label={`Remover ${characteristic.personCharacteristic.name}`}
          onClick={onRemove}
        >
          <IconTrash size={18} />
        </CButton>
      )}
    </div>
  );
};

const SortableCommonGroup = ({
  group,
  isFinalized,
  onReorderCharacteristics,
  onRemoveCharacteristic,
}: {
  group: TallyTemplateDraftGroup;
  isFinalized: boolean;
  onReorderCharacteristics: (
    groupId: string,
    activeId: string,
    overId: string,
  ) => void;
  onRemoveCharacteristic: (groupId: string, characteristicId: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });
  const characteristicSensors = useSensors(useSensor(PointerSensor));
  const [isDraggingCharacteristics, setIsDraggingCharacteristics] =
    useState(false);
  const characteristics = sortByPosition(group.characteristics);

  const handleCharacteristicDragEnd = ({ active, over }: DragEndEvent) => {
    setIsDraggingCharacteristics(false);
    if (!over || active.id === over.id) return;
    onReorderCharacteristics(group.id, String(active.id), String(over.id));
  };

  return (
    <div
      ref={setNodeRef}
      className="rounded border border-gray-300 bg-slate-50 p-3"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div
          {...(!isFinalized ? attributes : {})}
          {...(!isFinalized ? listeners : {})}
          className={`flex items-center gap-1 ${
            isFinalized ? "" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          {!isFinalized && <IconGripVertical size={18} />}
          <CPersonCharacteristicGroupTypeChip
            isTagGroup={group.personCharacteristicGroup.isTagGroup}
          />
          <h5 className="font-semibold">
            {group.personCharacteristicGroup.title}
          </h5>
        </div>
        <CPersonCharacteristicLegend
          title={group.personCharacteristicGroup.title}
          characteristics={characteristics.map((characteristic) => ({
            id: characteristic.id,
            name: characteristic.personCharacteristic.name,
            iconKey: characteristic.personCharacteristic.iconKey,
            color: characteristic.personCharacteristic.color,
          }))}
        />
      </div>
      <DndContext
        sensors={isFinalized ? undefined : characteristicSensors}
        collisionDetection={pointerWithin}
        onDragStart={
          isFinalized ? undefined : () => setIsDraggingCharacteristics(true)
        }
        onDragEnd={isFinalized ? undefined : handleCharacteristicDragEnd}
        onDragCancel={
          isFinalized ? undefined : () => setIsDraggingCharacteristics(false)
        }
      >
        <SortableContext
          items={characteristics.map((characteristic) => characteristic.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div
            className={`flex min-h-12 flex-wrap gap-2 rounded p-1 ${
              isDraggingCharacteristics ? "bg-green-50" : ""
            }`}
          >
            {characteristics.map((characteristic) => (
              <SortableCommonCharacteristic
                key={characteristic.id}
                characteristic={characteristic}
                isFinalized={isFinalized}
                onRemove={() =>
                  onRemoveCharacteristic(group.id, characteristic.id)
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const TallyTemplateCounters = ({
  groups,
  isFinalized,
  onChangeGroups,
}: {
  groups: TallyTemplateDraftGroup[];
  isFinalized: boolean;
  onChangeGroups: (groups: TallyTemplateDraftGroup[]) => void;
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const [isDraggingCommonGroups, setIsDraggingCommonGroups] = useState(false);
  const [isDraggingCounters, setIsDraggingCounters] = useState(false);
  const counterGroup = groups.find(
    (group) => group.displayMode === tallyTemplateGroupDisplayModes.COUNTERS,
  );
  const screenContextGroup = groups.find(
    (group) =>
      group.displayMode ===
      tallyTemplateGroupDisplayModes.SCREEN_CONTEXT_SELECTOR,
  );
  const screenContextGroupOptions = groups.filter(
    (group) => group.id !== counterGroup?.id,
  );
  const commonGroups = sortByPosition(
    groups.filter(isTallyTemplateDraftCommonGroup),
  );
  const [
    activeScreenContextCharacteristicId,
    setActiveScreenContextCharacteristicId,
  ] = useState<string>();
  const screenContextCharacteristics = useMemo(
    () => sortByPosition(screenContextGroup?.characteristics ?? []),
    [screenContextGroup],
  );
  const activeScreenContextCharacteristic = screenContextCharacteristics.find(
    (characteristic) =>
      characteristic.id === activeScreenContextCharacteristicId,
  );

  useEffect(() => {
    if (
      !activeScreenContextCharacteristic ||
      !screenContextCharacteristics.some(
        (characteristic) =>
          characteristic.id === activeScreenContextCharacteristicId,
      )
    ) {
      setActiveScreenContextCharacteristicId(
        screenContextCharacteristics[0]?.id,
      );
    }
  }, [
    activeScreenContextCharacteristic,
    activeScreenContextCharacteristicId,
    screenContextCharacteristics,
  ]);

  const changeDisplayMode = (
    nextMode: TallyTemplateDraftSpecialGroup["displayMode"],
    groupId: string | undefined,
  ) => {
    const currentSpecialGroup = groups.find(
      (group) => group.displayMode === nextMode,
    );
    const nextCommonPosition =
      Math.max(0, ...commonGroups.map((group) => group.position)) + 1;

    onChangeGroups(
      groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            displayMode: nextMode,
            position: null,
          };
        }
        if (group.id === currentSpecialGroup?.id) {
          return {
            ...group,
            displayMode: tallyTemplateGroupDisplayModes.COMMON,
            position: nextCommonPosition,
          };
        }
        return group;
      }),
    );
  };

  const handleCommonGroupDragEnd = ({ active, over }: DragEndEvent) => {
    setIsDraggingCommonGroups(false);
    if (!over || active.id === over.id) return;
    const oldIndex = commonGroups.findIndex(
      (group) => group.id === String(active.id),
    );
    const newIndex = commonGroups.findIndex(
      (group) => group.id === String(over.id),
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const commonGroupPositions = commonGroups.map((group) => group.position);
    const reorderedGroups = arrayMove(commonGroups, oldIndex, newIndex).map(
      (group, index) => ({
        ...group,
        position: commonGroupPositions[index]!,
      }),
    );
    const reorderedGroupsById = new Map(
      reorderedGroups.map((group) => [group.id, group]),
    );
    onChangeGroups(
      groups.map((group) => reorderedGroupsById.get(group.id) ?? group),
    );
  };

  const reorderCharacteristics = (
    groupId: string,
    activeId: string,
    overId: string,
  ) => {
    onChangeGroups(
      groups.map((group) =>
        group.id === groupId ?
          {
            ...group,
            characteristics: getReorderedItems(
              group.characteristics,
              activeId,
              overId,
            ),
          }
        : group,
      ),
    );
  };

  const removeCharacteristic = (groupId: string, characteristicId: string) => {
    const nextGroups = groups.flatMap((group) => {
      if (group.id !== groupId) return [group];

      const characteristics = group.characteristics.filter(
        (characteristic) => characteristic.id !== characteristicId,
      );
      if (characteristics.length === 0) return [];

      return [
        {
          ...group,
          characteristics: characteristics.map((characteristic, index) => ({
            ...characteristic,
            position: index + 1,
          })),
        },
      ];
    });
    onChangeGroups(nextGroups);
  };

  const handleCounterDragEnd = ({ active, over }: DragEndEvent) => {
    setIsDraggingCounters(false);
    if (!counterGroup || !over || active.id === over.id) return;
    reorderCharacteristics(counterGroup.id, String(active.id), String(over.id));
  };

  const cycleScreenContextCharacteristic = () => {
    if (screenContextCharacteristics.length < 2) return;
    const currentIndex = screenContextCharacteristics.findIndex(
      (characteristic) =>
        characteristic.id === activeScreenContextCharacteristicId,
    );
    const nextIndex = (currentIndex + 1) % screenContextCharacteristics.length;
    setActiveScreenContextCharacteristicId(
      screenContextCharacteristics[nextIndex]?.id,
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xl font-semibold">Contador</h4>

      {!isFinalized && groups.length > 0 && (
        <div className="flex flex-col gap-3 rounded border border-gray-300 bg-slate-50 p-3">
          <h5 className="font-semibold">Configurações de contador</h5>
          <CAutocomplete
            label="Grupo de contadores"
            options={groups}
            error={counterGroup === undefined}
            value={counterGroup ?? null}
            getOptionLabel={(group) => group.personCharacteristicGroup.title}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disableClearable={counterGroup !== undefined}
            onChange={(_, group) =>
              changeDisplayMode(
                tallyTemplateGroupDisplayModes.COUNTERS,
                group?.id,
              )
            }
          />
          <CAutocomplete
            label="Grupo de estado (opcional)"
            options={screenContextGroupOptions}
            value={screenContextGroup ?? null}
            getOptionLabel={(group) => group.personCharacteristicGroup.title}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, group) =>
              changeDisplayMode(
                tallyTemplateGroupDisplayModes.SCREEN_CONTEXT_SELECTOR,
                group?.id,
              )
            }
          />
        </div>
      )}

      {groups.length === 0 ?
        <div className="rounded border border-dashed border-gray-400 p-4 text-sm text-gray-600">
          Adicione características para montar a contagem.
        </div>
      : <Paper
          elevation={5}
          sx={{
            display: "flex",
            borderLeft: `4px solid ${
              activeScreenContextCharacteristic?.personCharacteristic.color ??
              "transparent"
            }`,
          }}
        >
          <div className="flex flex-col gap-3 p-2">
            {screenContextGroup && activeScreenContextCharacteristic && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {screenContextGroup.personCharacteristicGroup.title}:
                </span>
                <CButton
                  variant="contained"
                  sx={{
                    backgroundColor:
                      activeScreenContextCharacteristic.personCharacteristic
                        .color,
                    color: "white",
                    "&:hover": {
                      backgroundColor:
                        activeScreenContextCharacteristic.personCharacteristic
                          .color,
                    },
                  }}
                  onClick={cycleScreenContextCharacteristic}
                >
                  <span className="flex items-center gap-1">
                    <CDynamicIcon
                      iconKey={
                        activeScreenContextCharacteristic.personCharacteristic
                          .iconKey
                      }
                    />
                    {
                      activeScreenContextCharacteristic.personCharacteristic
                        .name
                    }
                  </span>
                </CButton>
                {!isFinalized && (
                  <CButton
                    dense
                    disableMinWidth
                    variant="text"
                    color="error"
                    tooltip="Remover característica"
                    aria-label={`Remover ${activeScreenContextCharacteristic.personCharacteristic.name}`}
                    onClick={() =>
                      removeCharacteristic(
                        screenContextGroup.id,
                        activeScreenContextCharacteristic.id,
                      )
                    }
                  >
                    <IconTrash size={18} />
                  </CButton>
                )}
              </div>
            )}

            {commonGroups.length > 0 && (
              <DndContext
                sensors={isFinalized ? undefined : sensors}
                collisionDetection={pointerWithin}
                onDragStart={
                  isFinalized ? undefined : (
                    () => setIsDraggingCommonGroups(true)
                  )
                }
                onDragEnd={isFinalized ? undefined : handleCommonGroupDragEnd}
                onDragCancel={
                  isFinalized ? undefined : (
                    () => setIsDraggingCommonGroups(false)
                  )
                }
              >
                <SortableContext
                  items={commonGroups.map((group) => group.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className={`flex flex-col gap-3 rounded p-1 ${
                      isDraggingCommonGroups ? "bg-green-50" : ""
                    }`}
                  >
                    {commonGroups.map((group) => (
                      <SortableCommonGroup
                        key={group.id}
                        group={group}
                        isFinalized={isFinalized}
                        onReorderCharacteristics={reorderCharacteristics}
                        onRemoveCharacteristic={removeCharacteristic}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {counterGroup ?
              <div className="mt-2">
                <h5 className="mb-2 font-semibold">
                  {counterGroup.personCharacteristicGroup.title}
                </h5>
                <DndContext
                  sensors={isFinalized ? undefined : sensors}
                  collisionDetection={pointerWithin}
                  onDragStart={
                    isFinalized ? undefined : () => setIsDraggingCounters(true)
                  }
                  onDragEnd={isFinalized ? undefined : handleCounterDragEnd}
                  onDragCancel={
                    isFinalized ? undefined : () => setIsDraggingCounters(false)
                  }
                >
                  <SortableContext
                    items={sortByPosition(counterGroup.characteristics).map(
                      (characteristic) => characteristic.id,
                    )}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div
                      className={`flex min-h-24 flex-wrap gap-3 rounded p-1 ${
                        isDraggingCounters ? "bg-green-50" : ""
                      }`}
                    >
                      {sortByPosition(counterGroup.characteristics).map(
                        (characteristic) => (
                          <SortableCounterCharacteristic
                            key={characteristic.id}
                            characteristic={characteristic}
                            isFinalized={isFinalized}
                            onRemove={() =>
                              removeCharacteristic(
                                counterGroup.id,
                                characteristic.id,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            : <Chip
                icon={<IconAlertTriangle />}
                label="Selecione um grupo de contadores nas configurações."
                color="error"
              />
            }
          </div>{" "}
        </Paper>
      }
    </div>
  );
};

export default TallyTemplateCounters;
