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
import React, { SetStateAction, useEffect, useState } from "react";

import {
  FormEditorTree,
  FormQuestionWithCategoryAndSubcategoryAndPosition,
} from "./clientV2";

interface FormEditorProps {
  formTree: FormEditorTree;
  setFormTree: React.Dispatch<React.SetStateAction<FormEditorTree>>;
}

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeParts = String(active.id).split("-");
    const overParts = String(over.id).split("-");

    const type = activeParts[0];
    const overType = overParts[0];

    // ----------------------
    // CATEGORIAS
    // ----------------------
    if (type === "category" && overType === "category") {
      const activeId = Number(activeParts[1]);
      const overId = Number(overParts[1]);

      const oldIndex = formTree.categories.findIndex((c) => c.id === activeId);
      const newIndex = formTree.categories.findIndex((c) => c.id === overId);

      setFormTree((prev) => ({
        ...prev,
        categories: arrayMove(prev.categories, oldIndex, newIndex).map(
          (c, idx) => ({
            ...c,
            position: idx + 1,
          }),
        ),
      }));
      return;
    }

    // ----------------------
    // SUBCATEGORIAS
    // ----------------------
    if (type === "subcategory" && overType === "subcategory") {
      const subId = Number(activeParts[1]);
      const catId = Number(activeParts[2]);
      const overSubId = Number(overParts[1]);

      const category = formTree.categories.find((c) => c.id === catId);
      if (!category) return;

      const oldIndex = category.subcategories.findIndex((s) => s.id === subId);
      const newIndex = category.subcategories.findIndex(
        (s) => s.id === overSubId,
      );

      const newSubcategories = arrayMove(
        category.subcategories,
        oldIndex,
        newIndex,
      ).map((s, idx) => ({ ...s, position: idx + 1 }));

      setFormTree((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === catId ? { ...c, subcategories: newSubcategories } : c,
        ),
      }));
      return;
    }

    // ----------------------
    // QUESTÕES
    // ----------------------
    if (type === "question" && overType === "question") {
      const questionId = Number(activeParts[1]);
      const catId = Number(activeParts[2]);
      const subId = activeParts[3] ? Number(activeParts[3]) : undefined;

      const overQuestionId = Number(overParts[1]);
      const overCatId = Number(overParts[2]);
      const overSubId = overParts[3] ? Number(overParts[3]) : undefined;

      // só permite mover dentro do mesmo grupo
      if (catId !== overCatId || subId !== overSubId) return;

      setFormTree((prev) => {
        const newCategories = prev.categories.map((cat) => {
          if (cat.id !== catId) return cat;

          // QUESTÕES SEM SUBCATEGORIA
          if (!subId) {
            const questionsSorted = [...cat.questions].sort(
              (a, b) => a.position - b.position,
            );
            const oldIndex = questionsSorted.findIndex(
              (q) => q.id === questionId,
            );
            const newIndex = questionsSorted.findIndex(
              (q) => q.id === overQuestionId,
            );

            const newQuestions = arrayMove(
              questionsSorted,
              oldIndex,
              newIndex,
            ).map((q, idx) => ({ ...q, position: idx + 1 }));

            return { ...cat, questions: newQuestions };
          }

          // QUESTÕES COM SUBCATEGORIA
          const sub = cat.subcategories.find((s) => s.id === subId);
          if (!sub) return cat;

          const questionsSorted = [...sub.questions].sort(
            (a, b) => a.position - b.position,
          );
          const oldIndex = questionsSorted.findIndex(
            (q) => q.id === questionId,
          );
          const newIndex = questionsSorted.findIndex(
            (q) => q.id === overQuestionId,
          );

          const newQuestions = arrayMove(
            questionsSorted,
            oldIndex,
            newIndex,
          ).map((q, idx) => ({ ...q, position: idx + 1 }));

          return {
            ...cat,
            subcategories: cat.subcategories.map((s) =>
              s.id === subId ? { ...s, questions: newQuestions } : s,
            ),
          };
        });

        return { ...prev, categories: newCategories };
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
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
                formTree={formTree}
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
  formTree,
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
  formTree: FormEditorTree;
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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{category.name}</strong>

      {/* Questões sem subcategoria */}
      <SortableContext
        items={category.questions.map(
          (q) => `question-${q.id}-${category.id}-${""}`,
        )}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ paddingLeft: "16px" }}>
          {category.questions
            .sort((a, b) => a.position - b.position)
            .map((q) => (
              <SortableQuestion
                key={q.id}
                question={q}
                parentIds={{ cat: category.id }}
              />
            ))}
        </div>
      </SortableContext>

      {/* Subcategorias */}
      <SortableContext
        items={category.subcategories.map(
          (s) => `subcategory-${s.id}-${category.id}`,
        )}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ paddingLeft: "16px" }}>
          {category.subcategories
            .sort((a, b) => a.position - b.position)
            .map((sub) => (
              <SortableSubcategory
                key={sub.id}
                subcategory={sub}
                parentCategory={category}
              />
            ))}
        </div>
      </SortableContext>
    </div>
  );
};

const SortableSubcategory = ({
  subcategory,
  parentCategory,
}: {
  subcategory: {
    id: number;
    name: string;
    position: number;
    questions: FormQuestionWithCategoryAndSubcategoryAndPosition[];
  };
  parentCategory: {
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
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `subcategory-${subcategory.id}-${parentCategory.id}`,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #aaa",
    padding: "6px",
    marginBottom: "6px",
    borderRadius: "4px",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{subcategory.name}</strong>

      <SortableContext
        items={subcategory.questions.map(
          (q) => `question-${q.id}-${parentCategory.id}-${subcategory.id}`,
        )}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ paddingLeft: "16px" }}>
          {subcategory.questions
            .sort((a, b) => a.position - b.position)
            .map((q) => (
              <SortableQuestion
                key={q.id}
                question={q}
                parentIds={{ cat: parentCategory.id, sub: subcategory.id }}
              />
            ))}
        </div>
      </SortableContext>
    </div>
  );
};

const SortableQuestion = ({
  question,
  parentIds,
}: {
  question: FormQuestionWithCategoryAndSubcategoryAndPosition;
  parentIds: { cat: number; sub?: number };
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `question-${question.id}-${question.category.id}-${question.subcategory?.id ?? ""}`,
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
