import { useHelperCard } from "@/components/context/helperCardContext";
import CButton from "@/components/ui/cButton";
import CButtonFilePicker from "@/components/ui/cButtonFilePicker";
import { Box } from "@mui/material";
import { IconUpload, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type CImageInputProps = {
  label?: string;
  buttonChildren?: React.ReactNode;
  previewWidth?: number;
  previewHeight?: number;
  files?: File | File[] | null;
  multiple?: boolean;
  handleFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emitFiles?: (files: File[]) => void;
};
const CImageInput = ({
  buttonChildren = <IconUpload />,
  files = null,
  multiple = false,
  ...props
}: CImageInputProps) => {
  const [preview, setPreview] = useState<string[]>([]);
  const { setHelperCard } = useHelperCard();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files?.length > 1 && !multiple) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: "Apenas uma imagem pode ser enviada!",
      });
      return;
    }
    for (let i = 0; i < e.target.files.length; i++) {
      const selectedFile = e.target.files?.[i] ?? null;
      if (!selectedFile) return;

      // validação simples
      if (!selectedFile.type.startsWith("image/")) {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: "Arquivo inválido!",
        });
        return;
      }
    }

    props.handleFileInput?.(e);
    props.emitFiles?.(Array.from(e.target.files ?? []));
  };

  // cria URL de preview
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

    // limpa memória
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
      <CButtonFilePicker
        fileAccept="image/*"
        onFileInput={handleChange}
        className="pb-2"
        multiple={multiple}
      >
        {buttonChildren}
      </CButtonFilePicker>
      {Array.isArray(files) && files?.length > 1 && (
        <CButton variant="text" tooltip="Remover todas as imagens">
          <IconX />
        </CButton>
      )}
      {preview.map((url, index) => (
        <div key={index} className="relative inline-block">
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
