import CIconChip from "@/components/ui/cIconChip";
import { localeNumberFormatter } from "@/lib/formatters/numberFormatters";
import { shouldShowScaleOptionsSection } from "@/lib/utils/questionCreationUtils";
import CButton from "@components/ui/cButton";
import CCheckboxGroup from "@components/ui/cCheckboxGroup";
import CNumberField from "@components/ui/cNumberField";
import CRadioGroup from "@components/ui/cRadioGroup";
import CSwitch from "@components/ui/cSwtich";
import CTextField from "@components/ui/cTextField";
import type { QuestionResponseCharacterTypes } from "@prisma/client";
import { IconHelp, IconPlus, IconTrash } from "@tabler/icons-react";
import { ReactNode } from "react";

import type { ScaleOptionMode } from "./questionCreationTypes";
import QuestionIconPicker from "./questionIconPicker";

const characterTypeOptions: {
  value: QuestionResponseCharacterTypes;
  label: string;
}[] = [
  { value: "TEXT", label: "Texto" },
  { value: "NUMBER", label: "Numérico" },
  { value: "PERCENTAGE", label: "Porcentagem" },
  { value: "SCALE", label: "Escala" },
];

const scaleOptionModeOptions: { value: ScaleOptionMode; label: string }[] = [
  { value: "MANUAL", label: "Manual" },
  { value: "STEP", label: "Gerar por passo" },
];

const QuestionCreationFormStep = ({
  categoryId,
  categoryName,
  subcategoryId,
  subcategoryName,
  type,
  characterType,
  hasAssociatedGeometry,
  geometryTypes,
  currentOption,
  addedOptions,
  selectionType,
  minumumOptionsError,
  questionTemplate,
  selectedIconKey,
  isPublic,
  minValue,
  maxValue,
  scaleOptionMode,
  scaleStep,
  onQuestionTemplateChange,
  onRemoveOption,
  onTypeChange,
  onCharacterTypeChange,
  onHasAssociatedGeometryChange,
  onGeometryTypesChange,
  onCurrentOptionChange,
  onAddedOptionsChange,
  onSelectionTypeChange,
  onMinimumOptionsErrorChange,
  onSelectedIconKeyChange,
  onIsPublicChange,
  onMinValueChange,
  onMaxValueChange,
  onScaleOptionModeChange,
  onScaleStepChange,
  showError,
}: {
  categoryId: number | undefined;
  categoryName: string | undefined;
  subcategoryId: number | undefined;
  subcategoryName: string | undefined;
  type: string;
  characterType: QuestionResponseCharacterTypes | null;
  hasAssociatedGeometry: boolean | null;
  geometryTypes: string[];
  currentOption: string;
  addedOptions: { text: string }[] | undefined;
  selectionType: string | null;
  minumumOptionsError: boolean;
  questionTemplate: string | null;
  selectedIconKey: string | null;
  isPublic: boolean;
  minValue: number | null;
  maxValue: number | null;
  scaleOptionMode: ScaleOptionMode;
  scaleStep: number | null;
  onQuestionTemplateChange: (template: string) => void;
  onRemoveOption: (option: string) => void;
  onTypeChange: (value: string) => void;
  onCharacterTypeChange: (value: QuestionResponseCharacterTypes | null) => void;
  onHasAssociatedGeometryChange: (value: boolean | null) => void;
  onGeometryTypesChange: (value: string[]) => void;
  onCurrentOptionChange: (value: string) => void;
  onAddedOptionsChange: (value: { text: string }[]) => void;
  onSelectionTypeChange: (value: string | null) => void;
  onMinimumOptionsErrorChange: (value: boolean) => void;
  onSelectedIconKeyChange: (value: string | null) => void;
  onIsPublicChange: (value: boolean) => void;
  onMinValueChange: (value: number | null) => void;
  onMaxValueChange: (value: number | null) => void;
  onScaleOptionModeChange: (value: ScaleOptionMode) => void;
  onScaleStepChange: (value: number | null) => void;
  showError: (content: ReactNode) => void;
}) => {
  return (
    <div className="flex w-full flex-col rounded-l">
      <h5 className="text-base font-semibold sm:text-xl">
        {`Categoria: ${categoryName}`}
      </h5>
      <h6 className="my-2 text-base font-semibold sm:text-xl">
        {subcategoryName ?
          `Subcategoria: ${subcategoryName}`
        : "SEM SUBCATEGORIA"}
      </h6>
      <input
        type="hidden"
        id="categoryId"
        name="categoryId"
        value={categoryId}
      />
      <input
        type="hidden"
        id="subcategoryId"
        name="subcategoryId"
        value={subcategoryId}
      />
      <div className="flex flex-col gap-2">
        <div>
          <CTextField
            className="w-full"
            label="Título"
            name="name"
            id="name"
            required
            maxCharacters={255}
          />
        </div>
        <div>
          <CTextField
            className="w-full"
            label="Observações"
            name="notes"
            id="notes"
            maxCharacters={255}
          />
        </div>

        <input
          type="hidden"
          id="iconKey"
          name="iconKey"
          value={selectedIconKey ?? ""}
        />
        <div className="flex items-center gap-1">
          <input
            type="hidden"
            id="isPublic"
            name="isPublic"
            value={isPublic ? "true" : "false"}
          />
          <CSwitch
            checked={isPublic}
            label="Respostas públicas"
            name="isPublic"
            id="isPublic"
            onChange={(e) => {
              onIsPublicChange(e.target.checked);
            }}
          />
          <CIconChip
            icon={<IconHelp />}
            tooltip="Respostas dessa questão serão visíveis publicamente em avaliações também visíveis publicamente"
          />
        </div>

        <QuestionIconPicker
          selectedIconKey={selectedIconKey}
          onChange={onSelectedIconKeyChange}
        />

        <CRadioGroup
          label="Tipo de questão"
          name="questionType"
          options={[
            { value: "WRITTEN", label: "Escrito" },
            { value: "OPTIONS", label: "Seleção" },
            { value: "BOOLEAN", label: "Verdadeiro ou falso" },
          ]}
          value={type}
          onChange={(val) => {
            if (!val) {
              return;
            }
            onTypeChange(val);
            if (val === "BOOLEAN") {
              onCharacterTypeChange("BOOLEAN");
            } else if (characterType === "BOOLEAN") {
              onCharacterTypeChange(null);
            }
            onSelectionTypeChange(null);
            onQuestionTemplateChange("");
            onAddedOptionsChange([]);
            onCurrentOptionChange("");
            onMinimumOptionsErrorChange(false);
          }}
          getOptionValue={(i) => i.value}
          getOptionLabel={(i) => i.label}
        />

        {type.length > 0 && type !== "BOOLEAN" && (
          <CRadioGroup
            label="Tipo de valor"
            name="characterType"
            options={characterTypeOptions}
            value={characterType}
            onChange={(e) => {
              onCharacterTypeChange(e);
            }}
            getOptionValue={(i) => i.value}
            getOptionLabel={(i) => i.label}
          />
        )}

        {type === "BOOLEAN" && (
          <input type="hidden" name="characterType" value="BOOLEAN" />
        )}

        {characterType === "SCALE" && (
          <>
            <CNumberField
              label="Valor mínimo"
              name="minValue"
              required
              value={minValue}
              onChange={onMinValueChange}
            />
            <CNumberField
              label="Valor máximo"
              name="maxValue"
              required
              value={maxValue}
              onChange={onMaxValueChange}
            />
          </>
        )}

        <div className="flex flex-col gap-2">
          {shouldShowScaleOptionsSection({
            type,
            characterType,
            minValue,
            maxValue,
          }) && (
            <>
              <CRadioGroup
                label="Tipo de seleção"
                name="optionType"
                options={
                  characterType === "SCALE" ?
                    [{ value: "RADIO", label: "Única" }]
                  : [
                      { value: "RADIO", label: "Única" },
                      { value: "CHECKBOX", label: "Múltipla" },
                    ]
                }
                value={selectionType}
                onChange={onSelectionTypeChange}
                getOptionValue={(i) => i.value}
                getOptionLabel={(i) => i.label}
              />

              <div className="flex flex-col">
                {selectionType &&
                  selectionType.length > 0 &&
                  ((
                    characterType === "SCALE" ||
                    characterType === "PERCENTAGE" ||
                    characterType === "NUMBER"
                  ) ?
                    <input type="hidden" value="FREE" />
                  : <CRadioGroup
                      label="Tipo de opções"
                      value={questionTemplate}
                      onChange={(e) => {
                        if (!e) {
                          return;
                        }
                        onQuestionTemplateChange(e);
                      }}
                      options={
                        selectionType === "CHECKBOX" ?
                          [{ value: "FREE", label: "Livre" }]
                        : [
                            { value: "FREE", label: "Livre" },
                            { value: "YES_NO", label: "Sim ou não" },
                            {
                              value: "QUALITY_SCALE",
                              label: "Escala de qualidade",
                            },
                          ]
                      }
                      getOptionLabel={(i) => i.label}
                      getOptionValue={(i) => i.value}
                    />)}

                {questionTemplate === "FREE" && (
                  <>
                    {characterType === "SCALE" && (
                      <CRadioGroup
                        label="Modo de opções"
                        value={scaleOptionMode}
                        onChange={(val) => {
                          if (!val) return;
                          onScaleOptionModeChange(val);
                        }}
                        options={scaleOptionModeOptions}
                        getOptionLabel={(i) => i.label}
                        getOptionValue={(i) => i.value}
                      />
                    )}
                    {characterType === "SCALE" &&
                      scaleOptionMode === "STEP" && (
                        <div className="mt-1 flex flex-col gap-1">
                          <CNumberField
                            label="Passo"
                            required
                            value={scaleStep}
                            onChange={onScaleStepChange}
                          />
                          <CButton
                            onClick={() => {
                              if (minValue === null || maxValue === null) {
                                showError(
                                  <>
                                    Informe o valor mínimo e máximo antes de
                                    gerar as opções.
                                  </>,
                                );
                                return;
                              }
                              if (scaleStep === null || scaleStep <= 0) {
                                showError(<>Informe um passo válido.</>);
                                return;
                              }
                              if (minValue >= maxValue) {
                                showError(
                                  <>
                                    O valor mínimo deve ser menor que o máximo.
                                  </>,
                                );
                                return;
                              }
                              const decimals =
                                scaleStep.toString().split(".")[1]?.length ?? 0;
                              const nextOptions: { text: string }[] = [];
                              const epsilon =
                                Math.pow(10, -Math.max(decimals, 6)) / 2;
                              let current = minValue;
                              let guard = 0;
                              while (
                                current <= maxValue + epsilon &&
                                guard < 10000
                              ) {
                                const normalized = Number(
                                  current.toFixed(decimals),
                                );
                                nextOptions.push({ text: String(normalized) });
                                current += scaleStep;
                                guard += 1;
                              }
                              onAddedOptionsChange(nextOptions);
                              onCurrentOptionChange("");
                            }}
                          >
                            Gerar opções
                          </CButton>
                        </div>
                      )}
                    {(characterType !== "SCALE" ||
                      scaleOptionMode === "MANUAL") && (
                      <>
                        <div className="mt-1 font-semibold">
                          Digite as opções:
                        </div>
                        <div className="flex w-full items-center">
                          {(
                            characterType === "NUMBER" ||
                            characterType === "PERCENTAGE" ||
                            characterType === "SCALE"
                          ) ?
                            <CNumberField
                              className="w-full"
                              endAdornment={
                                characterType === "PERCENTAGE" ? "%" : ""
                              }
                              value={
                                currentOption.length > 0 ?
                                  Number(currentOption)
                                : null
                              }
                              onChange={(val) => {
                                onCurrentOptionChange(
                                  val != null ? String(val) : "",
                                );
                              }}
                            />
                          : <CTextField
                              className="w-full"
                              value={currentOption}
                              onChange={(e) => {
                                onCurrentOptionChange(e.target.value);
                              }}
                            />
                          }
                          <CButton
                            sx={{ ml: "4px" }}
                            square
                            disabled={currentOption === ""}
                            onClick={() => {
                              const parsed = Number(currentOption);
                              if (
                                characterType === "SCALE" &&
                                (Number.isNaN(parsed) ||
                                  minValue === null ||
                                  maxValue === null ||
                                  parsed < minValue ||
                                  parsed > maxValue)
                              ) {
                                showError(
                                  <>
                                    Informe um número dentro do intervalo da
                                    escala.
                                  </>,
                                );
                                return;
                              }
                              if (addedOptions != undefined) {
                                if (
                                  !addedOptions.some(
                                    (opt) => opt.text === currentOption,
                                  )
                                ) {
                                  onAddedOptionsChange([
                                    ...addedOptions,
                                    { text: currentOption },
                                  ]);
                                }
                              } else {
                                onAddedOptionsChange([{ text: currentOption }]);
                              }

                              onCurrentOptionChange("");
                            }}
                          >
                            <IconPlus />
                          </CButton>
                        </div>
                      </>
                    )}
                  </>
                )}

                {minumumOptionsError && (
                  <p className="text-red-500">Adicione pelo menos uma opção!</p>
                )}
                <div className="mt-1">
                  <div className="font-semibold">Opções:</div>
                  <ul className="list-inside list-disc space-y-2">
                    {addedOptions?.map((option) => {
                      return (
                        <li
                          key={option.text}
                          className="flex items-center rounded-md bg-white p-2 outline outline-1 outline-black"
                        >
                          {(
                            characterType === "NUMBER" ||
                            characterType === "PERCENTAGE" ||
                            characterType === "SCALE"
                          ) ?
                            localeNumberFormatter.format(Number(option.text)) +
                            `${characterType === "PERCENTAGE" ? "%" : ""}`
                          : option.text}

                          <CButton
                            className="ml-auto"
                            square
                            color="error"
                            variant="text"
                            disabled={questionTemplate !== "FREE"}
                            onClick={() => onRemoveOption(option.text)}
                          >
                            <IconTrash />
                          </CButton>
                          <input
                            type="hidden"
                            name="options"
                            value={option.text}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {(type === "WRITTEN" ||
          type === "BOOLEAN" ||
          (questionTemplate && questionTemplate.length > 0)) &&
          characterType &&
          characterType.length > 0 &&
          (type === "OPTIONS" ?
            addedOptions && addedOptions.length > 0
          : true) && (
            <CRadioGroup
              label="Possui geometria associada?"
              name="hasAssociatedGeometry"
              id="hasAssociatedGeometry"
              options={[
                { value: true, label: "Sim" },
                { value: false, label: "Não" },
              ]}
              value={hasAssociatedGeometry}
              onChange={onHasAssociatedGeometryChange}
              getOptionValue={(i) => i.value}
              getOptionLabel={(i) => i.label}
            />
          )}

        {hasAssociatedGeometry && (
          <CCheckboxGroup
            label="Tipos de geometria aceitos"
            name="geometryTypes"
            value={geometryTypes}
            options={[
              { value: "POINT", label: "Pontos" },
              { value: "POLYGON", label: "Polígonos" },
            ]}
            getOptionLabel={(i) => i.label}
            getOptionValue={(i) => i.value}
            onChange={onGeometryTypesChange}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionCreationFormStep;
