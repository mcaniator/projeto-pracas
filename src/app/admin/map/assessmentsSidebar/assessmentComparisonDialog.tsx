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
import {
  resolveAssessmentQuestionGeometries,
  resolveAssessmentQuestionValue,
} from "@/lib/utils/assessmentResultViewer/assessmentResultViewerUtils";
import { IconCalendar, IconChartBar } from "@tabler/icons-react";
import {
  type CSSProperties,
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";

type ComparisonAssessmentTree =
  FetchMapAssessmentComparisonAssessmentTreesResponse["locations"][number]["assessmentTrees"][number];

const LOCATION_COLORS: [string, ...string[]] = [
  "#2563EB",
  "#DC2626",
  "#16A34A",
  "#D97706",
  "#7C3AED",
  "#0891B2",
  "#BE123C",
  "#4D7C0F",
];

const CATEGORY_COLORS: [string, ...string[]] = [
  "#64748B",
  "#5F766E",
  "#7A6A53",
  "#7C6F8E",
  "#6F7D5C",
  "#776C76",
  "#60747C",
  "#7B6B63",
];

const getLocationColor = (index: number): string => {
  return LOCATION_COLORS[index % LOCATION_COLORS.length] ?? LOCATION_COLORS[0];
};

const getCategoryColor = (index: number): string => {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? CATEGORY_COLORS[0];
};

const getSubcategoryColor = (
  categoryIndex: number,
  subcategoryIndex: number,
): string => {
  return (
    CATEGORY_COLORS[
      (categoryIndex + subcategoryIndex + 1) % CATEGORY_COLORS.length
    ] ?? CATEGORY_COLORS[0]
  );
};

const alphaColor = (hexColor: string, alpha: number) => {
  const normalizedHex = hexColor.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const buildCategoryLoopStyle = ({
  color,
  isFirstColumn,
  isFirstRow,
  isLastColumn,
  isLastRow,
}: {
  color: string;
  isFirstColumn: boolean;
  isFirstRow: boolean;
  isLastColumn: boolean;
  isLastRow: boolean;
}): CSSProperties => {
  const shadows = [
    isFirstRow ? `inset 0 2px 0 ${color}` : null,
    isLastRow ? `inset 0 -2px 0 ${color}` : null,
    isFirstColumn ? `inset 2px 0 0 ${color}` : null,
    isLastColumn ? `inset -2px 0 0 ${color}` : null,
  ].filter((shadow): shadow is string => shadow !== null);

  return shadows.length > 0 ? { boxShadow: shadows.join(", ") } : {};
};

const buildSubcategoryLoopStyle = ({
  color,
  isFirstColumn,
  isFirstRow,
  isLastColumn,
  isLastRow,
}: {
  color: string;
  isFirstColumn: boolean;
  isFirstRow: boolean;
  isLastColumn: boolean;
  isLastRow: boolean;
}): CSSProperties => ({
  borderTop: isFirstRow ? `2px dashed ${color}` : undefined,
  borderBottom: isLastRow ? `2px dashed ${color}` : undefined,
  borderLeft: isFirstColumn ? `2px dashed ${color}` : undefined,
  borderRight: isLastColumn ? `2px dashed ${color}` : undefined,
});

const mergeCellStyles = (
  ...styles: (CSSProperties | undefined)[]
): CSSProperties => {
  return styles.reduce<CSSProperties>(
    (mergedStyle, style) => ({ ...mergedStyle, ...style }),
    {},
  );
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
  locationPolygonGeoJson: string | null;
  questionMap: Map<number, AssessmentQuestionItem>;
  selectedAssessment: ComparisonAssessmentTree | null;
};

const QuestionComparisonCell = ({
  cellStyle,
  comparisonLocation,
  question,
}: {
  cellStyle?: CSSProperties;
  comparisonLocation: ComparisonLocation;
  question: AssessmentQuestionItem;
}) => {
  const assessmentQuestion = comparisonLocation.questionMap.get(
    question.questionId,
  );

  return (
    <td
      className="min-w-56 border-b border-l border-gray-200 p-3 align-middle"
      style={mergeCellStyles(
        { backgroundColor: alphaColor(comparisonLocation.color, 0.1) },
        cellStyle,
      )}
    >
      {!assessmentQuestion || !comparisonLocation.selectedAssessment ?
        <span className="text-sm italic text-gray-600">(Não avaliado)</span>
      : <QuestionResponseRenderer
          question={assessmentQuestion}
          resolvedValue={resolveAssessmentQuestionValue(
            comparisonLocation.selectedAssessment,
            assessmentQuestion,
          )}
          geometries={resolveAssessmentQuestionGeometries(
            comparisonLocation.selectedAssessment,
            assessmentQuestion,
          )}
          locationPolygonGeoJson={comparisonLocation.locationPolygonGeoJson}
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
        locationPolygonGeoJson:
          locations.find((item) => item.id === location.id)?.st_asgeojson ??
          null,
        questionMap: buildQuestionMap(selectedAssessment),
        selectedAssessment,
      };
    });
  }, [comparisonLocations, locations, selectedAssessmentIds]);

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
                    <th className="sticky left-0 top-0 z-30 w-72 min-w-72 border-b bg-white p-3 text-left font-semibold"></th>
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
                  {comparisonCategories.map((category, categoryIndex) => {
                    const categoryColor = getCategoryColor(categoryIndex);
                    const categoryHasChildren =
                      category.categoryChildren.length > 0;

                    return (
                      <Fragment key={`category-${category.categoryId}`}>
                        <tr>
                          <td
                            className="sticky left-0 z-10 border-b bg-gray-300 p-3 font-semibold"
                            style={buildCategoryLoopStyle({
                              color: categoryColor,
                              isFirstColumn: true,
                              isFirstRow: true,
                              isLastColumn:
                                comparisonTableLocations.length === 0,
                              isLastRow: !categoryHasChildren,
                            })}
                          >
                            <div className="flex items-center gap-2">
                              <IconChartBar size={18} />
                              {category.name}
                            </div>
                          </td>
                          {comparisonTableLocations.map(
                            (comparisonLocation, locationIndex) => (
                              <td
                                key={`${category.categoryId}-${comparisonLocation.location.id}`}
                                className="border-b border-l border-gray-200 bg-gray-300 p-3"
                                style={buildCategoryLoopStyle({
                                  color: categoryColor,
                                  isFirstColumn: false,
                                  isFirstRow: true,
                                  isLastColumn:
                                    locationIndex ===
                                    comparisonTableLocations.length - 1,
                                  isLastRow: !categoryHasChildren,
                                })}
                              />
                            ),
                          )}
                        </tr>

                        {category.categoryChildren.map((child, childIndex) => {
                          const isLastCategoryChild =
                            childIndex === category.categoryChildren.length - 1;

                          if (isAssessmentSubcategoryItem(child)) {
                            const subcategoryColor = getSubcategoryColor(
                              categoryIndex,
                              childIndex,
                            );
                            const subcategoryHasQuestions =
                              child.questions.length > 0;

                            return (
                              <Fragment
                                key={`subcategory-${child.subcategoryId}`}
                              >
                                <tr>
                                  <td
                                    className="sticky left-0 z-10 border-b bg-gray-200 p-3 pl-8 font-medium"
                                    style={mergeCellStyles(
                                      buildCategoryLoopStyle({
                                        color: categoryColor,
                                        isFirstColumn: true,
                                        isFirstRow: false,
                                        isLastColumn:
                                          comparisonTableLocations.length === 0,
                                        isLastRow:
                                          isLastCategoryChild &&
                                          !subcategoryHasQuestions,
                                      }),
                                      buildSubcategoryLoopStyle({
                                        color: subcategoryColor,
                                        isFirstColumn: true,
                                        isFirstRow: true,
                                        isLastColumn:
                                          comparisonTableLocations.length === 0,
                                        isLastRow: !subcategoryHasQuestions,
                                      }),
                                    )}
                                  >
                                    {child.name}
                                  </td>
                                  {comparisonTableLocations.map(
                                    (comparisonLocation, locationIndex) => (
                                      <td
                                        key={`${child.subcategoryId}-${comparisonLocation.location.id}`}
                                        className="border-b border-l border-gray-200 bg-gray-200 p-3"
                                        style={mergeCellStyles(
                                          buildCategoryLoopStyle({
                                            color: categoryColor,
                                            isFirstColumn: false,
                                            isFirstRow: false,
                                            isLastColumn:
                                              locationIndex ===
                                              comparisonTableLocations.length -
                                                1,
                                            isLastRow:
                                              isLastCategoryChild &&
                                              !subcategoryHasQuestions,
                                          }),
                                          buildSubcategoryLoopStyle({
                                            color: subcategoryColor,
                                            isFirstColumn: false,
                                            isFirstRow: true,
                                            isLastColumn:
                                              locationIndex ===
                                              comparisonTableLocations.length -
                                                1,
                                            isLastRow: !subcategoryHasQuestions,
                                          }),
                                        )}
                                      />
                                    ),
                                  )}
                                </tr>

                                {child.questions.map(
                                  (question, questionIndex) => {
                                    const isLastSubcategoryQuestion =
                                      questionIndex ===
                                      child.questions.length - 1;
                                    const isLastCategoryRow =
                                      isLastCategoryChild &&
                                      isLastSubcategoryQuestion;
                                    const labelCellStyle = mergeCellStyles(
                                      buildCategoryLoopStyle({
                                        color: categoryColor,
                                        isFirstColumn: true,
                                        isFirstRow: false,
                                        isLastColumn:
                                          comparisonTableLocations.length === 0,
                                        isLastRow: isLastCategoryRow,
                                      }),
                                      buildSubcategoryLoopStyle({
                                        color: subcategoryColor,
                                        isFirstColumn: true,
                                        isFirstRow: false,
                                        isLastColumn:
                                          comparisonTableLocations.length === 0,
                                        isLastRow: isLastSubcategoryQuestion,
                                      }),
                                    );

                                    return (
                                      <tr
                                        key={`question-${question.questionId}`}
                                      >
                                        <td
                                          className="sticky left-0 z-10 border-b bg-white p-3 pl-12"
                                          style={labelCellStyle}
                                        >
                                          <span className="break-words">
                                            {question.name}
                                          </span>
                                        </td>
                                        {comparisonTableLocations.map(
                                          (
                                            comparisonLocation,
                                            locationIndex,
                                          ) => (
                                            <QuestionComparisonCell
                                              key={`${question.questionId}-${comparisonLocation.location.id}`}
                                              cellStyle={mergeCellStyles(
                                                buildCategoryLoopStyle({
                                                  color: categoryColor,
                                                  isFirstColumn: false,
                                                  isFirstRow: false,
                                                  isLastColumn:
                                                    locationIndex ===
                                                    comparisonTableLocations.length -
                                                      1,
                                                  isLastRow: isLastCategoryRow,
                                                }),
                                                buildSubcategoryLoopStyle({
                                                  color: subcategoryColor,
                                                  isFirstColumn: false,
                                                  isFirstRow: false,
                                                  isLastColumn:
                                                    locationIndex ===
                                                    comparisonTableLocations.length -
                                                      1,
                                                  isLastRow:
                                                    isLastSubcategoryQuestion,
                                                }),
                                              )}
                                              comparisonLocation={
                                                comparisonLocation
                                              }
                                              question={question}
                                            />
                                          ),
                                        )}
                                      </tr>
                                    );
                                  },
                                )}
                              </Fragment>
                            );
                          }

                          const isLastCategoryRow = isLastCategoryChild;

                          return (
                            <tr key={`question-${child.questionId}`}>
                              <td
                                className="sticky left-0 z-10 border-b bg-white p-3 pl-8"
                                style={buildCategoryLoopStyle({
                                  color: categoryColor,
                                  isFirstColumn: true,
                                  isFirstRow: false,
                                  isLastColumn:
                                    comparisonTableLocations.length === 0,
                                  isLastRow: isLastCategoryRow,
                                })}
                              >
                                <span className="break-words">
                                  {child.name}
                                </span>
                              </td>
                              {comparisonTableLocations.map(
                                (comparisonLocation, locationIndex) => (
                                  <QuestionComparisonCell
                                    key={`${child.questionId}-${comparisonLocation.location.id}`}
                                    cellStyle={buildCategoryLoopStyle({
                                      color: categoryColor,
                                      isFirstColumn: false,
                                      isFirstRow: false,
                                      isLastColumn:
                                        locationIndex ===
                                        comparisonTableLocations.length - 1,
                                      isLastRow: isLastCategoryRow,
                                    })}
                                    comparisonLocation={comparisonLocation}
                                    question={child}
                                  />
                                ),
                              )}
                            </tr>
                          );
                        })}
                      </Fragment>
                    );
                  })}
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
