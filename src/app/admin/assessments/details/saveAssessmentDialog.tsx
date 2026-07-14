"use client";

import { useUserContext } from "@/components/context/UserContext";
import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import type {
  FormValues,
  ResponseFormGeometry,
  ResponseFormImages,
} from "@/components/ui/responseForm/responseFormTypes";
import dayjs from "@/lib/dayjs";
import { dexieDb } from "@/lib/dexie/dexie";
import { serializeResponseFormValues } from "@/lib/responseForm/responseForm";
import {
  useAddResponses,
  useUploadImageResponse,
} from "@/lib/serverFunctions/apiCalls/assessment";
import type { AssessmentCategoryItem } from "@/lib/serverFunctions/queries/assessment";
import { Dayjs } from "dayjs";
import JSZip from "jszip";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";

const imageExtensionsByMimeType: Record<string, readonly string[]> = {
  "image/avif": ["avif"],
  "image/bmp": ["bmp"],
  "image/gif": ["gif"],
  "image/heic": ["heic"],
  "image/heif": ["heif"],
  "image/jpeg": ["jpg", "jpeg", "jfif"],
  "image/jpg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/svg+xml": ["svg"],
  "image/tiff": ["tif", "tiff"],
  "image/webp": ["webp"],
};

const ensureImageFileExtension = (name: string, mimeType: string) => {
  const validExtensions = imageExtensionsByMimeType[mimeType.toLowerCase()];
  if (!validExtensions) return name;

  const currentExtension = name.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
  if (currentExtension && validExtensions.includes(currentExtension)) {
    return name;
  }

  const nameWithoutExtension =
    currentExtension ? name.slice(0, -currentExtension.length - 1) : name;
  return `${nameWithoutExtension}.${validExtensions[0]}`;
};

const normalizeToSnakeCase = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizeImageFileName = (name: string) => {
  const extensionStart = name.lastIndexOf(".");
  const extension = name
    .slice(extensionStart + 1)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (extensionStart <= 0) return normalizeToSnakeCase(name) || "imagem";

  const normalizedName = normalizeToSnakeCase(name.slice(0, extensionStart));

  return extension ?
      `${normalizedName || "imagem"}.${extension}`
    : normalizedName;
};

const normalizeQuestionFolderName = (name: string, questionId: number) => {
  const normalizedName = normalizeToSnakeCase(name)
    .slice(0, 20)
    .replace(/_+$/g, "");

  return normalizedName || `questao_${questionId}`;
};

const buildQuestionFolderNameById = (categories: AssessmentCategoryItem[]) => {
  const folderNameById = new Map<number, string>();

  categories.forEach((category) => {
    category.categoryChildren.forEach((child) => {
      const questions = "questions" in child ? child.questions : [child];
      questions.forEach((question) => {
        folderNameById.set(
          question.questionId,
          normalizeQuestionFolderName(question.name, question.questionId),
        );
      });
    });
  });

  return folderNameById;
};

const SaveAssessmentDialog = ({
  open,
  locationName,
  assessmentId,
  formValues,
  geometries,
  isFinalized,
  endDate,
  startDate,
  driveFolderUrl,
  responseImages,
  categories,
  serverUpdatedAt,
  onResponseImageSynced,
  onSaveSuccess,
  onIsFinalizedChange,
  onEndDateChange,
  onClose,
}: {
  open: boolean;
  locationName: string;
  assessmentId: number;
  formValues: FormValues;
  geometries: ResponseFormGeometry[];
  isFinalized: boolean;
  endDate: Dayjs | null;
  startDate: Dayjs;
  driveFolderUrl: string | null;
  responseImages: ResponseFormImages;
  categories: AssessmentCategoryItem[];
  serverUpdatedAt: Date;
  onResponseImageSynced: (questionId: number, imageIndex: number) => void;
  onSaveSuccess: (newServerUpdatedAt: Date) => void;
  onIsFinalizedChange: (newIsFinalized: boolean) => void;
  onEndDateChange: (newEndDate: Dayjs | null) => void;
  onClose: () => void;
}) => {
  const [errorOnServerSave, setErrorOnServerSave] = useState(false);
  const [errorOnLocalSave, setErrorOnLocalSave] = useState(false);
  const [showDatePickerError, setShowDatePickerError] = useState(false);
  const router = useRouter();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { setHelperCard } = useHelperCard();
  const { user } = useUserContext();
  const [uploadImage] = useUploadImageResponse();
  const saveResponseImages = async (responseImages: ResponseFormImages) => {
    //Unused because of problems with the Google API
    return;
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
  const [saveResponses] = useAddResponses({
    callbacks: {
      onSuccess: (response) => {
        // Delete local data, as it is no longer need
        // TODO: Refresh server data in ResponseFormV2
        dexieDb.assessments
          .delete(assessmentId)
          .then(() => {
            if (response.data?.savedAsFinalized) {
              router.push(`/admin/assessments`);
            }
          })
          .catch(() => {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: (
                <>Avaliação salva, mas falha ao excluir do dispositivo!</>
              ),
            });
          })
          .finally(() => {
            setErrorOnServerSave(false);
            if (!response.data) {
              throw new Error(
                "Avaliação salva, mas a data de atualização não foi retornada!",
              );
            }
            onSaveSuccess(new Date(response.data.updatedAt));
          });
      },
      onError: () => {
        setErrorOnServerSave(true);
      },
    },
  });
  const save = async () => {
    if (isFinalized && !endDate) {
      setShowDatePickerError(true);
      return;
    }

    setLoadingOverlay({ show: true, message: "Salvando avaliação..." });
    const serializedFormValues = serializeResponseFormValues(
      formValues,
      categories,
    );

    try {
      // Save locally, to not lose data if something goes wrong in the server
      await dexieDb.assessments.put({
        id: assessmentId,
        userId: user.id,
        username: user.username,
        serverUpdatedAt: serverUpdatedAt,
        localUpdatedAt: new Date(),
        isFinalized: isFinalized,
        startDate: startDate.toDate(),
        endDate: endDate?.toDate() ?? null,
        driveFolderUrl: driveFolderUrl,
        responseFormValues: serializedFormValues,
        geometries: geometries,
        responseImages: responseImages,
      });
      setErrorOnLocalSave(false);
    } catch (e) {
      setHelperCard({
        show: true,
        content: "Erro ao salvar dados locais!",
        helperCardType: "ERROR",
      });
      setErrorOnLocalSave(true);
      setLoadingOverlay({ show: false });
      return;
    }

    try {
      await saveResponseImages(responseImages);

      await saveResponses({
        data: {
          assessmentId,
          responses: serializedFormValues,
          geometries: geometries,
          startDate: startDate.toDate(),
          endDate: endDate?.toDate() ?? null,
          isFinalized: isFinalized,
          driveFolderUrl: driveFolderUrl,
        },
      });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  const generateExport = async () => {
    setLoadingOverlay({ show: true, message: "Gerando arquivo da avaliação" });
    try {
      const zip = new JSZip();
      const questionFolderNameById = buildQuestionFolderNameById(categories);
      const exportedImages = Object.fromEntries(
        Object.entries(responseImages).map(
          ([questionId, images]) =>
            [
              questionId,
              images.map((image, imageIndex) => {
                const fallbackName = `imagem-${imageIndex + 1}`;
                const name = ensureImageFileExtension(
                  image.file?.name || fallbackName,
                  image.file?.type ?? "",
                );
                const safeName = normalizeImageFileName(name);
                const questionFolderName =
                  questionFolderNameById.get(Number(questionId)) ??
                  `questao_${questionId}`;
                const path =
                  image.file ?
                    `images/${questionId}_${questionFolderName}/${imageIndex}-${safeName}`
                  : undefined;

                if (image.file && path) {
                  zip.file(path, image.file);
                }

                return {
                  path,
                  name,
                  type: image.file?.type ?? "",
                  lastModified: image.file?.lastModified ?? 0,
                  url: image.url,
                  status: image.status,
                };
              }),
            ] as const,
        ),
      );

      const data = {
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString() ?? null,
        isFinalized: isFinalized,
        assessmentId: assessmentId,
        responses: serializeResponseFormValues(formValues, categories),
        geometries: geometries,
        driveFolderUrl: driveFolderUrl,
        responseImages: exportedImages,
      };

      zip.file("assessment.json", JSON.stringify(data, null, 2));
      const blob = await zip.generateAsync({
        type: "blob",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avaliação_${locationName}_${new Date().toISOString()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setHelperCard({
        show: true,
        content: "Erro ao gerar arquivo da avaliação!",
        helperCardType: "ERROR",
      });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  useEffect(() => {
    if (open) {
      setErrorOnServerSave(false);
      setErrorOnLocalSave(false);
      setShowDatePickerError(false);
    }
  }, [open]);

  useEffect(() => {
    if (isFinalized && !endDate) {
      onEndDateChange(dayjs(new Date()));
    }
  }, [isFinalized, endDate, onEndDateChange]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title={"Salvar avaliação"}
      cancelChildren={"Exportar"}
      confirmChildren={errorOnServerSave ? "Tentar novamente" : "Salvar"}
      onConfirm={() => {
        void save();
      }}
      onCancel={() => {
        void generateExport();
      }}
    >
      <div className="flex w-full flex-col gap-1">
        {(errorOnServerSave || errorOnLocalSave) && (
          <div className="flex w-full flex-col gap-1">
            <p className="text-red-500">
              {"Ocorreu um erro ao salvar a avaliação no servidor."}
            </p>
            {errorOnLocalSave ?
              <p className="text-red-500">
                {
                  "Os dados da avaliação não foram salvos neste navegador. Exporte a avaliação para não perder os dados."
                }
              </p>
            : <p>
                {
                  "Os dados da avaliação foram salvos neste navegador. Ao acessar esta avaliação novamente por este navegador, os dados serão carregados."
                }
              </p>
            }
            <p>
              {
                ' Caso deseje tentar novamente, clique em "Tentar novamente". Caso deseje exportar os dados desta avaliação, clique em "Exportar".'
              }
            </p>
          </div>
        )}
        <CSwitch
          checked={isFinalized}
          label="Salvar como finalizado"
          onChange={(e) => {
            onIsFinalizedChange(e.target.checked);
          }}
        />
        <CDateTimePicker
          value={endDate}
          error={showDatePickerError}
          clearable
          onChange={(e) => {
            setShowDatePickerError(false);
            onEndDateChange(e);
          }}
          label="Data final"
        />
      </div>
    </CDialog>
  );
};

export default SaveAssessmentDialog;
