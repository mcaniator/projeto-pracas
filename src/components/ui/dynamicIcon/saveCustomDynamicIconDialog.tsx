"use client";

import CCircularProgress from "@/components/ui/CCircularProgress";
import CButton from "@/components/ui/cButton";
import CButtonFilePicker from "@/components/ui/cButtonFilePicker";
import CIconChip from "@/components/ui/cIconChip";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { fetchAndAddCustomDynamicIconCollection } from "@/components/ui/dynamicIcon/dynamicIconLoader";
import {
  CUSTOM_DYNAMIC_ICON_MAX_SIZE,
  dynamicIconNameRegex,
} from "@/lib/questionIcons/dynamicIcon";
import { formatFileSize } from "@/lib/utils/file";
import {
  useFetchCustomDynamicIconDetails,
  useSaveCustomDynamicIcon,
} from "@apiCalls/questionIcon";
import { Divider } from "@mui/material";
import { IconHelp, IconUpload } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type SaveCustomDynamicIconDialogProps = {
  open: boolean;
  iconId?: number;
  onClose: () => void;
  reload: () => void;
};

const iconNameErrorMessage = "Use letras minúsculas, números e hífens simples.";

const SaveCustomDynamicIconDialog = ({
  open,
  iconId,
  onClose,
  reload,
}: SaveCustomDynamicIconDialogProps) => {
  const [svgPreviewUrl, setSvgPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [aliases, setAliases] = useState<string[]>([""]);

  const normalizedName = name?.trim() ?? "";
  const isNameValid = dynamicIconNameRegex.test(normalizedName);
  const areAliasesValid = aliases.every((alias) => {
    const normalizedAlias = alias.trim();
    return !normalizedAlias || dynamicIconNameRegex.test(normalizedAlias);
  });

  const resetForm = useCallback(() => {
    setSvgPreviewUrl(null);
    setName(null);
    setSvg(null);
    setAliases([""]);
  }, []);

  const setSvgContent = useCallback((svgContent: string) => {
    setSvgPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      return URL.createObjectURL(
        new Blob([svgContent], { type: "image/svg+xml" }),
      );
    });
    setSvg(svgContent);
  }, []);

  const [fetchCustomDynamicIconDetails, isLoadingCustomDynamicIconDetails] =
    useFetchCustomDynamicIconDetails({
      callbacks: {
        onSuccess: (response) => {
          const customDynamicIcon = response.data?.customDynamicIcon;
          if (!customDynamicIcon) return;

          setName(customDynamicIcon.name);
          setAliases(
            customDynamicIcon.aliases.length > 0 ?
              customDynamicIcon.aliases
            : [""],
          );
          setSvgContent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${customDynamicIcon.width}" height="${customDynamicIcon.height}" viewBox="0 0 ${customDynamicIcon.width} ${customDynamicIcon.height}">${customDynamicIcon.body}</svg>`,
          );
        },
        onError: resetForm,
      },
    });

  const [saveCustomDynamicIcon, isSavingCustomDynamicIcon] =
    useSaveCustomDynamicIcon({
      callbacks: {
        onSuccess: () => {
          resetForm();
          void fetchAndAddCustomDynamicIconCollection();
          reload();
          onClose();
        },
      },
    });

  useEffect(() => {
    return () => {
      if (svgPreviewUrl) URL.revokeObjectURL(svgPreviewUrl);
    };
  }, [svgPreviewUrl]);

  useEffect(() => {
    if (!open) return;

    resetForm();
    if (!iconId) return;

    void fetchCustomDynamicIconDetails({ params: { iconId } });
  }, [fetchCustomDynamicIconDetails, iconId, open, resetForm]);

  const selectSvg = async (file: File | undefined) => {
    if (!file || file.type !== "image/svg+xml") return;

    const svgContent = await file.text();
    if (new Blob([svgContent]).size > CUSTOM_DYNAMIC_ICON_MAX_SIZE) {
      enqueueSnackbar(
        `O SVG deve ter no máximo ${formatFileSize(CUSTOM_DYNAMIC_ICON_MAX_SIZE)}.`,
        {
          variant: "error",
        },
      );
      return;
    }

    setSvgContent(svgContent);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void selectSvg(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void selectSvg(event.dataTransfer.files[0]);
  };

  const handleConfirm = () => {
    if (!isNameValid || !areAliasesValid || !svg) return;

    const normalizedAliases = [
      ...new Set(
        aliases
          .map((alias) => alias.trim())
          .filter((alias) => alias.length > 0 && alias !== normalizedName),
      ),
    ];

    void saveCustomDynamicIcon({
      data: {
        iconId,
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
      title={
        iconId ? "Editar ícone personalizado" : "Adicionar ícone personalizado"
      }
      confirmChildren="Salvar"
      onConfirm={handleConfirm}
      disableConfirmButton={
        isLoadingCustomDynamicIconDetails ||
        !isNameValid ||
        !areAliasesValid ||
        !svg
      }
      confirmLoading={isSavingCustomDynamicIcon}
    >
      {isLoadingCustomDynamicIconDetails ?
        <div className="flex min-h-72 items-center justify-center">
          <CCircularProgress label="Carregando ícone..." />
        </div>
      : <div className="flex flex-col gap-2">
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
            placeholder="Ex: recycling-bin"
            value={name}
            error={normalizedName.length > 0 && !isNameValid}
            errorMessage={iconNameErrorMessage}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <Divider />
          <div className="flex items-center gap-1">
            Nomes alternativos
            <CIconChip
              tooltip="Nomes alternativos para facilitar a busca por nome"
              icon={<IconHelp />}
            />
          </div>
          {aliases.map((alias, index) => (
            <CTextField
              key={index}
              label={`Nome alternativo ${index + 1}`}
              value={alias}
              placeholder="Ex: trash"
              error={
                alias.trim().length > 0 &&
                !dynamicIconNameRegex.test(alias.trim())
              }
              errorMessage={iconNameErrorMessage}
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
            tooltip="Adicionar outro nome alternativo"
            onClick={() => {
              setAliases((currentAliases) => [...currentAliases, ""]);
            }}
          >
            +1
          </CButton>
        </div>
      }
    </CDialog>
  );
};

export default SaveCustomDynamicIconDialog;
