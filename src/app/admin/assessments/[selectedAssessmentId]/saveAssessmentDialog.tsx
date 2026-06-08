"use client";

import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import type {
  FormValues,
  ResponseFormGeometry,
  ResponseFormImages,
  SerializedFormValues,
} from "@/components/ui/responseForm/responseFormTypes";
import dayjs from "@/lib/dayjs";
import { useUploadImageResponse } from "@/lib/serverFunctions/apiCalls/assessment";
import type {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
} from "@/lib/serverFunctions/queries/assessment";
import { _addResponsesV2 } from "@/lib/serverFunctions/serverActions/responseUtil";
import { Dayjs } from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";

const getDateTimeResponseFormat = (question: AssessmentQuestionItem) => {
  switch (question.characterType) {
    case "DATE":
      return "DD/MM/YYYY";
    case "TIME":
      return "HH:mm";
    case "DATETIME":
      return "DD/MM/YYYY HH:mm";
    default:
      throw new Error("Tried to get date format for non-date question");
  }
};

const buildDateResponseFormatByQuestionId = (
  categories: AssessmentCategoryItem[],
) => {
  const formatByQuestionId = new Map<string, string>();

  categories.forEach((category) => {
    category.categoryChildren.forEach((child) => {
      if ("questions" in child) {
        child.questions.forEach((question) => {
          if (
            question.questionType === "WRITTEN" &&
            (question.characterType === "DATE" ||
              question.characterType === "TIME" ||
              question.characterType === "DATETIME")
          ) {
            const format = getDateTimeResponseFormat(question);

            formatByQuestionId.set(String(question.questionId), format);
          }
        });
        return;
      }
      if (
        child.questionType === "WRITTEN" &&
        (child.characterType === "DATE" ||
          child.characterType === "TIME" ||
          child.characterType === "DATETIME")
      ) {
        const format = getDateTimeResponseFormat(child);
        formatByQuestionId.set(String(child.questionId), format);
      }
    });
  });

  return formatByQuestionId;
};

const serializeResponseFormValues = (
  values: FormValues,
  categories: AssessmentCategoryItem[],
) => {
  const dateFormatByQuestionId =
    buildDateResponseFormatByQuestionId(categories);

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (!dayjs.isDayjs(value)) {
        return [key, value];
      }

      const format = dateFormatByQuestionId.get(key);

      return [key, format && value.isValid() ? value.format(format) : null];
    }),
  ) as SerializedFormValues;
};

const SaveAssessmentDialog = ({
  open,
  locationName,
  assessmentId,
  formValues,
  geometries,
  importedEndDatetime,
  importedIsFinalized,
  startDate,
  driveFolderUrl,
  responseImages,
  categories,
  onResponseImageSynced,
  onClose,
}: {
  open: boolean;
  locationName: string;
  assessmentId: number;
  formValues: FormValues;
  geometries: ResponseFormGeometry[];
  importedEndDatetime: Dayjs | null;
  importedIsFinalized: boolean;
  startDate: Dayjs;
  driveFolderUrl: string | null;
  responseImages: ResponseFormImages;
  categories: AssessmentCategoryItem[];
  onResponseImageSynced: (questionId: number, imageIndex: number) => void;
  onClose: () => void;
}) => {
  const [enableJsonSaving, setEnableJsonSaving] = useState(false);
  const [showDatePickerError, setShowDatePickerError] = useState(false);
  const router = useRouter();
  const [isFinalized, setIsFinalized] = useState(importedIsFinalized);
  const [dateTime, setDateTime] = useState<Dayjs | null>(importedEndDatetime);
  const { setLoadingOverlay } = useLoadingOverlay();
  const { helperCardProcessResponse, setHelperCard } = useHelperCard();
  const [uploadImage] = useUploadImageResponse();
  const saveResponseImages = async (responseImages: ResponseFormImages) => {
    await Promise.all(
      Object.entries(responseImages).flatMap(([questionId, images]) =>
        images.flatMap((image, imageIndex) => {
          if (!image.file || image.status !== "UNSYNCED") {
            return [];
          }

          return uploadImage({
            image: image.file,
            folderId: "",
          }).then((response) => {
            if (
              response.responseInfo.statusCode < 200 ||
              response.responseInfo.statusCode >= 300
            ) {
              throw new Error(
                response.responseInfo.message ??
                  "Erro ao enviar imagem ao Google Drive!",
              );
            }

            onResponseImageSynced(Number(questionId), imageIndex);
          });
        }),
      ),
    );
  };
  const save = async () => {
    if (isFinalized && !dateTime) {
      setShowDatePickerError(true);
      return;
    }

    setLoadingOverlay({ show: true, message: "Salvando avaliação" });

    try {
      await saveResponseImages(responseImages);
      const serializedFormValues = serializeResponseFormValues(
        formValues,
        categories,
      );
      const response = await _addResponsesV2({
        assessmentId,
        responses: serializedFormValues,
        geometries: geometries,
        startDate: startDate.toDate(),
        endDate: dateTime?.toDate() ?? null,
        isFinalized: isFinalized,
        driveFolderUrl: driveFolderUrl,
      });
      helperCardProcessResponse(response.responseInfo);
      if (response.responseInfo.statusCode !== 201) {
        setEnableJsonSaving(true);
      } else {
        setEnableJsonSaving(false);
        if (response.data?.savedAsFinalized) {
          router.push(`/admin/assessments`);
        }
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao salvar avaliação!</>,
      });
      setEnableJsonSaving(true);
    }

    setLoadingOverlay({ show: false });
  };

  const generateExport = () => {
    const data = {
      startDate: startDate,
      endDateTime: dateTime ?? null,
      finalizationDateTime: dateTime ?? null,
      isFinalized: isFinalized,
      assessmentId: assessmentId,
      responses: serializeResponseFormValues(formValues, categories),
      geometries: geometries,
      driveFolderUrl: driveFolderUrl,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avaliação_${locationName}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setDateTime(importedEndDatetime);
    setIsFinalized(importedIsFinalized);
  }, [importedEndDatetime, importedIsFinalized]);

  useEffect(() => {
    if (isFinalized) {
      setDateTime((prev) => prev ?? dayjs(new Date()));
    }
  }, [isFinalized]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title={"Salvar avaliação"}
      cancelChildren={enableJsonSaving ? <>Tentar novamente</> : undefined}
      confirmChildren={enableJsonSaving ? <>Salvar offline</> : <>Salvar</>}
      onConfirm={() => {
        if (enableJsonSaving) {
          generateExport();
        } else {
          void save();
        }
      }}
      onCancel={() => {
        void save();
      }}
    >
      <div className="flex w-full flex-col gap-1">
        {enableJsonSaving && (
          <div className="flex w-full flex-col gap-1">
            <p>{"Ocorreu um erro ao salvar a avaliação."}</p>
            <p>
              {
                'Clique em "SALVAR OFFLINE" para salvar a avaliação em seu dispositivo.'
              }
            </p>
            <p>
              {
                "Com este arquivo, é possível enviar a avaliação posteriormente."
              }
            </p>
          </div>
        )}
        <CSwitch
          checked={isFinalized}
          label="Salvar como finalizado"
          onChange={(e) => {
            setIsFinalized(e.target.checked);
          }}
        />
        <CDateTimePicker
          value={dateTime}
          error={showDatePickerError}
          clearable
          onChange={(e) => {
            setShowDatePickerError(false);
            setDateTime(e);
          }}
          label="Data final"
        />
      </div>
    </CDialog>
  );
};

export default SaveAssessmentDialog;
