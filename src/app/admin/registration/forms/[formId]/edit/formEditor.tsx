"use client";

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
import { IconGripVertical, IconTrash } from "@tabler/icons-react";
import React, { useState } from "react";

import { FormEditorTree } from "./clientV2";

const FormEditor = ({
  formTree,
  setFormTree,
}: {
  formTree: FormEditorTree;
  setFormTree: React.Dispatch<React.SetStateAction<FormEditorTree>>;
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const [isDraggingCategory, setIsDraggingCategory] = useState(false);
  const handleCategoryDragStart = () => {
    setIsDraggingCategory(true);
  };
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    setIsDraggingCategory(false);
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

  if (formTree.categories.length === 0) {
    return (
      <div className="text-black">
        Adicione questões para montar o formulário!
      </div>
    );
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={handleCategoryDragEnd}
      onDragStart={handleCategoryDragStart}
    >
      <SortableContext
        items={formTree.categories.map((c) => `category-${c.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={`text-black ${isDraggingCategory ? "bg-green-50" : ""}`}
        >
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
  category: FormEditorTree["categories"][number];
  setFormTree: React.Dispatch<React.SetStateAction<FormEditorTree>>;
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

  const [isDraggingFormItem, setIsDraggingFormItem] = useState(false);
  const handleFormItemDragStart = () => {
    setIsDraggingFormItem(true);
  };
  const handleFormItemDragEnd = (event: DragEndEvent) => {
    setIsDraggingFormItem(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFormTree((prev) => {
      const categoryIndex = prev.categories.findIndex(
        (c) => c.id === category.id,
      );
      if (categoryIndex === -1) return prev;
      const categoryFromArray = prev.categories[categoryIndex];
      if (!categoryFromArray) {
        return prev;
      }

      const items = categoryFromArray.formItems;

      const oldIndex = items.findIndex(
        (fi) =>
          `formItem-${category.id}-null-${fi.formItemType}-${fi.referenceId}` ===
          active.id,
      );
      const newIndex = items.findIndex(
        (fi) =>
          `formItem-${category.id}-null-${fi.formItemType}-${fi.referenceId}` ===
          over.id,
      );

      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(items, oldIndex, newIndex).map((fi, idx) => ({
        ...fi,
        position: idx + 1,
      }));

      const newCategories = [...prev.categories];
      newCategories[categoryIndex] = {
        ...categoryFromArray,
        formItems: reordered,
      };

      return { ...prev, categories: newCategories };
    });
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
              label={`Questões: ${category.formItems.filter((fi) => fi.formItemType === "QUESTION").length}`}
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
              }}
            />
            <Chip
              label={`Subcategorias: ${category.formItems.filter((fi) => fi.formItemType === "SUBCATEGORY").length}`}
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
            <DndContext
              onDragEnd={handleFormItemDragEnd}
              onDragStart={handleFormItemDragStart}
              collisionDetection={pointerWithin}
            >
              <SortableContext
                items={category.formItems.map(
                  (fi) =>
                    `formItem-${category.id}-${"null"}-${fi.formItemType}-${fi.referenceId}`,
                )}
                strategy={verticalListSortingStrategy}
              >
                <div
                  style={{ paddingLeft: "16px" }}
                  className={`${isDraggingFormItem ? "bg-green-50" : ""}`}
                >
                  {category.formItems
                    .sort((a, b) => a.position - b.position)
                    .map((fi) => (
                      <SortableFormItem
                        key={`formItem-${fi.formItemType}-${fi.referenceId}`}
                        formItem={fi}
                        categoryId={category.id}
                        setFormTree={setFormTree}
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

const SortableFormItem = ({
  categoryId,
  subcategoryId,
  formItem,
  setFormTree,
}: {
  categoryId: number;
  subcategoryId?: number;
  formItem: FormEditorTree["categories"][number]["formItems"][number];
  setFormTree: React.Dispatch<React.SetStateAction<FormEditorTree>>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `formItem-${categoryId}-${subcategoryId ?? "null"}-${formItem.formItemType}-${formItem.referenceId}`,
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

  const [isDragginQuestion, setIsDraggingQuestion] = useState(false);

  const handleSubcategoryQuestionDragStart = () => {
    setIsDraggingQuestion(true);
  };

  const handleSubcategoryQuestionDragEnd = (event: DragEndEvent) => {
    setIsDraggingQuestion(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFormTree((prev) => {
      const questionSubcategoryId = parseInt(
        active.id.toString().split("-")[2] ?? "",
      );
      if (Number.isNaN(questionSubcategoryId)) {
        return prev;
      }
      const categoryIndex = prev.categories.findIndex(
        (c) => c.id === categoryId,
      );
      if (categoryIndex === -1) return prev;
      const categoryFromArray = prev.categories[categoryIndex];
      if (!categoryFromArray) {
        return prev;
      }
      const subcategoryIndex = categoryFromArray.formItems.findIndex(
        (fi) =>
          fi.formItemType === "SUBCATEGORY" &&
          fi.referenceId === questionSubcategoryId,
      );
      const subcategoryFromArray =
        categoryFromArray.formItems[subcategoryIndex];
      if (!subcategoryFromArray) {
        return prev;
      }
      const prevQuestionsArray = subcategoryFromArray.questions;
      if (!prevQuestionsArray) {
        return prev;
      }
      const oldIndex = prevQuestionsArray?.findIndex(
        (pq) =>
          `formItem-${categoryId}-${questionSubcategoryId}-QUESTION-${pq.referenceId}` ===
          active.id,
      );
      const newIndex = prevQuestionsArray?.findIndex(
        (pq) =>
          `formItem-${categoryId}-${questionSubcategoryId}-QUESTION-${pq.referenceId}` ===
          over.id,
      );
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(prevQuestionsArray, oldIndex, newIndex).map(
        (q, idx) => ({
          ...q,
          position: idx + 1,
        }),
      );

      const newCategories = [...prev.categories];
      const newCategory = { ...categoryFromArray };
      const newFormItems = [...newCategory.formItems];

      newFormItems[subcategoryIndex] = {
        ...subcategoryFromArray,
        questions: reordered,
      };

      newCategory.formItems = newFormItems;
      newCategories[categoryIndex] = newCategory;

      return {
        ...prev,
        categories: newCategories,
      };
    });
  };

  const handleQuestionRemoval = () => {
    setFormTree((prev) => {
      const categoryIndex = prev.categories.findIndex(
        (c) => c.id === categoryId,
      );
      if (categoryIndex === -1) return prev;

      const category = prev.categories[categoryIndex];
      if (!category) return prev;

      let updatedCategory = { ...category };

      if (subcategoryId) {
        // Question inside subcategory
        const subcategoryIndex = category.formItems.findIndex(
          (fi) =>
            fi.formItemType === "SUBCATEGORY" &&
            fi.referenceId === subcategoryId,
        );
        if (subcategoryIndex === -1) return prev;

        const subcategory = category.formItems[subcategoryIndex];
        if (!subcategory?.questions) return prev;

        const newQuestions = subcategory.questions
          .filter((q) => q.referenceId !== formItem.referenceId)
          .map((q, i) => ({ ...q, position: i + 1 }));

        let newFormItems = category.formItems;
        if (newQuestions.length === 0) {
          // remove whole subcategory
          newFormItems = category.formItems
            .filter(
              (fi) =>
                !(
                  fi.formItemType === "SUBCATEGORY" &&
                  fi.referenceId === subcategoryId
                ),
            )
            .map((s, i) => ({ ...s, position: i + 1 }));
        } else {
          const newSubcategory = { ...subcategory, questions: newQuestions };
          newFormItems = [...category.formItems];
          newFormItems[subcategoryIndex] = newSubcategory;
        }

        updatedCategory = { ...updatedCategory, formItems: newFormItems };
      } else {
        // Question directly in category
        const newFormItems = category.formItems
          .filter(
            (fi) =>
              !(
                fi.formItemType === "QUESTION" &&
                fi.referenceId === formItem.referenceId
              ),
          )
          .map((c, i) => ({ ...c, position: i + 1 }));

        updatedCategory = { ...updatedCategory, formItems: newFormItems };
      }

      let newCategories = [...prev.categories];
      if (updatedCategory.formItems.length === 0) {
        newCategories = prev.categories
          .filter((c) => c.id !== categoryId)
          .map((c, i) => ({ ...c, position: i + 1 }));
      } else {
        newCategories[categoryIndex] = updatedCategory;
      }

      return { ...prev, categories: newCategories };
    });
  };

  if (formItem.formItemType === "SUBCATEGORY") {
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

              <strong>{formItem.name}</strong>
              <Chip
                label={`Questões: ${formItem.questions?.length}`}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              />
            </div>
          </AccordionSummary>

          <AccordionDetails>
            <DndContext
              onDragEnd={handleSubcategoryQuestionDragEnd}
              onDragStart={handleSubcategoryQuestionDragStart}
            >
              <SortableContext
                items={formItem.questions!.map(
                  (fi) =>
                    `formItem-${categoryId}-${formItem.referenceId}-QUESTION-${fi.referenceId}`,
                )}
                strategy={verticalListSortingStrategy}
              >
                <div
                  style={{ paddingLeft: "16px" }}
                  className={`${isDragginQuestion ? "bg-green-50" : ""}`}
                >
                  {formItem.questions
                    ?.sort((a, b) => a.position - b.position)
                    .map((q) => (
                      <SortableFormItem
                        key={q.referenceId}
                        formItem={{ ...q, formItemType: "QUESTION" }}
                        categoryId={categoryId}
                        subcategoryId={formItem.referenceId}
                        setFormTree={setFormTree}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  } else {
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
        {formItem.name}
        <Button variant="text" color="error" onClick={handleQuestionRemoval}>
          <IconTrash />
        </Button>
      </div>
    );
  }
};

export default FormEditor;
