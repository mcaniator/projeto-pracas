"use client";

import type { FormManagerRef } from "@/components/form/formManager/formManager";
import CButton from "@/components/ui/cButton";
import CColorViewer from "@/components/ui/cColorViewer";
import CTextField from "@/components/ui/cTextField";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import CPersonCharacteristicGroupTypeChip from "@/components/ui/personCharacteristic/cPersonCharacteristicGroupTypeChip";
import type { FetchBehavioralMapProtocolStructureResponse } from "@/lib/serverFunctions/queries/behavioralMapProtocolStructure";
import {
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
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
import { Divider } from "@mui/material";
import { IconGripVertical, IconTrash } from "@tabler/icons-react";
import type { RefObject } from "react";

import BehavioralMapProtocolFormManager from "./behavioralMapProtocolFormManager";

type BehavioralMapProtocol =
  FetchBehavioralMapProtocolStructureResponse["behavioralMapProtocol"];
export type BehavioralMapProtocolDraftGroup = {
  id: string;
  personCharacteristicGroupId: number;
  position: number;
  personCharacteristicGroup: { id: number; title: string; isTagGroup: boolean };
  characteristics: {
    id: string;
    personCharacteristicId: number;
    position: number;
    personCharacteristic: {
      id: number;
      name: string;
      iconKey: string;
      color: string;
    };
  }[];
};

const pointerWithinOrClosestCenter: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  return pointerCollisions.length ? pointerCollisions : closestCenter(args);
};

const SortableCharacteristic = ({
  item,
  isFinalized,
  onRemove,
}: {
  item: BehavioralMapProtocolDraftGroup["characteristics"][number];
  isFinalized: boolean;
  onRemove: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
      className="flex items-center gap-2 rounded border border-gray-300 bg-white p-2"
    >
      <div
        {...(!isFinalized ? attributes : {})}
        {...(!isFinalized ? listeners : {})}
        className={`flex items-center gap-2 ${isFinalized ? "" : "cursor-grab active:cursor-grabbing"}`}
      >
        {!isFinalized && <IconGripVertical size={18} />}
        <CColorViewer color={item.personCharacteristic.color} />
        <CDynamicIcon iconKey={item.personCharacteristic.iconKey} />
        <span>{item.personCharacteristic.name}</span>
      </div>
      {!isFinalized && (
        <button
          type="button"
          aria-label={`Remover ${item.personCharacteristic.name}`}
          className="text-red-600"
          onClick={() => onRemove(item.id)}
        >
          <IconTrash size={18} />
        </button>
      )}
    </div>
  );
};

const SortableGroup = ({
  group,
  isFinalized,
  onRemove,
  onReorderCharacteristics,
}: {
  group: BehavioralMapProtocolDraftGroup;
  isFinalized: boolean;
  onRemove: (id: string) => void;
  onReorderCharacteristics: (groupId: string, event: DragEndEvent) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });
  return (
    <section
      ref={setNodeRef}
      className="rounded border border-gray-300 bg-slate-50 p-3"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
    >
      <header
        {...(!isFinalized ? attributes : {})}
        {...(!isFinalized ? listeners : {})}
        className={`mb-2 flex items-center gap-2 ${isFinalized ? "" : "cursor-grab active:cursor-grabbing"}`}
      >
        {!isFinalized && <IconGripVertical size={18} />}
        <CPersonCharacteristicGroupTypeChip
          isTagGroup={group.personCharacteristicGroup.isTagGroup}
        />
        <strong>{group.personCharacteristicGroup.title}</strong>
      </header>
      <DndContext
        sensors={isFinalized ? undefined : useSensors(useSensor(PointerSensor))}
        collisionDetection={pointerWithinOrClosestCenter}
        onDragEnd={
          isFinalized ? undefined : (
            (event) => onReorderCharacteristics(group.id, event)
          )
        }
      >
        <SortableContext
          items={group.characteristics.map((item) => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {group.characteristics.map((item) => (
              <SortableCharacteristic
                key={item.id}
                item={item}
                isFinalized={isFinalized}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
};

const BehavioralMapProtocolEditor = ({
  behavioralMapProtocol,
  name,
  onNameChange,
  selectedForm,
  onSelectedFormChange,
  formManagerRef,
  groups,
  onChangeGroups,
  onSave,
}: {
  behavioralMapProtocol: BehavioralMapProtocol;
  name: string;
  onNameChange: (name: string) => void;
  selectedForm: { id: number; name: string } | null;
  onSelectedFormChange: (form: { id: number; name: string } | null) => void;
  formManagerRef: RefObject<FormManagerRef | null>;
  groups: BehavioralMapProtocolDraftGroup[];
  onChangeGroups: (groups: BehavioralMapProtocolDraftGroup[]) => void;
  onSave: () => void;
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const reorderGroups = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = groups.findIndex((group) => group.id === String(active.id));
    const to = groups.findIndex((group) => group.id === String(over.id));
    if (from < 0 || to < 0) return;
    onChangeGroups(
      arrayMove(groups, from, to).map((group, index) => ({
        ...group,
        position: index + 1,
      })),
    );
  };
  const reorderCharacteristics = (
    groupId: string,
    { active, over }: DragEndEvent,
  ) => {
    if (!over || active.id === over.id) return;
    onChangeGroups(
      groups.map((group) => {
        if (group.id !== groupId) return group;
        const from = group.characteristics.findIndex(
          (item) => item.id === String(active.id),
        );
        const to = group.characteristics.findIndex(
          (item) => item.id === String(over.id),
        );
        return from < 0 || to < 0 ?
            group
          : {
              ...group,
              characteristics: arrayMove(group.characteristics, from, to).map(
                (item, index) => ({ ...item, position: index + 1 }),
              ),
            };
      }),
    );
  };
  const removeCharacteristic = (characteristicId: string) =>
    onChangeGroups(
      groups
        .flatMap((group) => {
          const characteristics = group.characteristics
            .filter((item) => item.id !== characteristicId)
            .map((item, index) => ({ ...item, position: index + 1 }));
          return characteristics.length ? [{ ...group, characteristics }] : [];
        })
        .map((group, index) => ({ ...group, position: index + 1 })),
    );
  return (
    <div className="ml-1 mr-2 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <CTextField
          label="Nome"
          value={name}
          readOnly={behavioralMapProtocol.finalized}
          onChange={(event) => onNameChange(event.target.value)}
        />
        {!behavioralMapProtocol.finalized && (
          <div className="mt-2">
            <CButton onClick={onSave}>Salvar</CButton>
          </div>
        )}
      </div>
      <Divider />
      <BehavioralMapProtocolFormManager
        formManagerRef={formManagerRef}
        value={selectedForm}
        onValueChange={onSelectedFormChange}
        onLoadingFormStructureChange={() => undefined}
        onPreviewFormStructureChange={() => undefined}
      />
      <Divider />
      <DndContext
        sensors={behavioralMapProtocol.finalized ? undefined : sensors}
        collisionDetection={pointerWithinOrClosestCenter}
        onDragEnd={behavioralMapProtocol.finalized ? undefined : reorderGroups}
      >
        <SortableContext
          items={groups.map((group) => group.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <SortableGroup
                key={group.id}
                group={group}
                isFinalized={behavioralMapProtocol.finalized}
                onRemove={removeCharacteristic}
                onReorderCharacteristics={reorderCharacteristics}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {!behavioralMapProtocol.finalized && (
        <div className="flex flex-wrap gap-2">
          {/* callback consumed by administration manager in client */}
          {groups.length === 0 && (
            <span className="text-sm text-gray-500">
              Adicione características pela administração de características.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BehavioralMapProtocolEditor;
