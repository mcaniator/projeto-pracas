"use client";

import ChooseResponsesSourceDialog from "@/app/admin/assessments/details/chooseResponsesSourceDialog";
import DriveFolderUrlDialog from "@/app/admin/assessments/details/driveFolderUrlDialog";
import { useUserContext } from "@/components/context/UserContext";
import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CButton from "@/components/ui/cButton";
import CChip from "@/components/ui/cChip";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CHelpChip from "@/components/ui/cHelpChip";
import ControlledResponseQuestionField from "@/components/ui/responseForm/controlledResponseQuestionField";
import ResponseFormCategory from "@/components/ui/responseForm/responseFormCategory";
import ResponseFormQuestionCard from "@/components/ui/responseForm/responseFormQuestionCard";
import ResponseFormQuestionGeometryControls from "@/components/ui/responseForm/responseFormQuestionGeometryControls";
import ResponseFormQuestionImageControls from "@/components/ui/responseForm/responseFormQuestionImageControls";
import ResponseFormSubcategory from "@/components/ui/responseForm/responseFormSubcategory";
import type {
  FormValues,
  ResponseFormGeometry,
  ResponseFormImage,
  ResponseFormImages,
  SerializedFormValues,
  SerializedResponseQuestionValue,
  SimpleMention,
} from "@/components/ui/responseForm/responseFormTypes";
import dayjs from "@/lib/dayjs";
import { dexieDb } from "@/lib/dexie/dexie";
import type { DexieAssessment } from "@/lib/dexie/dexie";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import {
  buildDateResponseFormatByQuestionId,
  deserializeResponseFormValues,
} from "@/lib/responseForm/responseForm";
import {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import { Calculation } from "@/lib/utils/calculationUtils";
import { Chip } from "@mui/material";
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconBrandGoogleDrive,
  IconCheck,
  IconClipboard,
  IconClipboardCheck,
  IconClipboardData,
  IconCloudExclamation,
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
  type UseFormSetValue,
  useForm,
  useWatch,
} from "react-hook-form";

import DeleteAssessmentDialog from "./deleteAssessmentDialog";
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
  assessmentTree: {
    id: number;
    startDate: Date;
    endDate: Date | null;
    updatedAt: Date;
    user: {
      username: string;
      id: string;
    };
    isFinalized: boolean;
    formName: string;
    totalQuestions: number;
    responsesFormValues: SerializedFormValues;
    geometries: ResponseFormGeometry[];
    categories: AssessmentCategoryItem[];
    driveFolderUrl: string | null;
  };
  finalized: boolean;
  userCanEdit: boolean;
  isPreview?: boolean;
  onValuesChange?: (values: FormValues) => void;
  onGeometriesChange?: (geometries: ResponseFormGeometry[]) => void;
  onImagesChange?: (images: ResponseFormImages) => void;
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
      onValuesChange,
      onGeometriesChange,
      onImagesChange,
    },
    ref,
  ) => {
    const { setHelperCard } = useHelperCard();
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
      useState<DexieAssessment>();
    const [localAssessmentUpdatedAt, setLocalAssessmentUpdatedAt] =
      useState<Date>();
    const [filledCount, setFilledCount] = useState(0);
    const [pendingServerSave, setPendingServerSave] = useState(false);
    const geometriesRef = useRef(geometries);
    const responseImagesRef = useRef(responseImages);
    const serializedFormValuesRef = useRef(assessmentTree.responsesFormValues);
    const nonResponseItemsIsDirtyRef = useRef(false);

    const allValues = useWatch({ control });

    const calculationDependencyIds = useMemo(() => {
      const ids = new Set<number>();

      const addCalculationDependencies = (question: AssessmentQuestionItem) => {
        if (!question.calculationExpression) return;

        const calc = new Calculation(question.calculationExpression);
        calc.getExpressionQuestionIds().forEach((id) => ids.add(id));
      };

      assessmentTree.categories.forEach((category) => {
        category.categoryChildren.forEach((child) => {
          if (isAssessmentSubcategoryItem(child)) {
            child.questions.forEach(addCalculationDependencies);
            return;
          }

          if (isAssessmentQuestionItem(child)) {
            addCalculationDependencies(child);
          }
        });
      });

      return ids;
    }, [assessmentTree.categories]);

    const numericResponses = useMemo(() => {
      const responses = new Map<number, number>();

      calculationDependencyIds.forEach((questionId) => {
        const value = allValues[String(questionId)];
        if (typeof value === "number") {
          responses.set(questionId, value);
        }
      });

      return responses;
    }, [allValues, calculationDependencyIds]);

    const totalQuestions = assessmentTree.totalQuestions;

    const applyLocalAssessmentValues = useCallback(
      (localAssessment: DexieAssessment) => {
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
        setResponseImages(localAssessment.responseImages);
        serializedFormValuesRef.current = localAssessment.responseFormValues;
        geometriesRef.current = localAssessment.geometries;
        responseImagesRef.current = localAssessment.responseImages;
        nonResponseItemsIsDirtyRef.current = false;
        setPendingLocalAssessmentChoice(undefined);
        setPendingServerSave(true);
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
        responseImagesRef.current = {};
        nonResponseItemsIsDirtyRef.current = false;
        setPendingLocalAssessmentChoice(undefined);
        try {
          await dexieDb.assessments.delete(assessmentTree.id);
          setPendingServerSave(false);
          setLocalAssessmentUpdatedAt(undefined);
        } catch (e) {
          setHelperCard({
            show: true,
            content: "Erro ao remover dados locais!",
            helperCardType: "ERROR",
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
      setHelperCard,
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
      nonResponseItemsIsDirtyRef.current = true;
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
        responseImagesRef.current = importedImages;
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

        setHelperCard({
          show: true,
          helperCardType: "CONFIRM",
          content: <>Avaliação importada!</>,
        });
      } catch (err) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Arquivo inválido!</>,
        });
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
          const localAssessment = await dexieDb.assessments.get(
            assessmentTree.id,
          );

          if (ignore || !localAssessment) {
            return;
          }
          setLocalAssessmentUpdatedAt(localAssessment.localUpdatedAt);

          const localServerUpdatedAt = new Date(
            localAssessment.serverUpdatedAt,
          ).getTime();
          const serverUpdatedAt = assessmentTree.updatedAt.getTime();

          if (serverUpdatedAt <= localServerUpdatedAt) {
            applyLocalAssessmentValues(localAssessment);
            return;
          }

          setPendingLocalAssessmentChoice(localAssessment);
        } catch (e) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Erro ao respostas locais!</>,
          });
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
      setHelperCard,
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
      responseImagesRef.current = responseImages;
      onImagesChange?.(responseImages);
    }, [responseImages, onImagesChange]);

    useEffect(() => {
      if (isPreview || (!isDirty && !nonResponseItemsIsDirtyRef.current))
        return;
      setPendingServerSave(true);
      const timeoutId = window.setTimeout(() => {
        const localAssessment: DexieAssessment = {
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
          responseImages: responseImagesRef.current,
        };

        void dexieDb.assessments.put(localAssessment);
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
      responseImages,
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
        className="flex w-full flex-col gap-2"
      >
        {!isPreview && (
          <div className="flex w-full flex-col gap-1">
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
                    label={dateTimeFormatter.format(assessmentTree.startDate)}
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
                    enableTopLeftChip={pendingServerSave}
                    tooltip="Reverter alterações locais"
                    square
                    disabled={!pendingServerSave}
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
                    enableTopLeftChip={pendingServerSave}
                    tooltip="Reverter alterações locais"
                    square
                    color="warning"
                    disabled={!pendingServerSave}
                    onClick={() => {
                      setOpenRevertLocalAssessmentDialog(true);
                    }}
                  >
                    <IconArrowBackUp />
                  </CButton>
                  {!isPreview && (
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
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {assessmentTree.categories.map((cat, index) => (
          <Category
            key={index}
            category={cat}
            numericResponses={numericResponses}
            geometries={geometries}
            responseImages={responseImages}
            questionsForMention={questionsForMention}
            finalized={!isFilling}
            locationPolygonGeoJson={locationPolygonGeoJson}
            handleQuestionGeometryChange={handleQuestionGeometryChange}
            handleQuestionImagesChange={handleQuestionImagesChange}
            control={control}
            setValue={setValue}
          />
        ))}

        <Chip
          label={`Campos preenchidos: ${filledCount} / ${totalQuestions}`}
          icon={
            filledCount < totalQuestions ? <IconAlertTriangle /> : <IconCheck />
          }
          color={filledCount < totalQuestions ? "warning" : "success"}
        />

        {isFilling && !isPreview && (
          <div className="flex flex-col justify-center gap-4">
            {pendingServerSave && (
              <Chip
                label="Respostas não enviadas!"
                color="error"
                icon={<IconCloudExclamation />}
              />
            )}
            <CButton type="submit">
              <IconDeviceFloppy />
              Salvar
            </CButton>
          </div>
        )}

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
              serverUpdatedAt={serverUpdatedAtRef.current}
              onResponseImageSynced={handleQuestionImageSynced}
              onSaveSuccess={(newUpdatedAt) => {
                serverUpdatedAtRef.current = newUpdatedAt;
                setServerUpdatedAtState(newUpdatedAt);
                setPendingServerSave(false);
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
            />
            <DeleteAssessmentDialog
              assessmentId={assessmentTree.id}
              open={openDeleteAssessmentDialog}
              locationId={locationId}
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
              applyLocalAssessmentValues(pendingLocalAssessmentChoice);
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
  numericResponses,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  setValue,
  finalized,
}: {
  category: AssessmentCategoryItem;
  numericResponses: Map<number, number>;
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
  setValue: UseFormSetValue<FormValues>;
  finalized: boolean;
}) => {
  return (
    <ResponseFormCategory category={category}>
      <>
        {category.categoryChildren.map((child, index) => {
          if (isAssessmentSubcategoryItem(child)) {
            return (
              <Subcategory
                key={index}
                subcategory={child}
                numericResponses={numericResponses}
                geometries={geometries}
                responseImages={responseImages}
                questionsForMention={questionsForMention}
                finalized={finalized}
                locationPolygonGeoJson={locationPolygonGeoJson}
                handleQuestionGeometryChange={handleQuestionGeometryChange}
                handleQuestionImagesChange={handleQuestionImagesChange}
                control={control}
                setValue={setValue}
              />
            );
          } else if (isAssessmentQuestionItem(child)) {
            return (
              <Question
                key={index}
                question={child}
                numericResponses={numericResponses}
                geometries={geometries}
                responseImages={responseImages}
                questionsForMention={questionsForMention}
                finalized={finalized}
                locationPolygonGeoJson={locationPolygonGeoJson}
                handleQuestionGeometryChange={handleQuestionGeometryChange}
                handleQuestionImagesChange={handleQuestionImagesChange}
                control={control}
                setValue={setValue}
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
  numericResponses,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  setValue,
  finalized,
}: {
  subcategory: AssessmentSubcategoryItem;
  numericResponses: Map<number, number>;
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
  setValue: UseFormSetValue<FormValues>;
  finalized: boolean;
}) => {
  return (
    <ResponseFormSubcategory subcategory={subcategory}>
      <>
        {subcategory.questions.map((question, index) => (
          <Question
            key={index}
            question={question}
            numericResponses={numericResponses}
            geometries={geometries}
            responseImages={responseImages}
            questionsForMention={questionsForMention}
            finalized={finalized}
            locationPolygonGeoJson={locationPolygonGeoJson}
            handleQuestionGeometryChange={handleQuestionGeometryChange}
            handleQuestionImagesChange={handleQuestionImagesChange}
            control={control}
            setValue={setValue}
          />
        ))}
      </>
    </ResponseFormSubcategory>
  );
};

const Question = ({
  question,
  numericResponses,
  geometries,
  responseImages,
  questionsForMention,
  locationPolygonGeoJson,
  handleQuestionGeometryChange,
  handleQuestionImagesChange,
  control,
  setValue,
  finalized,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
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
  setValue: UseFormSetValue<FormValues>;
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
        numericResponses={numericResponses}
        control={control}
        setValue={setValue}
        finalized={finalized}
      />
    </ResponseFormQuestionCard>
  );
};

export default ResponseFormV2;
