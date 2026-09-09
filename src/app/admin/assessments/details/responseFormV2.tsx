"use client";

import ChooseResponsesSourceDialog from "@/app/admin/assessments/details/chooseResponsesSourceDialog";
import DriveFolderUrlDialog from "@/app/admin/assessments/details/driveFolderUrlDialog";
import { useUserContext } from "@/components/context/UserContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CButton from "@/components/ui/cButton";
import CChip from "@/components/ui/cChip";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CHelpChip from "@/components/ui/cHelpChip";
import CalculationSynchronizer from "@/components/ui/responseForm/calculationSynchronizer";
import ControlledResponseQuestionField from "@/components/ui/responseForm/controlledResponseQuestionField";
import ResponseFormCategory from "@/components/ui/responseForm/responseFormCategory";
import ResponseFormQuestionCard from "@/components/ui/responseForm/responseFormQuestionCard";
import ResponseFormQuestionGeometryControls from "@/components/ui/responseForm/responseFormQuestionGeometryControls";
import ResponseFormQuestionImageControls from "@/components/ui/responseForm/responseFormQuestionImageControls";
import ResponseFormSubcategory from "@/components/ui/responseForm/responseFormSubcategory";
import dayjs from "@/lib/dayjs";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import {
  buildDateResponseFormatByQuestionId,
  deserializeResponseFormValues,
} from "@/lib/responseForm/responseForm";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
  FetchAssessmentTreeResponse,
} from "@/lib/serverFunctions/queries/assessment";
import type {
  AssessmentDraft,
  FormValues,
  ResponseFormGeometry,
  ResponseFormImage,
  ResponseFormImages,
  ResponseGeometry,
  SerializedFormValues,
  SerializedResponseQuestionValue,
  SimpleMention,
} from "@/lib/types/assessments/responseFormTypes";
import { Chip, Divider } from "@mui/material";
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconBrandGoogleDrive,
  IconCheck,
  IconClipboard,
  IconClipboardCheck,
  IconClipboardData,
  IconDeviceFloppy,
  IconPencil,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { assessmentImportDataSchema } from "@zodValidators";
import { Dayjs } from "dayjs";
import JSZip from "jszip";
import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Control,
  useForm,
  useWatch,
} from "react-hook-form";
import { Virtuoso } from "react-virtuoso";

import DeleteAssessmentDialog from "./deleteAssessmentDialog";
import {
  deleteAssessmentResponsesDraft,
  loadAssessmentResponsesDraft,
  saveAssessmentResponsesDraft,
} from "./responseFormUtil";
import RevertLocalAssessmentDialog from "./revertLocalAssessmentDialog";
import SaveAssessmentDialog from "./saveAssessmentDialog";

export const isAssessmentSubcategoryItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentSubcategoryItem => {
  return "questions" in item;
};

export const isAssessmentQuestionItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentQuestionItem => {
  return "questionId" in item && item.questionId !== null;
};

export type ResponseFormV2Handle = {
  importData: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

type ResponseFormV2Props = {
  locationId: number;
  locationName: string;
  locationPolygonGeoJson: string | null;
  assessmentTree: FetchAssessmentTreeResponse["assessmentTree"];
  finalized: boolean;
  userCanEdit: boolean;
  isPreview?: boolean;
  canSaveOffline?: boolean;
  isSQLiteAssessment?: boolean;
  onValuesChange?: (values: FormValues) => void;
  onGeometriesChange?: (geometries: ResponseFormGeometry[]) => void;
  onImagesChange?: (images: ResponseFormImages) => void;
  onIsSQLiteAssessmentChange?: (v: boolean) => void;
};

const ResponseFormV2 = forwardRef<ResponseFormV2Handle, ResponseFormV2Props>(
  (
    {
      locationId,
      locationName,
      locationPolygonGeoJson,
      assessmentTree,
      finalized,
      userCanEdit,
      isPreview = false,
      canSaveOffline = false,
      isSQLiteAssessment = false,
      onValuesChange,
      onGeometriesChange,
      onImagesChange,
      onIsSQLiteAssessmentChange,
    },
    ref,
  ) => {
    const { enqueueSnackbar } = useAppSnackbar();
    const { user } = useUserContext();
    const { setLoadingOverlay } = useLoadingOverlay();
    const defaultResponseFormValues = useMemo(
      () =>
        deserializeResponseFormValues(
          assessmentTree.responsesFormValues,
          assessmentTree.categories,
        ),
      [assessmentTree.categories, assessmentTree.responsesFormValues],
    );
    const dateFormatByQuestionId = useMemo(
      () => buildDateResponseFormatByQuestionId(assessmentTree.categories),
      [assessmentTree.categories],
    );
    const {
      control,
      handleSubmit,
      reset,
      setValue,
      formState: { isDirty },
    } = useForm<FormValues>({
      mode: "onChange",
      defaultValues: defaultResponseFormValues,
    });
    //serverUpdatedAtRef is used to save the serverUpdatedAt in the local database
    const serverUpdatedAtRef = useRef(assessmentTree.updatedAt);
    //serverUpdatedAtState is used to render the latest serverUpdatedAt
    const [serverUpdatedAtState, setServerUpdatedAtState] = useState(
      assessmentTree.updatedAt,
    );

    const [questionsForMention] = useState(() => {
      const questions: SimpleMention[] = [];
      assessmentTree.categories.forEach((c) => {
        c.categoryChildren.forEach((ch) => {
          if (isAssessmentSubcategoryItem(ch)) {
            ch.questions.forEach((q) => {
              questions.push({
                id: String(q.questionId),
                display: `${q.categoryName} ➤${q.subcategoryName ? " " + q.subcategoryName + " " : ""}➤ ${q.name}`,
              });
            });
          } else if (isAssessmentQuestionItem(ch)) {
            questions.push({
              id: String(ch.questionId),
              display: `${ch.categoryName} ➤${ch.subcategoryName ? " " + ch.subcategoryName + " " : ""}➤ ${ch.name}`,
            });
          }
        });
      });
      return questions;
    });

    const [isFinalized, setIsFinalized] = useState(finalized);

    const [isFilling, setIsFilling] = useState(
      isFinalized ? false
      : userCanEdit ? true
      : false,
    );

    const [endDate, setEndDate] = useState<Dayjs | null>(
      assessmentTree.endDate ? dayjs(assessmentTree.endDate) : null,
    );

    const [startDate, setStartDate] = useState<Dayjs>(
      dayjs(assessmentTree.startDate),
    );

    const [openDriveFolderUrlDialog, setOpenDriveFolderUrlDialog] =
      useState(false);

    const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(
      assessmentTree.driveFolderUrl,
    );

    const [geometries, setGeometries] = useState<ResponseFormGeometry[]>(
      assessmentTree.geometries,
    );
    const [responseImages, setResponseImages] = useState<ResponseFormImages>(
      {},
    );
    const [formValues, setFormValues] = useState<FormValues>({});
    const [openSaveDialog, setOpenSaveDialog] = useState(false);
    const [openDeleteAssessmentDialog, setOpenDeleteAssessmentDialog] =
      useState(false);
    const [
      openRevertLocalAssessmentDialog,
      setOpenRevertLocalAssessmentDialog,
    ] = useState(false);
    const [pendingLocalAssessmentChoice, setPendingLocalAssessmentChoice] =
      useState<AssessmentDraft>();
    const [localAssessmentUpdatedAt, setLocalAssessmentUpdatedAt] =
      useState<Date>();
    const [filledCount, setFilledCount] = useState(0);
    const [pendingSaveFromDraft, setPendingSaveFromDraft] = useState(false);
    const [expandedCategoryIds, setExpandedCategoryIds] = useState(
      () =>
        new Set(
          assessmentTree.categories.map((category) => category.categoryId),
        ),
    );
    const [expandedSubcategoryIds, setExpandedSubcategoryIds] = useState(
      () =>
        new Set(
          assessmentTree.categories.flatMap((category) =>
            category.categoryChildren.flatMap((child) =>
              isAssessmentSubcategoryItem(child) ? [child.subcategoryId] : [],
            ),
          ),
        ),
    );
    const geometriesRef = useRef(geometries);
    const serializedFormValuesRef = useRef(assessmentTree.responsesFormValues);
    const nonResponseItemsIsDirtyRef = useRef(false);

    const allValues = useWatch({ control });

    const handleCategoryExpandedChange = useCallback(
      (categoryId: number, expanded: boolean) => {
        setExpandedCategoryIds((current) => {
          const next = new Set(current);
          if (expanded) {
            next.add(categoryId);
          } else {
            next.delete(categoryId);
          }
          return next;
        });
      },
      [],
    );

    const handleSubcategoryExpandedChange = useCallback(
      (subcategoryId: number, expanded: boolean) => {
        setExpandedSubcategoryIds((current) => {
          const next = new Set(current);
          if (expanded) {
            next.add(subcategoryId);
          } else {
            next.delete(subcategoryId);
          }
          return next;
        });
      },
      [],
    );

    const totalQuestions = assessmentTree.totalQuestions;

    const applyLocalAssessmentValues = useCallback(
      (localAssessment: AssessmentDraft) => {
        const localFormValues = deserializeResponseFormValues(
          localAssessment.responseFormValues,
          assessmentTree.categories,
        );

        reset(localFormValues);
        setIsFinalized(localAssessment.isFinalized);
        setIsFilling(true);
        setStartDate(dayjs(localAssessment.startDate));
        setEndDate(
          localAssessment.endDate ? dayjs(localAssessment.endDate) : null,
        );
        setDriveFolderUrl(localAssessment.driveFolderUrl);
        setGeometries(localAssessment.geometries);
        serializedFormValuesRef.current = localAssessment.responseFormValues;
        geometriesRef.current = localAssessment.geometries;
        nonResponseItemsIsDirtyRef.current = false;
        setPendingLocalAssessmentChoice(undefined);
        setPendingSaveFromDraft(true);
      },
      [assessmentTree.categories, reset],
    );

    const applyServerAssessmentValues = useCallback(() => {
      const applyServerValuesAndDeleteLocalValues = async () => {
        setLoadingOverlay({ show: true, message: "Carregando..." });
        reset(defaultResponseFormValues);
        setIsFinalized(assessmentTree.isFinalized);
        setIsFilling(!assessmentTree.isFinalized);
        setStartDate(dayjs(assessmentTree.startDate));
        setEndDate(
          assessmentTree.endDate ? dayjs(assessmentTree.endDate) : null,
        );
        setDriveFolderUrl(assessmentTree.driveFolderUrl);
        setGeometries(assessmentTree.geometries);
        setResponseImages({}); //TODO
        serializedFormValuesRef.current = assessmentTree.responsesFormValues;
        geometriesRef.current = assessmentTree.geometries;
        nonResponseItemsIsDirtyRef.current = false;
        setPendingLocalAssessmentChoice(undefined);
        try {
          await deleteAssessmentResponsesDraft(assessmentTree.id);
          setPendingSaveFromDraft(false);
          setLocalAssessmentUpdatedAt(undefined);
        } catch (e) {
          enqueueSnackbar("Erro ao remover dados locais!", {
            variant: "error",
          });
        } finally {
          if (assessmentTree.isFinalized) {
            setIsFilling(false);
          }
          setLoadingOverlay({ show: false });
        }
      };

      void applyServerValuesAndDeleteLocalValues();
    }, [
      assessmentTree,
      defaultResponseFormValues,
      reset,
      enqueueSnackbar,
      setLoadingOverlay,
    ]);

    const handleQuestionGeometryChange = ({
      questionId,
      geometries,
    }: {
      questionId: number;
      geometries: ResponseGeometry[];
    }) => {
      nonResponseItemsIsDirtyRef.current = true;
      setGeometries((prev) => {
        if (prev.some((p) => p.questionId === questionId)) {
          return prev.map((p) => {
            if (p.questionId === questionId) {
              return { questionId: questionId, geometries: geometries };
            } else {
              return p;
            }
          });
        } else {
          prev.push({ questionId: questionId, geometries: geometries });
          return [...prev];
        }
      });
    };

    const handleQuestionImagesChange = (
      questionId: number,
      images: ResponseFormImage[],
    ) => {
      setResponseImages((prev) => ({
        ...prev,
        [questionId]: images,
      }));
    };

    const handleQuestionImageSynced = (
      questionId: number,
      imageIndex: number,
    ) => {
      setResponseImages((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] ?? []).map((image, index) =>
          index === imageIndex ? { ...image, status: "SYNCED" } : image,
        ),
      }));
    };

    const onSubmit = (data: FormValues) => {
      setFormValues(data);
      setOpenSaveDialog(true);
    };

    const importData = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const zip = await JSZip.loadAsync(file);
        const manifestFile = zip.file("assessment.json");
        if (!manifestFile) throw new Error("Manifesto não encontrado");
        const manifest = await manifestFile.async("string");

        const importedData = assessmentImportDataSchema.parse(
          JSON.parse(manifest),
        );
        const importedImages: ResponseFormImages = Object.fromEntries(
          await Promise.all(
            Object.entries(importedData.responseImages).map(
              async ([questionId, images]) =>
                [
                  questionId,
                  await Promise.all(
                    images.map(async (image) => {
                      const imageEntry =
                        image.path ? zip.file(image.path) : null;
                      if (image.path && !imageEntry) {
                        throw new Error(`Imagem ausente: ${image.path}`);
                      }
                      const imageBytes = await imageEntry?.async("arraybuffer");

                      return {
                        file:
                          imageBytes ?
                            new File([imageBytes], image.name, {
                              type: image.type,
                              lastModified: image.lastModified,
                            })
                          : undefined,
                        url: image.url,
                        status: image.status,
                      };
                    }),
                  ),
                ] as const,
            ),
          ),
        );

        reset(
          deserializeResponseFormValues(
            importedData.responses,
            assessmentTree.categories,
          ),
        );

        const incomingGeoms = importedData.geometries;
        nonResponseItemsIsDirtyRef.current = true;
        setGeometries(incomingGeoms);
        setResponseImages(importedImages);
        geometriesRef.current = incomingGeoms;
        serializedFormValuesRef.current = importedData.responses;

        const startDate = dayjs(importedData.startDate);
        setStartDate(startDate);

        setEndDate(
          importedData.endDate && dayjs(importedData.endDate).isValid() ?
            dayjs(importedData.endDate)
          : null,
        );
        setIsFinalized(importedData.isFinalized);

        setDriveFolderUrl(importedData.driveFolderUrl);

        enqueueSnackbar(<>Avaliação importada!</>, { variant: "success" });
      } catch (err) {
        enqueueSnackbar(<>Arquivo inválido!</>, { variant: "error" });
      } finally {
        e.target.value = "";
      }
    };

    useImperativeHandle(ref, () => ({ importData }));

    useEffect(() => {
      if (isPreview) return;

      let ignore = false;

      const loadLocalAssessment = async () => {
        try {
          setLoadingOverlay({
            show: true,
            message: "Carregando respostas locais...",
          });
          const localAssessment = await loadAssessmentResponsesDraft(
            assessmentTree.id,
          );

          if (ignore || !localAssessment) {
            return;
          }
          setLocalAssessmentUpdatedAt(localAssessment.localUpdatedAt);

          const localServerUpdatedAt =
            localAssessment.serverUpdatedAt.getTime();
          const serverUpdatedAt = assessmentTree.updatedAt.getTime();

          if (serverUpdatedAt <= localServerUpdatedAt) {
            applyLocalAssessmentValues(localAssessment);
            return;
          }

          setPendingLocalAssessmentChoice(localAssessment);
        } catch (e) {
          enqueueSnackbar(<>Erro ao respostas locais!</>, { variant: "error" });
        } finally {
          setLoadingOverlay({ show: false });
        }
      };

      void loadLocalAssessment();

      // Guard in case user leaves the page before the local assessment is loaded
      return () => {
        ignore = true;
      };
    }, [
      enqueueSnackbar,
      setLoadingOverlay,
      applyLocalAssessmentValues,
      assessmentTree.id,
      assessmentTree.updatedAt,
      isPreview,
    ]);

    useEffect(() => {
      // This useEffect is called when the form values change.
      // It updates the numeric responses, the filled fields counter, calls the onValuesChange callback for the preview and updates the local database.
      let filledFieldsCounter = 0;
      const normalizedValues: FormValues = {};
      const serializedValues: SerializedFormValues = {};

      Object.entries(allValues).forEach(([key, value]) => {
        const val = value === undefined ? null : value;
        normalizedValues[key] = val as FormValues[string];

        if (
          val != null &&
          val !== "" &&
          (!(val instanceof Array) || val.length > 0) &&
          (!dayjs.isDayjs(val) || val.isValid())
        ) {
          filledFieldsCounter++;
        }

        // Here we are serializing the values. We don't use "serializeResponseFormValues" because we can use the current loop.
        let serializedValue: SerializedResponseQuestionValue;
        if (dayjs.isDayjs(val)) {
          const format = dateFormatByQuestionId.get(key);
          serializedValue = format && val.isValid() ? val.format(format) : null;
        } else {
          serializedValue = val as SerializedResponseQuestionValue;
        }

        serializedValues[key] = serializedValue;
      });

      serializedFormValuesRef.current = serializedValues;
      setFilledCount(filledFieldsCounter);
      onValuesChange?.(normalizedValues);
    }, [allValues, dateFormatByQuestionId, onValuesChange]);

    useEffect(() => {
      geometriesRef.current = geometries;
      onGeometriesChange?.(geometries);
    }, [geometries, onGeometriesChange]);

    useEffect(() => {
      onImagesChange?.(responseImages);
    }, [responseImages, onImagesChange]);

    useEffect(() => {
      if (isPreview || (!isDirty && !nonResponseItemsIsDirtyRef.current))
        return;
      setPendingSaveFromDraft(true);
      const timeoutId = window.setTimeout(() => {
        const localAssessment: AssessmentDraft = {
          id: assessmentTree.id,
          userId: user.id,
          username: user.username,
          serverUpdatedAt: serverUpdatedAtRef.current,
          localUpdatedAt: new Date(),
          isFinalized: isFinalized,
          startDate: startDate.toDate(),
          endDate: endDate?.toDate() ?? null,
          driveFolderUrl: driveFolderUrl,
          responseFormValues: serializedFormValuesRef.current,
          geometries: geometriesRef.current,
        };

        void saveAssessmentResponsesDraft(localAssessment);
        setLocalAssessmentUpdatedAt(localAssessment.localUpdatedAt);
      }, 500);

      return () => window.clearTimeout(timeoutId);
    }, [
      allValues,
      assessmentTree.id,
      assessmentTree.startDate,
      assessmentTree.updatedAt,
      isFinalized,
      startDate,
      endDate,
      driveFolderUrl,
      geometries,
      isDirty,
      isPreview,
      user,
    ]);

    return (
      <form
        onSubmit={(e) => {
          if (isPreview) {
            e.preventDefault();
            return;
          }
          void handleSubmit(onSubmit)(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();

            const form = e.currentTarget;
            const elements = Array.from(form.elements);
            const currentIndex = elements.indexOf(e.target as Element);
            for (let i = currentIndex + 1; i < elements.length; i++) {
              const el = elements[i] as HTMLElement;
              const realInput =
                el.tagName === "INPUT" ?
                  el
                : (el.querySelector("input") as HTMLElement | null);

              if (realInput) {
                realInput.focus();
                return;
              }
            }
          }
        }}
        className="flex h-full w-full flex-col"
      >
        <CalculationSynchronizer
          categories={assessmentTree.categories}
          control={control}
          setValue={setValue}
        />
        <div className="min-h-0 flex-1 px-2">
          <Virtuoso
            data={assessmentTree.categories}
            style={{ height: "100%", overflowX: "hidden" }}
            computeItemKey={(_, category) => category.categoryId}
            components={{
              Header: () => {
                if (isPreview) return null;

                return (
                  <div className="flex w-full flex-col gap-1 py-2">
                    <CChip
                      label={assessmentTree.formName}
                      icon={<IconClipboard />}
                      sx={{ fontSize: 16 }}
                      tooltip="Formulário"
                      className="w-fit"
                    />
                    <CChip
                      label={assessmentTree.user.username}
                      icon={<IconUser />}
                      sx={{ fontSize: 16 }}
                      tooltip="Avaliador"
                      className="w-fit"
                    />
                    {!isFilling && (
                      <div className="flex flex-wrap justify-between gap-1">
                        <div className="flex flex-wrap gap-1">
                          <CChip
                            icon={<IconClipboardData />}
                            label={dateTimeFormatter.format(
                              assessmentTree.startDate,
                            )}
                            sx={{ fontSize: 16 }}
                            tooltip="Início"
                          />
                          <CChip
                            icon={<IconClipboardCheck />}
                            label={`${assessmentTree.endDate ? dateTimeFormatter.format(assessmentTree.endDate) : "Indefinido"}`}
                            sx={{ fontSize: 16 }}
                            tooltip="Fim"
                          />
                        </div>

                        <div className="flex gap-1">
                          {userCanEdit && (
                            <>
                              <CHelpChip tooltip="Você possui permissão para editar esta avaliação finalizada." />
                              <CButton
                                square
                                onClick={() => {
                                  setIsFilling(true);
                                }}
                              >
                                <IconPencil />
                              </CButton>
                            </>
                          )}
                          <CButton
                            topLeftChipLabel={"!"}
                            enableTopLeftChip={pendingSaveFromDraft}
                            tooltip="Reverter alterações locais"
                            square
                            disabled={!pendingSaveFromDraft}
                            onClick={() => {
                              setOpenRevertLocalAssessmentDialog(true);
                            }}
                          >
                            <IconArrowBackUp />
                          </CButton>
                          <CButton
                            square
                            tooltip="Drive"
                            enableTopLeftChip={!!driveFolderUrl}
                            topLeftChipLabel={"1"}
                            disabled={!driveFolderUrl}
                            onClick={() => {
                              setOpenDriveFolderUrlDialog(true);
                            }}
                          >
                            <IconBrandGoogleDrive />
                          </CButton>
                        </div>
                      </div>
                    )}
                    {isFilling && (
                      <div className="flex flex-wrap content-center justify-between gap-4">
                        <CDateTimePicker
                          label="Início"
                          value={startDate}
                          onChange={(e) => {
                            if (!e) return;
                            nonResponseItemsIsDirtyRef.current = true;
                            setStartDate(e);
                          }}
                        />

                        <div className="flex items-center justify-end gap-2">
                          <CButton
                            square
                            tooltip="Drive"
                            enableTopLeftChip={!!driveFolderUrl}
                            topLeftChipLabel={"1"}
                            onClick={() => {
                              setOpenDriveFolderUrlDialog(true);
                            }}
                          >
                            <IconBrandGoogleDrive />
                          </CButton>
                          <CButton
                            topLeftChipLabel={"!"}
                            enableTopLeftChip={pendingSaveFromDraft}
                            tooltip="Reverter alterações locais"
                            square
                            color="warning"
                            disabled={!pendingSaveFromDraft}
                            onClick={() => {
                              setOpenRevertLocalAssessmentDialog(true);
                            }}
                          >
                            <IconArrowBackUp />
                          </CButton>
                          <CButton
                            square
                            tooltip="Excluir avaliação"
                            color="error"
                            onClick={() => {
                              setOpenDeleteAssessmentDialog(true);
                            }}
                          >
                            <IconTrash />
                          </CButton>
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            }}
            itemContent={(_, category) => (
              <div className="pb-2">
                <Category
                  category={category}
                  geometries={geometries}
                  responseImages={responseImages}
                  questionsForMention={questionsForMention}
                  finalized={!isFilling}
                  expanded={expandedCategoryIds.has(category.categoryId)}
                  onExpandedChange={handleCategoryExpandedChange}
                  expandedSubcategoryIds={expandedSubcategoryIds}
                  onSubcategoryExpandedChange={handleSubcategoryExpandedChange}
                  locationPolygonGeoJson={locationPolygonGeoJson}
                  handleQuestionGeometryChange={handleQuestionGeometryChange}
                  handleQuestionImagesChange={handleQuestionImagesChange}
                  control={control}
                />
              </div>
            )}
          />
        </div>
        <Divider />
        <div className="mt-2 flex flex-col gap-2 px-2">
          <Chip
            label={`Campos preenchidos: ${filledCount} / ${totalQuestions}`}
            icon={
              filledCount < totalQuestions ?
                <IconAlertTriangle />
              : <IconCheck />
            }
            color={filledCount < totalQuestions ? "warning" : "success"}
          />

          {isFilling && !isPreview && (
            <div className="flex flex-col justify-center gap-4">
              <CButton
                className="ml-auto w-fit"
                type="submit"
                enableTopLeftChip={pendingSaveFromDraft}
                topLeftChipLabel={"!"}
              >
                <IconDeviceFloppy />
                Salvar
              </CButton>
            </div>
          )}
        </div>

        {!isPreview && (
          <>
            <SaveAssessmentDialog
              locationName={locationName}
              assessmentId={assessmentTree.id}
              open={openSaveDialog}
              formValues={formValues}
              geometries={geometries}
              endDate={endDate}
              isFinalized={isFinalized}
              startDate={startDate}
              driveFolderUrl={driveFolderUrl}
              responseImages={responseImages}
              categories={assessmentTree.categories}
              locationId={locationId}
              formId={assessmentTree.formId}
              serverUpdatedAt={serverUpdatedAtRef.current}
              canSaveOffline={canSaveOffline}
              isSQLiteAssessment={isSQLiteAssessment}
              onResponseImageSynced={handleQuestionImageSynced}
              onSaveSuccess={(newUpdatedAt) => {
                serverUpdatedAtRef.current = newUpdatedAt;
                setServerUpdatedAtState(newUpdatedAt);
                setPendingSaveFromDraft(false);
              }}
              onClose={() => {
                setOpenSaveDialog(false);
              }}
              onIsFinalizedChange={(v) => {
                nonResponseItemsIsDirtyRef.current = true;
                setIsFinalized(v);
              }}
              onEndDateChange={(v) => {
                nonResponseItemsIsDirtyRef.current = true;
                setEndDate(v);
              }}
              onIsSQLiteAssessmentChange={onIsSQLiteAssessmentChange}
            />
            <DeleteAssessmentDialog
              assessmentId={assessmentTree.id}
              open={openDeleteAssessmentDialog}
              isSQLiteAssessment={isSQLiteAssessment}
              onClose={() => {
                setOpenDeleteAssessmentDialog(false);
              }}
            />

            <RevertLocalAssessmentDialog
              open={openRevertLocalAssessmentDialog}
              localUpdatedAt={localAssessmentUpdatedAt}
              serverUpdatedAt={serverUpdatedAtState}
              onClose={() => {
                setOpenRevertLocalAssessmentDialog(false);
              }}
              onConfirm={() => {
                setOpenRevertLocalAssessmentDialog(false);
                applyServerAssessmentValues();
                enqueueSnackbar("Revertido com sucesso!", {
                  variant: "success",
                });
              }}
            />
          </>
        )}
        <DriveFolderUrlDialog
          open={openDriveFolderUrlDialog}
          driveFolderUrl={driveFolderUrl}
          isFilling={isFilling}
          onClose={() => setOpenDriveFolderUrlDialog(false)}
          onConfirm={(url) => {
            nonResponseItemsIsDirtyRef.current = true;
            setDriveFolderUrl(url);
          }}
        />
        {!!pendingLocalAssessmentChoice && (
          <ChooseResponsesSourceDialog
            serverSource={{
              updatedAt: assessmentTree.updatedAt,
              username: assessmentTree.user.username,
            }}
            localSource={{
              updatedAt: pendingLocalAssessmentChoice?.localUpdatedAt,
              username: pendingLocalAssessmentChoice?.username,
            }}
            applyServerAssessmentValues={applyServerAssessmentValues}
            applyLocalAssessmentValues={() => {
              void applyLocalAssessmentValues(pendingLocalAssessmentChoice);
            }}
          />
        )}
      </form>
    );
  },
);

ResponseFormV2.displayName = "ResponseFormV2";

const Category = ({
  category,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  finalized,
  expanded,
  onExpandedChange,
  expandedSubcategoryIds,
  onSubcategoryExpandedChange,
}: {
  category: AssessmentCategoryItem;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  questionsForMention: SimpleMention[];
  locationPolygonGeoJson: string | null;
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  handleQuestionImagesChange: (
    questionId: number,
    images: ResponseFormImage[],
  ) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
  expanded: boolean;
  onExpandedChange: (categoryId: number, expanded: boolean) => void;
  expandedSubcategoryIds: Set<number>;
  onSubcategoryExpandedChange: (
    subcategoryId: number,
    expanded: boolean,
  ) => void;
}) => {
  return (
    <ResponseFormCategory
      category={category}
      expanded={expanded}
      onExpandedChange={(nextExpanded) =>
        onExpandedChange(category.categoryId, nextExpanded)
      }
    >
      <>
        {category.categoryChildren.map((child, index) => {
          if (isAssessmentSubcategoryItem(child)) {
            return (
              <Subcategory
                key={index}
                subcategory={child}
                geometries={geometries}
                responseImages={responseImages}
                questionsForMention={questionsForMention}
                finalized={finalized}
                expanded={expandedSubcategoryIds.has(child.subcategoryId)}
                onExpandedChange={onSubcategoryExpandedChange}
                locationPolygonGeoJson={locationPolygonGeoJson}
                handleQuestionGeometryChange={handleQuestionGeometryChange}
                handleQuestionImagesChange={handleQuestionImagesChange}
                control={control}
              />
            );
          } else if (isAssessmentQuestionItem(child)) {
            return (
              <Question
                key={index}
                question={child}
                geometries={geometries}
                responseImages={responseImages}
                questionsForMention={questionsForMention}
                finalized={finalized}
                locationPolygonGeoJson={locationPolygonGeoJson}
                handleQuestionGeometryChange={handleQuestionGeometryChange}
                handleQuestionImagesChange={handleQuestionImagesChange}
                control={control}
              />
            );
          }
        })}
      </>
    </ResponseFormCategory>
  );
};

const Subcategory = ({
  subcategory,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  finalized,
  expanded,
  onExpandedChange,
}: {
  subcategory: AssessmentSubcategoryItem;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  questionsForMention: SimpleMention[];
  locationPolygonGeoJson: string | null;
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  handleQuestionImagesChange: (
    questionId: number,
    images: ResponseFormImage[],
  ) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
  expanded: boolean;
  onExpandedChange: (subcategoryId: number, expanded: boolean) => void;
}) => {
  return (
    <ResponseFormSubcategory
      subcategory={subcategory}
      expanded={expanded}
      onExpandedChange={(nextExpanded) =>
        onExpandedChange(subcategory.subcategoryId, nextExpanded)
      }
    >
      <>
        {subcategory.questions.map((question, index) => (
          <Question
            key={index}
            question={question}
            geometries={geometries}
            responseImages={responseImages}
            questionsForMention={questionsForMention}
            finalized={finalized}
            locationPolygonGeoJson={locationPolygonGeoJson}
            handleQuestionGeometryChange={handleQuestionGeometryChange}
            handleQuestionImagesChange={handleQuestionImagesChange}
            control={control}
          />
        ))}
      </>
    </ResponseFormSubcategory>
  );
};

const Question = ({
  question,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  finalized,
}: {
  question: AssessmentQuestionItem;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  questionsForMention: SimpleMention[];
  locationPolygonGeoJson: string | null;
  handleQuestionGeometryChange: (params: ResponseFormGeometry) => void;
  handleQuestionImagesChange: (
    questionId: number,
    images: ResponseFormImage[],
  ) => void;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  return (
    <ResponseFormQuestionCard
      question={question}
      questionsForMention={questionsForMention}
      questionControls={
        <>
          <ResponseFormQuestionGeometryControls
            question={question}
            geometries={geometries}
            locationPolygonGeoJson={locationPolygonGeoJson}
            finalized={finalized}
            handleQuestionGeometryChange={handleQuestionGeometryChange}
          />
          <ResponseFormQuestionImageControls
            question={question}
            responseImages={responseImages}
            finalized={finalized}
            onQuestionImagesChange={handleQuestionImagesChange}
          />
        </>
      }
    >
      <ControlledResponseQuestionField
        question={question}
        control={control}
        finalized={finalized}
      />
    </ResponseFormQuestionCard>
  );
};

export default ResponseFormV2;
