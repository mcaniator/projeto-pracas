import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  pointerWithin,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import {
  IconChevronDown,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

import {
  FormEditorTree,
  FormQuestionWithCategoryAndSubcategoryAndPosition,
} from "./clientV2";

export const FormEditor = ({
  formTree,
  setFormTree,
  removeQuestionId,
}: {
  formTree: FormEditorTree;
  setFormTree: React.Dispatch<React.SetStateAction<FormEditorTree>>;
  removeQuestionId: (questionId: number) => void;
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  console.log(formTree);

  // -------------------
  // Handle questionRemoval
  // -------------------

  const handleQuestionRemoval = (
    questionId: number,
    categoryId: number,
    subcategoryId?: number,
  ) => {
    setFormTree((prev) => {
      const newCategories = prev.categories
        .map((c) => {
          if (c.id !== categoryId) return c;

          let updatedSubcategories = c.subcategories;

          if (subcategoryId) {
            // Remover questão da subcategoria
            updatedSubcategories = c.subcategories
              .map((s) => {
                if (s.id !== subcategoryId) return s;
                const newQuestions = s.questions
                  .filter((q) => q.id !== questionId)
                  .map((q, idx) => ({ ...q, position: idx + 1 }));
                return { ...s, questions: newQuestions };
              })
              // Remover subcategorias sem questões
              .filter((s) => s.questions.length > 0);
          }

          // Remover questão da categoria sem subcategoria
          const updatedQuestions =
            subcategoryId ?
              c.questions
            : c.questions
                .filter((q) => q.id !== questionId)
                .map((q, idx) => ({ ...q, position: idx + 1 }));

          return {
            ...c,
            questions: updatedQuestions,
            subcategories: updatedSubcategories,
          };
        })
        // Remover categorias sem questões e sem subcategorias
        .filter((c) => c.questions.length > 0 || c.subcategories.length > 0)
        // Reordenar posições das categorias
        .map((c, idx) => ({ ...c, position: idx + 1 }));

      return { ...prev, categories: newCategories };
    });
    removeQuestionId(questionId);
  };

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
      collisionDetection={pointerWithin}
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
                handleQuestionRemoval={handleQuestionRemoval}
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
  handleQuestionRemoval,
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
  handleQuestionRemoval: (
    questionId: number,
    categoryId: number,
    subcategoryId?: number,
  ) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `category-${category.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ccc",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "4px",
    opacity: isDragging ? 0.6 : 1,
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
    <div ref={setNodeRef} style={style}>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            "&:hover": {
              backgroundColor: "#ccc",
            },
          }}
          className="max-w-full"
        >
          <div className="flex max-w-[100vw] flex-wrap items-center gap-1">
            <div
              {...listeners}
              {...attributes}
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
                padding: "0px 8px",
              }}
            >
              <IconGripVertical />
            </div>
            <strong>{category.name}</strong>
            <Chip
              label={`Questões: ${category.questions.length}`}
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
              }}
            />
            <Chip
              label={`Subcategorias: ${category.subcategories.length}`}
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
              }}
            />
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <>
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
                      <SortableQuestion
                        key={q.id}
                        question={q}
                        handleQuestionRemoval={handleQuestionRemoval}
                      />
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
                        handleQuestionRemoval={handleQuestionRemoval}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

const SortableSubcategory = ({
  subcategory,
  categoryId,
  setFormTree,
  handleQuestionRemoval,
}: {
  subcategory: {
    id: number;
    name: string;
    position: number;
    questions: FormQuestionWithCategoryAndSubcategoryAndPosition[];
  };
  categoryId: number;
  setFormTree: React.Dispatch<React.SetStateAction<FormEditorTree>>;
  handleQuestionRemoval: (
    questionId: number,
    categoryId: number,
    subcategoryId?: number,
  ) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `subcategory-${subcategory.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #aaa",
    padding: "6px",
    marginBottom: "6px",
    borderRadius: "4px",
    opacity: isDragging ? 0.6 : 1,
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
    <div ref={setNodeRef} style={style}>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            "&:hover": {
              backgroundColor: "#ccc",
            },
          }}
        >
          <div className="flex max-w-[100vw] flex-wrap items-center gap-1">
            <div
              {...listeners}
              {...attributes}
              style={{
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
                padding: "0px 8px",
              }}
            >
              <IconGripVertical />
            </div>

            <strong>{subcategory.name}</strong>
            <Chip
              label={`Questões: ${subcategory.questions.length}`}
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
              }}
            />
          </div>
        </AccordionSummary>

        <AccordionDetails>
          <DndContext onDragEnd={handleQuestionDragEnd}>
            <SortableContext
              items={subcategory.questions.map((q) => `question-${q.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ paddingLeft: "16px" }}>
                {subcategory.questions
                  .sort((a, b) => a.position - b.position)
                  .map((q) => (
                    <SortableQuestion
                      key={q.id}
                      question={q}
                      handleQuestionRemoval={handleQuestionRemoval}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

const SortableQuestion = ({
  question,
  handleQuestionRemoval,
}: {
  question: FormQuestionWithCategoryAndSubcategoryAndPosition;
  handleQuestionRemoval: (
    questionId: number,
    categoryId: number,
    subcategoryId?: number,
  ) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between"
    >
      <div
        {...listeners}
        {...attributes}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          padding: "0px 8px",
        }}
      >
        <IconGripVertical />
      </div>
      {question.name}
      <Button
        variant="text"
        color="error"
        onClick={() => {
          handleQuestionRemoval(
            question.id,
            question.category.id,
            question?.subcategory?.id ?? undefined,
          );
        }}
      >
        <IconTrash />
      </Button>
    </div>
  );
};
