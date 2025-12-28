import { useHelperCard } from "@/components/context/helperCardContext";
import CButton from "@/components/ui/cButton";
import CButtonFilePicker from "@/components/ui/cButtonFilePicker";
import { Box, LinearProgress } from "@mui/material";
import { IconCamera, IconUpload, IconX } from "@tabler/icons-react";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useEffect, useState } from "react";

type CImageInputProps = {
  label?: string;
  buttonChildren?: React.ReactNode;
  previewWidth?: number;
  previewHeight?: number;
  files?: File | File[] | null;
  multiple?: boolean;
  targetCompressionSize?: number;
  disableCameraButton?: boolean;
  handleFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emitFiles?: (files: File[]) => void;
};
const CImageInput = ({
  buttonChildren = <IconUpload />,
  files = null,
  multiple = false,
  targetCompressionSize = 0.5,
  ...props
}: CImageInputProps) => {
  const [preview, setPreview] = useState<string[]>([]);
  const [isCompressingImages, setIsCompressingImages] = useState(false);
  const [imagesCompressionProgress, setImagesCompressionProgress] = useState(0);

  const { setHelperCard } = useHelperCard();
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCompressingImages(true);
    if (!e.target.files) return;
    const inputFiles = Array.from(e.target.files);
    const percentagePerFile = 100 / inputFiles.length;
    if (inputFiles.length > 1 && !multiple) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: "Apenas uma imagem pode ser enviada!",
      });
      return;
    }
    const compressedFiles: File[] = [];
    for (let i = 0; i < inputFiles.length; i++) {
      const selectedFile = inputFiles[i] ?? null;
      if (!selectedFile) return;

      if (!selectedFile.type.startsWith("image/")) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: "Arquivo inválido!",
        });
        return;
      }

      try {
        const compressedFile = await imageCompression(selectedFile, {
          maxSizeMB: targetCompressionSize,
          maxIteration: 100,
          onProgress(progress) {
            setImagesCompressionProgress(
              Math.floor(
                i * percentagePerFile + (progress * percentagePerFile) / 100,
              ),
            );
          },
        });
        compressedFiles.push(compressedFile);
      } catch (e) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: "Erro ao comprimir imagem!",
        });
        setIsCompressingImages(false);
        return;
      }
    }

    setIsCompressingImages(false);

    props.handleFileInput?.(e);
    if (multiple && Array.isArray(files)) {
      props.emitFiles?.([...files, ...compressedFiles]);
    } else if (!multiple) {
      props.emitFiles?.(compressedFiles);
    }
  };

  // creates a preview of the files
  useEffect(() => {
    if (!files) {
      setPreview([]);
      return;
    }
    if (!Array.isArray(files)) {
      setPreview([URL.createObjectURL(files)]);
      return;
    }
    const urlsArray = Array.from(files).map((file) =>
      URL.createObjectURL(file),
    );
    setPreview(urlsArray);

    // free memory whenever this component is unmounted
    return () => {
      urlsArray.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
    };
  }, [files]);

  const borderSx = {
    borderWidth: "1px",
    borderStyle: "solid",
    padding: "8px",
    borderColor: "#ccc",
  };
  return (
    <Box sx={borderSx} className="flex flex-col items-start rounded-lg">
      <div>{props.label}</div>
      <div className="flex w-full justify-between gap-1">
        <CButtonFilePicker
          fileAccept="image/*"
          onFileInput={(e) => {
            void handleChange(e);
          }}
          className="pb-2"
          multiple={multiple}
        >
          {buttonChildren}
        </CButtonFilePicker>
        {!props.disableCameraButton && (
          <CButtonFilePicker
            fileAccept="image/*"
            onFileInput={(e) => {
              void handleChange(e);
            }}
            className="pb-2"
            multiple={false}
            capture="environment"
          >
            <IconCamera />
          </CButtonFilePicker>
        )}
      </div>

      {Array.isArray(files) && files?.length > 1 && (
        <CButton
          onClick={() => props.emitFiles?.([])}
          variant="text"
          tooltip="Remover todas as imagens"
        >
          <IconX />
        </CButton>
      )}
      {isCompressingImages && (
        <div className="flex w-full flex-col">
          <LinearProgress />
          <div>{`Processando image${multiple ? "ns" : "m"}... ${imagesCompressionProgress}%`}</div>
        </div>
      )}
      {preview.map((url, index) => (
        <div key={index} className="relative inline-block pb-2">
          <button
            onClick={() => {
              if (!multiple) {
                props.emitFiles?.([]);
              } else {
                const filteredFiles =
                  Array.isArray(files) ?
                    files.filter((_, i) => i !== index)
                  : [];
                props.emitFiles?.(filteredFiles);
              }
            }}
            className="absolute right-2 top-2 z-10 w-fit rounded-full bg-black/60 p-1 text-white hover:bg-black"
          >
            <IconX />
          </button>
          <Image
            src={url}
            alt="Pré-visualização da imagem"
            width={props.previewWidth ?? 300}
            height={props.previewHeight ?? 200}
            className="rounded"
          />
        </div>
      ))}
    </Box>
  );
};

export default CImageInput;
