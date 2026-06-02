"use client";

import CImage from "@/components/ui/CImage";
import CButton from "@/components/ui/cButton";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import type { ResponseFormImages } from "@/components/ui/responseForm/responseFormTypes";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import {
  buildGoogleDriveDirectImageUrl,
  buildGoogleDriveThumbnailImageUrl,
  getGoogleDriveImageUid,
} from "@/lib/utils/image";
import { IconPhoto, IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";

const getQuestionImages = (images: ResponseFormImages, questionId: number) =>
  images[questionId] ?? [];

const ResponseImagePreview = ({
  url,
  alt,
  canRemove,
  onRemove,
}: {
  url: string;
  alt: string;
  canRemove: boolean;
  onRemove: () => void;
}) => {
  const directUrl = buildGoogleDriveDirectImageUrl({ sharingUrl: url });

  if (!directUrl) {
    return (
      <div className="flex items-center justify-between gap-2 rounded border border-gray-300 p-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm underline"
        >
          {url}
        </a>
        {canRemove && (
          <CButton square color="error" onClick={onRemove}>
            <IconX />
          </CButton>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-fit pb-2">
      {canRemove && (
        <CButton
          square
          color="error"
          onClick={onRemove}
          className="absolute left-20 top-10 z-10"
          sx={{
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "white",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.85)" },
          }}
        >
          <IconX />
        </CButton>
      )}
      <CImage
        src={directUrl}
        alt={alt}
        className="aspect-[4/3] w-60 rounded object-cover"
        width={200}
        height={200}
      />
    </div>
  );
};

const ResponseFormQuestionImagesDialog = ({
  open,
  question,
  images,
  finalized,
  onClose,
  onImagesChange,
}: {
  open: boolean;
  question: AssessmentQuestionItem;
  images: string[];
  finalized: boolean;
  onClose: () => void;
  onImagesChange: (images: string[]) => void;
}) => {
  const [url, setUrl] = useState("");

  const addImage = () => {
    const nextUrl = url.trim();
    if (nextUrl.length === 0) {
      return;
    }
    const nextUid = getGoogleDriveImageUid({ sharingUrl: nextUrl });
    const alreadyAdded = images.some(
      (image) => getGoogleDriveImageUid({ sharingUrl: image }) === nextUid,
    );
    if (alreadyAdded) {
      setUrl("");
      return;
    }

    onImagesChange([...images, nextUrl]);
    setUrl("");
  };

  return (
    <CDialog
      fullScreen
      disableDialogActions
      open={open}
      title="Imagens da resposta"
      subtitle={question.name}
      onClose={onClose}
    >
      <div className="flex w-full flex-col gap-3">
        {!finalized && (
          <CTextField
            label="URL de compartilhamento do Google Drive"
            value={url}
            suffixButtonChildren={<IconPlus />}
            onChange={(event) => setUrl(event.target.value)}
            onAppendIconButtonClick={addImage}
            onEnterDown={addImage}
          />
        )}

        <div className="flex flex-wrap gap-2">
          {images.map((imageUrl, index) => (
            <ResponseImagePreview
              key={`${imageUrl}-${index}`}
              url={imageUrl}
              alt={`${question.name} - imagem ${index + 1}`}
              canRemove={!finalized}
              onRemove={() => {
                onImagesChange(images.filter((_, i) => i !== index));
              }}
            />
          ))}
        </div>
      </div>
    </CDialog>
  );
};

const ResponseFormQuestionImageControls = ({
  question,
  responseImages,
  finalized,
  onQuestionImagesChange,
}: {
  question: AssessmentQuestionItem;
  responseImages: ResponseFormImages;
  finalized: boolean;
  onQuestionImagesChange: (questionId: number, images: string[]) => void;
}) => {
  const [openImagesDialog, setOpenImagesDialog] = useState(false);
  const images = getQuestionImages(responseImages, question.questionId);
  const firstImageUrl = images[0] ?? null;
  const firstImageThumbnailUrl =
    firstImageUrl ?
      buildGoogleDriveThumbnailImageUrl({ sharingUrl: firstImageUrl })
    : null;
  const remainingImagesCount = Math.max(images.length - 1, 0);

  if (!question.allowResponseImages) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <CButton
          square
          className="w-fit"
          tooltip="Imagens da resposta"
          enableTopLeftChip={images.length > 0}
          topLeftChipLabel={images.length}
          onClick={() => setOpenImagesDialog(true)}
        >
          <IconPhoto />
        </CButton>

        {firstImageUrl && (
          <button
            type="button"
            className="relative w-fit"
            onClick={() => setOpenImagesDialog(true)}
          >
            {remainingImagesCount > 0 && (
              <span className="absolute right-2 top-2 z-10 min-h-5 min-w-6 rounded-full bg-black p-1 text-xs text-white">
                +{remainingImagesCount}
              </span>
            )}
            {firstImageThumbnailUrl ?
              <CImage
                src={firstImageThumbnailUrl}
                alt={`Primeira imagem de ${question.name}`}
                className="aspect-[4/3] w-28 rounded object-cover"
                width={60}
                height={60}
              />
            : <span className="block max-w-28 break-all rounded border border-gray-300 p-1 text-xs underline">
                {firstImageUrl}
              </span>
            }
          </button>
        )}
      </div>

      <ResponseFormQuestionImagesDialog
        open={openImagesDialog}
        question={question}
        images={images}
        finalized={finalized}
        onClose={() => setOpenImagesDialog(false)}
        onImagesChange={(nextImages) =>
          onQuestionImagesChange(question.questionId, nextImages)
        }
      />
    </>
  );
};

export default ResponseFormQuestionImageControls;
