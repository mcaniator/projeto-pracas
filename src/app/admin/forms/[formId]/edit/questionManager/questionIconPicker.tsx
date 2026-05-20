"use client";

import CButton from "@/components/ui/cButton";
import CSwitch from "@/components/ui/cSwtich";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { type FetchDynamicIconsResponse } from "@/lib/serverFunctions/queries/questionIcon";
import { useFetchDynamicIcons } from "@apiCalls/questionIcon";
import CTextField from "@components/ui/cTextField";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { VirtuosoGrid } from "react-virtuoso";

const DEFAULT_QUESTION_ICONS = [
  { key: "mdi:cctv", iconName: "cctv" },
  { key: "mdi:police-badge", iconName: "police-badge" },
  { key: "mdi:phone", iconName: "phone" },
  { key: "tabler:trash", iconName: "trash" },
  { key: "mdi:wifi", iconName: "wifi" },
  { key: "lucide:toilet", iconName: "toilet" },
  { key: "mdi:cup-water", iconName: "cup-water" },
  { key: "mdi:volume", iconName: "volume" },
  { key: "mdi:slide", iconName: "slide" },
  { key: "mdi:wheelchair-accessibility", iconName: "wheelchair-accessibility" },
  { key: "tabler:letter-a", iconName: "letter-a" },
  { key: "ri:sketching", iconName: "sketching" },
  { key: "mdi:bus-marker", iconName: "bus-marker" },
  { key: "mdi:calendar", iconName: "calendar" },
  { key: "mdi:wrench", iconName: "wrench" },
];

type QuestionIconPickerProps = {
  selectedIconKey: string | null;
  onChange: (iconKey: string) => void;
};

const QuestionIconPicker = ({
  selectedIconKey,
  onChange,
}: QuestionIconPickerProps) => {
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
      setResults(DEFAULT_QUESTION_ICONS);
      return;
    }
    if (showAllIcons) {
      void fetchDynamicIcons({});
    } else {
      void fetchDynamicIcons({ query: searchText });
    }
  }, [fetchDynamicIcons, searchText, showAllIcons]);

  return (
    <div className="flex flex-col gap-2 rounded border border-gray-300 p-2">
      <h6 className="text-sm font-semibold">Ícone da questão *</h6>
      <CSwitch
        label="Mostrar todos os ícones"
        onChange={(_, checked) => {
          setShowAllIcons(checked);
          if (checked) setSearchText("");
        }}
        checked={showAllIcons}
      />
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
            Busque pelo nome do ícone em inglês.
          </div>
        </>
      )}
      {!isLoading && (searchText.length > 0 || showAllIcons) && (
        <div className="text-sm">{results.length} ícones encontrados</div>
      )}

      <div className="flex h-56 items-center justify-center rounded border border-gray-200">
        {isLoading ?
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        : results.length === 0 ?
          <div className="py-2 text-center text-sm text-gray-600">
            Nenhum icone encontrado.
          </div>
        : <VirtuosoGrid
            className="h-full w-full"
            listClassName="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3"
            totalCount={results.length}
            overscan={200}
            itemContent={(index) => {
              const icon = results[index];
              if (!icon) return null;
              const isSelected = selectedIconKey === icon.key;
              return (
                <CButton
                  type="button"
                  variant="outlined"
                  sx={{
                    width: "100%",
                    textTransform: "none",
                    color: "black",
                    ...(isSelected && {
                      backgroundColor: "primary.lighter3",
                      color: "primary.main",
                    }),
                  }}
                  onClick={() => {
                    onChange(icon.key);
                  }}
                >
                  <CDynamicIcon iconKey={icon.key} />
                  <span className="truncate">{icon.iconName}</span>
                </CButton>
              );
            }}
          />
        }
      </div>

      <div className="flex items-center gap-2 rounded bg-gray-100 p-2">
        <CDynamicIcon iconKey={selectedIconKey} />
        <span className="text-sm">
          {selectedIconKey ? selectedIconKey : "Nenhum icone selecionado"}
        </span>
      </div>
    </div>
  );
};

export default QuestionIconPicker;
