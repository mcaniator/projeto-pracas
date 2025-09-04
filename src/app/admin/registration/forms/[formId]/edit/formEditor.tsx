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
import {
  IconGripVertical,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import React, { useState } from "react";

import { FormItemUtils } from "../../../../../../lib/utils/formTreeUtils";
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
      const oldIndex = prev.categories.findIndex(
        (c) => c.categoryId === activeId,
      );
      const newIndex = prev.categories.findIndex(
        (c) => c.categoryId === overId,
      );

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
        items={formTree.categories.map((c) => `category-${c.categoryId}`)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={`text-black ${isDraggingCategory ? "bg-green-50" : ""}`}
        >
          {formTree.categories
            .sort((a, b) => a.position - b.position)
            .map((category) => (
              <SortableCategory
                key={category.categoryId}
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
    id: `category-${category.categoryId}`,
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
        (c) => c.categoryId === category.categoryId,
      );
      if (categoryIndex === -1) return prev;
      const categoryFromArray = prev.categories[categoryIndex];

      if (!categoryFromArray) {
        return prev;
      }

      const items = categoryFromArray.categoryChildren;

      const oldIndex = items.findIndex(
        (fi) =>
          FormItemUtils.buildCategoryChildId({
            item: fi,
            categoryId: category.categoryId,
          }) === active.id,
      );
      const newIndex = items.findIndex(
        (fi) =>
          FormItemUtils.buildCategoryChildId({
            item: fi,
            categoryId: category.categoryId,
          }) === over.id,
      );

      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(items, oldIndex, newIndex).map((fi, idx) => ({
        ...fi,
        position: idx + 1,
      }));

      const newCategories = [...prev.categories];
      newCategories[categoryIndex] = {
        ...categoryFromArray,
        categoryChildren: reordered,
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
              label={`Questões: ${category.categoryChildren.filter((fi) => FormItemUtils.getFormItemType(fi) === "QUESTION").length}`}
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
              }}
            />
            <Chip
              label={`Subcategorias: ${category.categoryChildren.filter((fi) => FormItemUtils.getFormItemType(fi) === "SUBCATEGORY").length}`}
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
                items={category.categoryChildren.map((fi) =>
                  FormItemUtils.buildCategoryChildId({
                    item: fi,
                    categoryId: category.categoryId,
                  }),
                )}
                strategy={verticalListSortingStrategy}
              >
                <div
                  style={{ paddingLeft: "16px" }}
                  className={`${isDraggingFormItem ? "bg-green-50" : ""}`}
                >
                  {category.categoryChildren
                    .sort((a, b) => a.position - b.position)
                    .map((fi) => (
                      <SortableFormItem
                        key={
                          FormItemUtils.buildCategoryChildId({
                            item: fi,
                            categoryId: category.categoryId,
                          }) + "-iterable"
                        } //This key is only used for react to distinguish between items created in a iteration
                        formItem={fi}
                        categoryId={category.categoryId}
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
  formItem: FormEditorTree["categories"][number]["categoryChildren"][number];
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
    id: FormItemUtils.buildCategoryChildId({
      item: formItem,
      categoryId: categoryId,
      subcategoryId: subcategoryId,
    }),
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
        (c) => c.categoryId === categoryId,
      );
      if (categoryIndex === -1) return prev;
      const categoryFromArray = prev.categories[categoryIndex];
      if (!categoryFromArray) {
        return prev;
      }
      const subcategoryIndex = categoryFromArray.categoryChildren.findIndex(
        (fi) =>
          FormItemUtils.isSubcategoryType(fi) &&
          fi.subcategoryId === questionSubcategoryId,
      );
      const subcategoryFromArray =
        categoryFromArray.categoryChildren[subcategoryIndex];
      if (!subcategoryFromArray) {
        return prev;
      }
      if (!FormItemUtils.isSubcategoryType(subcategoryFromArray)) {
        return prev;
      }
      const prevQuestionsArray = subcategoryFromArray.questions;
      if (!prevQuestionsArray) {
        return prev;
      }
      const oldIndex = prevQuestionsArray?.findIndex(
        (pq) =>
          `formItem-${categoryId}-${questionSubcategoryId}-QUESTION-${pq.questionId}` ===
          active.id,
      );
      const newIndex = prevQuestionsArray?.findIndex(
        (pq) =>
          `formItem-${categoryId}-${questionSubcategoryId}-QUESTION-${pq.questionId}` ===
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
      const newFormItems = [...newCategory.categoryChildren];

      newFormItems[subcategoryIndex] = {
        ...subcategoryFromArray,
        questions: reordered,
      };

      newCategory.categoryChildren = newFormItems;
      newCategories[categoryIndex] = newCategory;

      return {
        ...prev,
        categories: newCategories,
      };
    });
  };

  const handleQuestionRemoval = () => {
    if (!FormItemUtils.isSubcategoryType(formItem))
      setFormTree((prev) => {
        const categoryIndex = prev.categories.findIndex(
          (c) => c.categoryId === categoryId,
        );
        if (categoryIndex === -1) return prev;

        const category = prev.categories[categoryIndex];
        if (!category) return prev;

        let updatedCategory = { ...category };

        if (subcategoryId) {
          // Question inside subcategory
          const subcategoryIndex = category.categoryChildren.findIndex(
            (fi) =>
              FormItemUtils.isSubcategoryType(fi) &&
              fi.subcategoryId === subcategoryId,
          );
          if (subcategoryIndex === -1) return prev;

          const subcategory = category.categoryChildren[subcategoryIndex];
          if (
            !subcategory ||
            !FormItemUtils.isSubcategoryType(subcategory) ||
            !subcategory.questions
          )
            return prev;

          const newQuestions = subcategory.questions
            .filter((q) => q.questionId !== formItem.questionId)
            .map((q, i) => ({ ...q, position: i + 1 }));

          let newFormItems = category.categoryChildren;
          if (newQuestions.length === 0) {
            // remove whole subcategory
            newFormItems = category.categoryChildren
              .filter(
                (fi) =>
                  !(
                    FormItemUtils.isSubcategoryType(fi) &&
                    fi.subcategoryId === subcategoryId
                  ),
              )
              .map((s, i) => ({ ...s, position: i + 1 }));
          } else {
            const newSubcategory = { ...subcategory, questions: newQuestions };
            newFormItems = [...category.categoryChildren];
            newFormItems[subcategoryIndex] = newSubcategory;
          }

          updatedCategory = {
            ...updatedCategory,
            categoryChildren: newFormItems,
          };
        } else {
          // Question directly in category
          const newFormItems = category.categoryChildren
            .filter(
              (fi) =>
                !(
                  FormItemUtils.isQuestionType(fi) &&
                  fi.questionId === formItem.questionId
                ),
            )
            .map((c, i) => ({ ...c, position: i + 1 }));

          updatedCategory = {
            ...updatedCategory,
            categoryChildren: newFormItems,
          };
        }

        let newCategories = [...prev.categories];
        if (updatedCategory.categoryChildren.length === 0) {
          newCategories = prev.categories
            .filter((c) => c.categoryId !== categoryId)
            .map((c, i) => ({ ...c, position: i + 1 }));
        } else {
          newCategories[categoryIndex] = updatedCategory;
        }

        return { ...prev, categories: newCategories };
      });
  };

  if (FormItemUtils.isSubcategoryType(formItem)) {
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
                items={formItem.questions.map(
                  (fi) =>
                    `formItem-${categoryId}-${formItem.subcategoryId}-QUESTION-${fi.questionId}`,
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
                        key={q.questionId}
                        formItem={q}
                        categoryId={categoryId}
                        subcategoryId={formItem.subcategoryId}
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
        <div className="flex gap-1">
          <Button variant="text">
            <IconInfoCircle />
          </Button>
          <Button variant="text" color="error" onClick={handleQuestionRemoval}>
            <IconTrash />
          </Button>
        </div>
      </div>
    );
  }
};

export default FormEditor;
