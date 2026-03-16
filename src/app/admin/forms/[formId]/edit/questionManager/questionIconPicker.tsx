"use client";

import CButton from "@/components/ui/cButton";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { type FetchDynamicIconsResponse } from "@/lib/serverFunctions/queries/questionIcon";
import { useFetchDynamicIcons } from "@apiCalls/questionIcon";
import CTextField from "@components/ui/cTextField";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

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
    if (searchText.length === 0) {
      setResults(DEFAULT_QUESTION_ICONS);
      return;
    }
    void fetchDynamicIcons({ query: searchText, limit: 500 });
  }, [fetchDynamicIcons, searchText]);

  return (
    <div className="flex flex-col gap-2 rounded border border-gray-300 p-2">
      <h6 className="text-sm font-semibold">Ícone da questão *</h6>
      <CTextField
        label="Buscar ícone"
        value={searchText}
        clearable
        debounce={250}
        placeholder="Ex.: bench, trash, letter b..."
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
      />

      <div className="text-xs text-gray-600">
        Busque pelo do ícone em inglês.
      </div>

      <div className="max-h-56 overflow-auto rounded border border-gray-200 p-2">
        {isLoading ?
          <div className="flex justify-center py-4">
            <CircularProgress />
          </div>
        : results.length === 0 ?
          <div className="py-2 text-center text-sm text-gray-600">
            Nenhum icone encontrado.
          </div>
        : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {results.map((icon) => {
              const isSelected = selectedIconKey === icon.key;
              return (
                <CButton
                  key={icon.key}
                  type="button"
                  variant="outlined"
                  sx={{
                    width: "100%",
                    textTransform: "none",
                    color: "gray",
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
            })}
          </div>
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
