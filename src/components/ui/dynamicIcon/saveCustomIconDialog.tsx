"use client";

import CButton from "@/components/ui/cButton";
import CButtonFilePicker from "@/components/ui/cButtonFilePicker";
import CIconChip from "@/components/ui/cIconChip";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateDynamicIcon } from "@apiCalls/questionIcon";
import { Divider } from "@mui/material";
import { IconHelp, IconPlus, IconUpload } from "@tabler/icons-react";
import { ChangeEvent, DragEvent, useEffect, useState } from "react";

type SaveCustomIconDialogProps = {
  open: boolean;
  onClose: () => void;
};

const SaveCustomIconDialog = ({ open, onClose }: SaveCustomIconDialogProps) => {
  const [svgPreviewUrl, setSvgPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [aliases, setAliases] = useState<string[]>([""]);

  const [createDynamicIcon, isCreatingDynamicIcon] = useCreateDynamicIcon({
    callbacks: {
      onSuccess: onClose,
    },
  });

  useEffect(() => {
    return () => {
      if (svgPreviewUrl) URL.revokeObjectURL(svgPreviewUrl);
    };
  }, [svgPreviewUrl]);

  const selectSvg = async (file: File | undefined) => {
    if (!file || file.type !== "image/svg+xml") return;

    const svgContent = await file.text();
    setSvgPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      return URL.createObjectURL(file);
    });
    setSvg(svgContent);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void selectSvg(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void selectSvg(event.dataTransfer.files[0]);
  };

  const handleConfirm = () => {
    if (!name?.trim() || !svg) return;

    const normalizedName = name.trim();
    const normalizedAliases = [
      ...new Set(
        aliases
          .map((alias) => alias.trim())
          .filter(
            (alias) => alias.length > 0 && alias !== normalizedName,
          ),
      ),
    ];

    void createDynamicIcon({
      data: {
        name: normalizedName,
        svg,
        aliases: normalizedAliases,
      },
    });
  };

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Adicionar ícone personalizado"
      confirmChildren="Salvar"
      onConfirm={handleConfirm}
      disableConfirmButton={!name?.trim() || !svg}
      confirmLoading={isCreatingDynamicIcon}
    >
      <div className="flex flex-col gap-2">
        <div
          className="flex min-h-72 flex-col items-center justify-center gap-4 rounded border-2 border-dashed border-gray-300 p-6 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <CButtonFilePicker
            type="button"
            fileAccept="image/svg+xml,.svg"
            onFileInput={handleFileChange}
          >
            <IconUpload />
            Selecionar SVG
          </CButtonFilePicker>
          <p className="text-sm text-gray-600">
            Arraste um arquivo SVG para esta área ou selecione-o acima.
          </p>

          {svgPreviewUrl && (
            <div className="flex flex-col items-center gap-2">
              <img
                src={svgPreviewUrl}
                alt={name ? `Prévia de ${name}` : "Prévia do SVG"}
                className="h-32 w-32 object-contain"
              />
            </div>
          )}
        </div>
        <CTextField
          label="Nome (em inglês)"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <Divider />
        <div className="flex items-center gap-1">
          Nomes alternativos
          <CIconChip
            tooltip="Nomes alternativos para a busca por nome"
            icon={<IconHelp />}
          />
        </div>
        {aliases.map((alias, index) => (
          <CTextField
            key={index}
            label={`Nome alternativo ${index + 1}`}
            value={alias}
            onChange={(e) => {
              setAliases((currentAliases) =>
                currentAliases.map((currentAlias, currentIndex) =>
                  currentIndex === index ? e.target.value : currentAlias,
                ),
              );
            }}
          />
        ))}
        <CButton
          onClick={() => {
            setAliases((currentAliases) => [...currentAliases, ""]);
          }}
          square
        >
          <IconPlus />
        </CButton>
      </div>
    </CDialog>
  );
};

export default SaveCustomIconDialog;
