"use client";

import CLinearProgress from "@/components/ui/CLinearProgress";
import QuestionResponseRenderer from "@/components/ui/assessment/questionResponseRenderer";
import CAutocomplete from "@/components/ui/cAutoComplete";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchMapAssessmentComparisonAssessmentTrees } from "@/lib/serverFunctions/apiCalls/mapAssessmentComparison";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import {
  FetchMapAssessmentComparisonAssessmentTreesResponse,
  MapAssessmentComparisonLocation,
} from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { resolveAssessmentQuestionValue } from "@/lib/utils/assessmentResultViewer/assessmentResultViewerUtils";
import { Chip } from "@mui/material";
import { IconCalendar, IconChartBar } from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useState } from "react";

type ComparisonAssessmentTree =
  FetchMapAssessmentComparisonAssessmentTreesResponse["locations"][number]["assessmentTrees"][number];

const LOCATION_COLORS: [string, ...string[]] = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#D97706",
  "#7C3AED",
  "#0891B2",
  "#BE123C",
  "#4D7C0F",
];

const getLocationColor = (index: number): string => {
  return LOCATION_COLORS[index % LOCATION_COLORS.length] ?? LOCATION_COLORS[0];
};

const alphaColor = (hexColor: string, alpha: number) => {
  const normalizedHex = hexColor.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const isAssessmentSubcategoryItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentSubcategoryItem => {
  return "questions" in item;
};

const cloneQuestion = (
  question: AssessmentQuestionItem,
): AssessmentQuestionItem => ({
  ...question,
  options: question.options ? [...question.options] : undefined,
});

const cloneCategory = (
  category: AssessmentCategoryItem,
): AssessmentCategoryItem => ({
  ...category,
  categoryChildren: [],
});

const cloneSubcategory = (
  subcategory: AssessmentSubcategoryItem,
): AssessmentSubcategoryItem => ({
  ...subcategory,
  questions: [],
});

const buildComparisonCategories = (
  assessments: (ComparisonAssessmentTree | null)[],
): AssessmentCategoryItem[] => {
  const categories: AssessmentCategoryItem[] = [];
  const includedQuestionIds = new Set<number>();

  assessments.forEach((assessment) => {
    assessment?.categories.forEach((category) => {
      let comparisonCategory = categories.find(
        (existingCategory) =>
          existingCategory.categoryId === category.categoryId,
      );

      if (!comparisonCategory) {
        comparisonCategory = cloneCategory(category);
        categories.push(comparisonCategory);
      }

      category.categoryChildren.forEach((child) => {
        if (isAssessmentSubcategoryItem(child)) {
          let comparisonSubcategory = comparisonCategory.categoryChildren.find(
            (existingChild): existingChild is AssessmentSubcategoryItem =>
              isAssessmentSubcategoryItem(existingChild) &&
              existingChild.subcategoryId === child.subcategoryId,
          );

          if (!comparisonSubcategory) {
            comparisonSubcategory = cloneSubcategory(child);
            comparisonCategory.categoryChildren.push(comparisonSubcategory);
          }

          child.questions.forEach((question) => {
            if (includedQuestionIds.has(question.questionId)) return;

            includedQuestionIds.add(question.questionId);
            comparisonSubcategory.questions.push(cloneQuestion(question));
          });

          return;
        }

        if (includedQuestionIds.has(child.questionId)) return;

        includedQuestionIds.add(child.questionId);
        comparisonCategory.categoryChildren.push(cloneQuestion(child));
      });
    });
  });

  return categories;
};

const buildQuestionMap = (assessment: ComparisonAssessmentTree | null) => {
  const questionMap = new Map<number, AssessmentQuestionItem>();

  assessment?.categories.forEach((category) => {
    category.categoryChildren.forEach((child) => {
      if (isAssessmentSubcategoryItem(child)) {
        child.questions.forEach((question) => {
          questionMap.set(question.questionId, question);
        });
        return;
      }

      questionMap.set(child.questionId, child);
    });
  });

  return questionMap;
};

const LocationAssessmentSelector = ({
  color,
  location,
  locationNumber,
  onAssessmentChange,
  selectedAssessmentId,
}: {
  color: string;
  location: FetchMapAssessmentComparisonAssessmentTreesResponse["locations"][number];
  locationNumber: number;
  onAssessmentChange: (assessmentId: number) => void;
  selectedAssessmentId: number | null;
}) => {
  const selectedAssessment =
    location.assessmentTrees.find(
      (assessment) => assessment.id === selectedAssessmentId,
    ) ??
    location.assessmentTrees[0] ??
    null;

  return (
    <div
      className="flex min-w-72 flex-1 flex-col gap-2 rounded border p-3"
      style={{ borderColor: color, backgroundColor: alphaColor(color, 0.1) }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {locationNumber}
        </span>
        <div className="min-w-0">
          <div className="truncate font-semibold">{location.name}</div>
          {selectedAssessment && (
            <div className="mt-1">
              <Chip
                size="small"
                icon={<IconCalendar />}
                label={dateFormatter.format(
                  new Date(selectedAssessment.startDate),
                )}
              />
            </div>
          )}
        </div>
      </div>

      {selectedAssessment && (
        <CAutocomplete
          label="Avaliação"
          disableClearable
          options={location.assessmentTrees}
          value={selectedAssessment}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) =>
            dateFormatter.format(new Date(option.startDate))
          }
          onChange={(_, value) => {
            if (value) onAssessmentChange(value.id);
          }}
        />
      )}
    </div>
  );
};

type ComparisonLocation = {
  color: string;
  location: FetchMapAssessmentComparisonAssessmentTreesResponse["locations"][number];
  locationNumber: number;
  questionMap: Map<number, AssessmentQuestionItem>;
  selectedAssessment: ComparisonAssessmentTree | null;
};

const QuestionComparisonCell = ({
  comparisonLocation,
  question,
}: {
  comparisonLocation: ComparisonLocation;
  question: AssessmentQuestionItem;
}) => {
  const assessmentQuestion = comparisonLocation.questionMap.get(
    question.questionId,
  );

  return (
    <td
      className="min-w-56 border-b border-l border-gray-200 p-3 align-middle"
      style={{ backgroundColor: alphaColor(comparisonLocation.color, 0.1) }}
    >
      {!assessmentQuestion || !comparisonLocation.selectedAssessment ?
        <span className="text-sm italic text-gray-600">(Não avaliado)</span>
      : <QuestionResponseRenderer
          question={assessmentQuestion}
          resolvedValue={resolveAssessmentQuestionValue(
            comparisonLocation.selectedAssessment,
            assessmentQuestion,
          )}
        />
      }
    </td>
  );
};

const AssessmentComparisonDialog = ({
  category,
  locations,
  onClose,
  open,
}: {
  category: { id: number; name: string } | null;
  locations: MapAssessmentComparisonLocation[];
  onClose: () => void;
  open: boolean;
}) => {
  const [comparisonLocations, setComparisonLocations] = useState<
    FetchMapAssessmentComparisonAssessmentTreesResponse["locations"]
  >([]);
  const [selectedAssessmentIds, setSelectedAssessmentIds] = useState<
    Record<number, number>
  >({});

  const locationIds = useMemo(
    () => locations.map((location) => location.id),
    [locations],
  );

  const locationOrderById = useMemo(
    () =>
      new Map(
        locations.map((location, index) => [location.id, index] as const),
      ),
    [locations],
  );

  const [fetchAssessmentTrees, loadingAssessmentTrees] =
    useFetchMapAssessmentComparisonAssessmentTrees({
      callbacks: {
        onSuccess: (response) => {
          const nextLocations = [...(response.data?.locations ?? [])].sort(
            (a, b) =>
              (locationOrderById.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
              (locationOrderById.get(b.id) ?? Number.MAX_SAFE_INTEGER),
          );

          setComparisonLocations(nextLocations);
          setSelectedAssessmentIds(
            Object.fromEntries(
              nextLocations
                .map(
                  (location) =>
                    [location.id, location.assessmentTrees[0]?.id] as const,
                )
                .filter(
                  (entry): entry is readonly [number, number] =>
                    entry[1] != null,
                ),
            ),
          );
        },
      },
    });

  useEffect(() => {
    if (!open || !category || locationIds.length === 0) {
      setComparisonLocations([]);
      setSelectedAssessmentIds({});
      return;
    }

    void fetchAssessmentTrees({
      categoryId: category.id,
      locationIds,
    });
  }, [category, fetchAssessmentTrees, locationIds, open]);

  const comparisonTableLocations = useMemo<ComparisonLocation[]>(() => {
    return comparisonLocations.map((location, index) => {
      const selectedAssessment =
        location.assessmentTrees.find(
          (assessment) => assessment.id === selectedAssessmentIds[location.id],
        ) ??
        location.assessmentTrees[0] ??
        null;

      return {
        color: getLocationColor(index),
        location,
        locationNumber: index + 1,
        questionMap: buildQuestionMap(selectedAssessment),
        selectedAssessment,
      };
    });
  }, [comparisonLocations, selectedAssessmentIds]);

  const comparisonCategories = useMemo(
    () =>
      buildComparisonCategories(
        comparisonTableLocations.map(
          (comparisonLocation) => comparisonLocation.selectedAssessment,
        ),
      ),
    [comparisonTableLocations],
  );

  return (
    <CDialog
      title={category?.name ?? "Avaliações"}
      open={open}
      onClose={onClose}
      fullScreen
      maxWidth="xl"
      disableDialogActions
    >
      <div className="flex flex-col gap-2 overflow-auto pr-1">
        {loadingAssessmentTrees && <CLinearProgress label="Carregando..." />}
        {!loadingAssessmentTrees && (
          <>
            <div className="flex flex-wrap gap-2">
              {comparisonTableLocations.map((comparisonLocation) => (
                <LocationAssessmentSelector
                  key={comparisonLocation.location.id}
                  color={comparisonLocation.color}
                  location={comparisonLocation.location}
                  locationNumber={comparisonLocation.locationNumber}
                  selectedAssessmentId={
                    selectedAssessmentIds[comparisonLocation.location.id] ??
                    null
                  }
                  onAssessmentChange={(assessmentId) => {
                    setSelectedAssessmentIds((prev) => ({
                      ...prev,
                      [comparisonLocation.location.id]: assessmentId,
                    }));
                  }}
                />
              ))}
            </div>

            <div className="overflow-auto rounded border">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 top-0 z-30 w-72 min-w-72 border-b bg-white p-3 text-left font-semibold">
                      Estrutura
                    </th>
                    {comparisonTableLocations.map((comparisonLocation) => (
                      <th
                        key={comparisonLocation.location.id}
                        className="sticky top-0 z-20 min-w-56 border-b border-l border-gray-200 p-3 text-left align-top"
                        style={{
                          backgroundColor: alphaColor(
                            comparisonLocation.color,
                            0.1,
                          ),
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                            style={{
                              backgroundColor: comparisonLocation.color,
                            }}
                          >
                            {comparisonLocation.locationNumber}
                          </span>
                          <div className="min-w-0">
                            <div className="break-words font-semibold">
                              {comparisonLocation.location.name}
                            </div>
                            {comparisonLocation.selectedAssessment && (
                              <div className="mt-1 flex items-center gap-1 text-xs font-normal text-gray-700">
                                <IconCalendar size={14} />
                                {dateFormatter.format(
                                  new Date(
                                    comparisonLocation.selectedAssessment.startDate,
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonCategories.map((category) => (
                    <Fragment key={`category-${category.categoryId}`}>
                      <tr>
                        <td className="sticky left-0 z-10 border-b bg-gray-300 p-3 font-semibold">
                          <div className="flex items-center gap-2">
                            <IconChartBar size={18} />
                            {category.name}
                          </div>
                        </td>
                        {comparisonTableLocations.map((comparisonLocation) => (
                          <td
                            key={`${category.categoryId}-${comparisonLocation.location.id}`}
                            className="border-b border-l border-gray-200 bg-gray-300 p-3"
                          />
                        ))}
                      </tr>

                      {category.categoryChildren.map((child) =>
                        isAssessmentSubcategoryItem(child) ?
                          <Fragment key={`subcategory-${child.subcategoryId}`}>
                            <tr>
                              <td className="sticky left-0 z-10 border-b bg-gray-200 p-3 pl-8 font-medium">
                                {child.name}
                              </td>
                              {comparisonTableLocations.map(
                                (comparisonLocation) => (
                                  <td
                                    key={`${child.subcategoryId}-${comparisonLocation.location.id}`}
                                    className="border-b border-l border-gray-200 bg-gray-200 p-3"
                                  />
                                ),
                              )}
                            </tr>

                            {child.questions.map((question) => (
                              <tr key={`question-${question.questionId}`}>
                                <td className="sticky left-0 z-10 border-b bg-white p-3 pl-12">
                                  <span className="break-words">
                                    {question.name}
                                  </span>
                                </td>
                                {comparisonTableLocations.map(
                                  (comparisonLocation) => (
                                    <QuestionComparisonCell
                                      key={`${question.questionId}-${comparisonLocation.location.id}`}
                                      comparisonLocation={comparisonLocation}
                                      question={question}
                                    />
                                  ),
                                )}
                              </tr>
                            ))}
                          </Fragment>
                        : <tr key={`question-${child.questionId}`}>
                            <td className="sticky left-0 z-10 border-b bg-white p-3 pl-8">
                              <span className="break-words">{child.name}</span>
                            </td>
                            {comparisonTableLocations.map(
                              (comparisonLocation) => (
                                <QuestionComparisonCell
                                  key={`${child.questionId}-${comparisonLocation.location.id}`}
                                  comparisonLocation={comparisonLocation}
                                  question={child}
                                />
                              ),
                            )}
                          </tr>,
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </CDialog>
  );
};

export default AssessmentComparisonDialog;
