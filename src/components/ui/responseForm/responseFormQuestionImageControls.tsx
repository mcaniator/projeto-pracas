"use client";

import CImage from "@/components/ui/CImage";
import CImageInput from "@/components/ui/CImageInput";
import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import type {
  ResponseFormImage,
  ResponseFormImages,
} from "@/components/ui/responseForm/responseFormTypes";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const getQuestionImages = (images: ResponseFormImages, questionId: number) =>
  images[questionId] ?? [];

const ResponseImagePreview = ({
  image,
  alt,
  canRemove,
  onRemove,
}: {
  image: ResponseFormImage;
  alt: string;
  canRemove: boolean;
  onRemove: () => void;
}) => {
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (image.url || !image.file) {
      setFileUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(image.file);
    setFileUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image.file, image.url]);

  const directUrl = image.url ?? fileUrl;

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
  images: ResponseFormImage[];
  finalized: boolean;
  onClose: () => void;
  onImagesChange: (images: ResponseFormImage[]) => void;
}) => {
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
          <CImageInput
            label="Adicionar imagens"
            multiple={true}
            emitFiles={(e) => {
              const newImages = e.map(
                (file) => ({ file, status: "UNSYNCED" }) as ResponseFormImage,
              );
              onImagesChange([...images, ...newImages]);
            }}
          />
        )}

        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <ResponseImagePreview
              key={`${image.url}-${index}`}
              image={image}
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
  onQuestionImagesChange: (
    questionId: number,
    images: ResponseFormImage[],
  ) => void;
}) => {
  const [openImagesDialog, setOpenImagesDialog] = useState(false);
  const images = getQuestionImages(responseImages, question.questionId);

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
