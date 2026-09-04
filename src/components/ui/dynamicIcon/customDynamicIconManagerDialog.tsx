"use client";

import CButton from "@/components/ui/cButton";
import CSwitch from "@/components/ui/cSwtich";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { useFetchDynamicIcons } from "@/lib/serverFunctions/apiCalls/questionIcon";
import { FetchDynamicIconsResponse } from "@/lib/serverFunctions/queries/questionIcon";
import { Box, CircularProgress } from "@mui/material";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { VirtuosoGrid } from "react-virtuoso";

import SaveCustomDynamicIconDialog from "./saveCustomDynamicIconDialog";

type CustomDynamicIconManagerDialogProps = {
  open: boolean;
  onClose: () => void;
};

const CustomDynamicIconManagerDialog = ({
  open,
  onClose,
}: CustomDynamicIconManagerDialogProps) => {
  const [isSaveCustomDynamicIconOpen, setIsSaveCustomDynamicIconOpen] =
    useState(false);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<
    FetchDynamicIconsResponse["icons"][number][]
  >([]);
  const [showAllIcons, setShowAllIcons] = useState(false);

  const [fetchDynamicIcons, isLoading] = useFetchDynamicIcons({
    callbacks: {
      onSuccess: (response) => {
        setResults(response.data?.icons ?? []);
      },
      onError: () => {
        setResults([]);
      },
    },
  });

  useEffect(() => {
    if (searchText.length === 0 && !showAllIcons) {
      setResults([]);
      return;
    }
    if (showAllIcons) {
      void fetchDynamicIcons({
        params: { customOnly: true },
        requestOptions: {
          cache: "reload",
        },
      });
    } else {
      void fetchDynamicIcons({
        params: { query: searchText, customOnly: true },
        requestOptions: {
          cache: "reload",
        },
      });
    }
  }, [fetchDynamicIcons, searchText, showAllIcons]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      fullScreen
      title="Gerenciar ícones personalizados"
      disableDialogActions
    >
      <div className="flex h-full flex-col gap-2 rounded-2xl border border-gray-300 p-2">
        <div className="flex items-center justify-between gap-2">
          <CSwitch
            label="Mostrar todos os ícones"
            onChange={(_, checked) => {
              setShowAllIcons(checked);
              if (checked) setSearchText("");
            }}
            checked={showAllIcons}
          />
          <CButton
            square
            tooltip="Adicionar ícone personalizado"
            onClick={() => setIsSaveCustomDynamicIconOpen(true)}
          >
            <IconPlus />
          </CButton>
        </div>
        {!showAllIcons && (
          <>
            <CTextField
              label="Buscar ícone"
              value={searchText}
              clearable
              debounce={500}
              placeholder="Ex.: bench, trash, letter b..."
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />

            <div className="text-xs text-gray-600">
              Busque pelo nome do ícone personalizado.
            </div>
          </>
        )}
        {!isLoading && (searchText.length > 0 || showAllIcons) && (
          <div className="text-sm">{results.length} ícones encontrados</div>
        )}
        <div className="flex h-full items-center justify-center rounded border border-gray-200">
          {isLoading ?
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          : results.length === 0 ?
            <div className="py-2 text-center text-sm text-gray-600">
              {searchText.length === 0 && !showAllIcons ?
                "Faça uma busca para ver os ícones."
              : "Nenhum icone encontrado."}
            </div>
          : <VirtuosoGrid
              className="h-full w-full"
              listClassName="grid grid-cols-1 gap-2 p-2 sm:grid-cols-3"
              totalCount={results.length}
              overscan={200}
              itemContent={(index) => {
                const icon = results[index];
                if (!icon) return null;

                return (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      border: "1px solid #ccc",
                      borderRadius: 1,
                      padding: "5px",
                    }}
                  >
                    <CDynamicIcon iconKey={icon.key} />
                    <span className="truncate">{icon.iconName}</span>
                    <div className="ml-auto flex gap-2">
                      <CButton variant="text" dense>
                        <IconPencil />
                      </CButton>
                      <CButton variant="text" color="error" dense>
                        <IconTrash />
                      </CButton>
                    </div>
                  </Box>
                );
              }}
            />
          }
        </div>
      </div>

      <SaveCustomDynamicIconDialog
        open={isSaveCustomDynamicIconOpen}
        onClose={() => setIsSaveCustomDynamicIconOpen(false)}
      />
    </CDialog>
  );
};

export default CustomDynamicIconManagerDialog;
