import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "@mui/material/Button";
import { IconTrash } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

import {
  FormEditorTree,
  FormQuestionWithCategoryAndSubcategoryAndPosition,
} from "./clientV2";

export const FormEditor = ({
  rootFormTree,
}: {
  rootFormTree: FormEditorTree;
}) => {
  const [formTree, setFormTree] = useState<FormEditorTree>({ categories: [] });
  const sensors = useSensors(useSensor(PointerSensor));
  console.log(formTree);

  useEffect(() => {
    setFormTree(rootFormTree);
  }, [rootFormTree]);

  // -------------------
  // Handle categorias
  // -------------------
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = Number(String(active.id).split("-")[1]);
    const overId = Number(String(over.id).split("-")[1]);

    setFormTree((prev) => {
      const oldIndex = prev.categories.findIndex((c) => c.id === activeId);
      const newIndex = prev.categories.findIndex((c) => c.id === overId);

      return {
        ...prev,
        categories: arrayMove(prev.categories, oldIndex, newIndex).map(
          (c, idx) => ({ ...c, position: idx + 1 }),
        ),
      };
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleCategoryDragEnd}
    >
      <SortableContext
        items={formTree.categories.map((c) => `category-${c.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="text-black">
          {formTree.categories
            .sort((a, b) => a.position - b.position)
            .map((category) => (
              <SortableCategory
                key={category.id}
                category={category}
                setFormTree={setFormTree}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

// ----------------------------
// Sortable Components
// ----------------------------
const SortableCategory = ({
  category,
  setFormTree,
}: {
  category: {
    id: number;
    name: string;
    position: number;
    questions: FormQuestionWithCategoryAndSubcategoryAndPosition[];
    subcategories: {
      id: number;
      name: string;
      position: number;
      questions: FormQuestionWithCategoryAndSubcategoryAndPosition[];
    }[];
  };
  setFormTree: React.Dispatch<React.SetStateAction<FormEditorTree>>;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `category-${category.id}`,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ccc",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "4px",
  };

  // -------------------
  // Handle subcategorias
  // -------------------
  const handleSubcategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const subId = Number(String(active.id).split("-")[1]);
    const overSubId = Number(String(over.id).split("-")[1]);

    setFormTree((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id !== category.id) return c;
        const oldIndex = c.subcategories.findIndex((s) => s.id === subId);
        const newIndex = c.subcategories.findIndex((s) => s.id === overSubId);
        const newSubs = arrayMove(c.subcategories, oldIndex, newIndex).map(
          (s, idx) => ({ ...s, position: idx + 1 }),
        );
        return { ...c, subcategories: newSubs };
      }),
    }));
  };

  // -------------------
  // Handle questões sem subcategoria
  // -------------------
  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const qId = Number(String(active.id).split("-")[1]);
    const overQId = Number(String(over.id).split("-")[1]);

    setFormTree((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id !== category.id) return c;

        const questionsSorted = [...c.questions].sort(
          (a, b) => a.position - b.position,
        );
        const oldIndex = questionsSorted.findIndex((q) => q.id === qId);
        const newIndex = questionsSorted.findIndex((q) => q.id === overQId);
        const newQuestions = arrayMove(questionsSorted, oldIndex, newIndex).map(
          (q, idx) => ({ ...q, position: idx + 1 }),
        );
        return { ...c, questions: newQuestions };
      }),
    }));
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{category.name}</strong>

      {/* Questões sem subcategoria */}
      <DndContext onDragEnd={handleQuestionDragEnd}>
        <SortableContext
          items={category.questions.map((q) => `question-${q.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ paddingLeft: "16px" }}>
            {category.questions
              .sort((a, b) => a.position - b.position)
              .map((q) => (
                <SortableQuestion key={q.id} question={q} />
              ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Subcategorias */}
      <DndContext onDragEnd={handleSubcategoryDragEnd}>
        <SortableContext
          items={category.subcategories.map((s) => `subcategory-${s.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ paddingLeft: "16px" }}>
            {category.subcategories
              .sort((a, b) => a.position - b.position)
              .map((sub) => (
                <SortableSubcategory
                  key={sub.id}
                  subcategory={sub}
                  categoryId={category.id}
                  setFormTree={setFormTree}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const SortableSubcategory = ({
  subcategory,
  categoryId,
  setFormTree,
}: {
  subcategory: {
    id: number;
    name: string;
    position: number;
    questions: FormQuestionWithCategoryAndSubcategoryAndPosition[];
  };
  categoryId: number;
  setFormTree: React.Dispatch<React.SetStateAction<FormEditorTree>>;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `subcategory-${subcategory.id}`,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #aaa",
    padding: "6px",
    marginBottom: "6px",
    borderRadius: "4px",
  };

  // -------------------
  // Handle questões dentro da subcategoria
  // -------------------
  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const qId = Number(String(active.id).split("-")[1]);
    const overQId = Number(String(over.id).split("-")[1]);

    setFormTree((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id !== categoryId) return c;
        return {
          ...c,
          subcategories: c.subcategories.map((s) => {
            if (s.id !== subcategory.id) return s;
            const questionsSorted = [...s.questions].sort(
              (a, b) => a.position - b.position,
            );
            const oldIndex = questionsSorted.findIndex((q) => q.id === qId);
            const newIndex = questionsSorted.findIndex((q) => q.id === overQId);
            const newQuestions = arrayMove(
              questionsSorted,
              oldIndex,
              newIndex,
            ).map((q, idx) => ({ ...q, position: idx + 1 }));
            return { ...s, questions: newQuestions };
          }),
        };
      }),
    }));
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{subcategory.name}</strong>

      <DndContext onDragEnd={handleQuestionDragEnd}>
        <SortableContext
          items={subcategory.questions.map((q) => `question-${q.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ paddingLeft: "16px" }}>
            {subcategory.questions
              .sort((a, b) => a.position - b.position)
              .map((q) => (
                <SortableQuestion key={q.id} question={q} />
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const SortableQuestion = ({
  question,
}: {
  question: FormQuestionWithCategoryAndSubcategoryAndPosition;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `question-${question.id}`,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #888",
    padding: "4px",
    marginBottom: "4px",
    borderRadius: "4px",
    backgroundColor: "#f8f8f8",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between"
    >
      {question.name}
      <Button variant="text" color="error">
        <IconTrash />
      </Button>
    </div>
  );
};
