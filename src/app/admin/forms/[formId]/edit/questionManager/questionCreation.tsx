"use client";

import CIconChip from "@/components/ui/cIconChip";
import CSwitch from "@/components/ui/cSwtich";
import { localeNumberFormatter } from "@/lib/formatters/numberFormatters";
import CButton from "@components/ui/cButton";
import CDialog from "@components/ui/dialog/cDialog";
import { useHelperCard } from "@context/helperCardContext";
import { QuestionResponseCharacterTypes } from "@prisma/client";
import { _questionSubmit } from "@serverActions/questionUtil";
import {
  IconCheck,
  IconHelp,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import React, {
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";

import { useLoadingOverlay } from "../../../../../../components/context/loadingContext";
import CCheckboxGroup from "../../../../../../components/ui/cCheckboxGroup";
import CNumberField from "../../../../../../components/ui/cNumberField";
import CRadioGroup from "../../../../../../components/ui/cRadioGroup";
import CTextField from "../../../../../../components/ui/cTextField";
import QuestionIconPicker from "./questionIconPicker";

type ScaleOptionMode = "MANUAL" | "STEP";

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

const QuestionCreation = ({
  categoryId,
  categoryName,
  subcategoryId,
  subcategoryName,
  open,
  onClose,
  fetchCategoriesAfterCreation,
}: {
  categoryId: number | undefined;
  categoryName: string | undefined;
  subcategoryId: number | undefined;
  subcategoryName: string | undefined;
  open: boolean;
  onClose: () => void;
  fetchCategoriesAfterCreation: () => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [state, formAction, isPending] = useActionState(_questionSubmit, null);
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS" | "ERROR">(
    "FORM",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [reloadOnClose, setReloadOnClose] = useState(false);
  const [type, setType] = useState("");
  const [characterType, setCharacterType] =
    useState<QuestionResponseCharacterTypes | null>(null);
  const [hasAssociatedGeometry, setHasAssociatedGeometry] = useState<
    boolean | null
  >(null);
  const [geometryTypes, setGeometryTypes] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState("");
  const [addedOptions, setAddedOptions] = useState<{ text: string }[]>();
  const [selectionType, setSelectionType] = useState<string | null>(null);
  const [minumumOptionsError, setMinimumOptionsError] = useState(false);
  const [questionTemplate, setQuestionTemplate] = useState<string | null>(null);
  const [selectedIconKey, setSelectedIconKey] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [minValue, setMinValue] = useState<number | null>(null);
  const [maxValue, setMaxValue] = useState<number | null>(null);
  const [scaleOptionMode, setScaleOptionMode] =
    useState<ScaleOptionMode>("MANUAL");
  const [scaleStep, setScaleStep] = useState<number | null>(null);

  const handleQuestionTemplate = (template: string) => {
    switch (template) {
      case "YES_NO":
        setAddedOptions([{ text: "Sim" }, { text: "Não" }]);
        break;
      case "QUALITY_SCALE":
        setAddedOptions([
          { text: "Péssimo" },
          { text: "Ruim" },
          { text: "Bom" },
          { text: "Ótimo" },
        ]);
        break;
      default:
        break;
    }
    setQuestionTemplate(template);
  };

  const resetModal = () => {
    setType("");
    setCharacterType(null);
    setSelectionType(null);
    setCurrentOption("");
    setHasAssociatedGeometry(null);
    setAddedOptions(undefined);
    setQuestionTemplate(null);
    setGeometryTypes([]);
    setSelectedIconKey(null);
    setPageState("FORM");
    setMinValue(null);
    setMaxValue(null);
    setScaleOptionMode("MANUAL");
    setScaleStep(null);
  };
  useEffect(() => {
    if (state?.statusCode === 201) {
      setReloadOnClose(true);
      setPageState("SUCCESS");
      setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Questão registrada!</>,
      });
    } else if (state?.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para registrar questões!</>,
      });
      setPageState("ERROR");
    } else if (state?.statusCode === 400 || state?.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao registar questão!</>,
      });
      setPageState("ERROR");
    }
  }, [state, setHelperCard]);

  const handleRemoveOption = (option: string) => {
    setAddedOptions((prev) => prev?.filter((p) => p.text !== option));
  };

  const handleClose = () => {
    if (reloadOnClose) {
      fetchCategoriesAfterCreation();
    }
    resetModal();
    setIsOpen(false);
    onClose();
  };

  useEffect(() => {
    setAddedOptions(undefined);
  }, [characterType, type]);

  useEffect(() => {
    if (
      type === "OPTIONS" &&
      (characterType === "SCALE" ||
        characterType === "NUMBER" ||
        characterType === "PERCENTAGE")
    ) {
      setSelectionType("RADIO");
      setQuestionTemplate("FREE");
    }
  }, [type, characterType]);

  useEffect(() => {
    if (!isOpen) {
      setPageState("FORM");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Salvando questão..." });
    } else {
      setLoadingOverlay({ show: false });
    }
  }, [isPending, setLoadingOverlay]);
  return (
    <CDialog
      onClose={handleClose}
      open={open}
      isForm
      fullScreen
      onSubmit={(e) => {
        if (e.currentTarget instanceof HTMLDivElement) {
          return;
        }
        e.preventDefault();
        const isScale = characterType === "SCALE";
        if (!selectedIconKey || selectedIconKey.length === 0) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Selecione um icone para a questao.</>,
          });
          return;
        }
        if (isScale) {
          if (minValue === null || maxValue === null) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: <>Informe o valor mí­nimo e máximo da escala.</>,
            });
            return;
          }
          if (minValue >= maxValue) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: <>O valor má­ximo deve ser menor que o máximo.</>,
            });
            return;
          }
        }
        if (
          type === "OPTIONS" &&
          (!addedOptions || addedOptions.length === 0)
        ) {
          setMinimumOptionsError(true);
          return;
        }
        if (type === "OPTIONS" && isScale && addedOptions) {
          const invalidOption = addedOptions.find((option) => {
            const parsed = Number(option.text);
            if (Number.isNaN(parsed)) return true;
            if (minValue === null || maxValue === null) return true;
            return parsed < minValue || parsed > maxValue;
          });
          if (invalidOption) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: (
                <>
                  As opÃ§Ãµes devem ser nÃºmeros dentro do intervalo da escala.
                </>
              ),
            });
            return;
          }
        }
        if (hasAssociatedGeometry && geometryTypes.length === 0) {
          setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Nenhum tipo de geometria selecionado!</>,
          });
          return;
        }
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      title="Criar questão"
      confirmChildren={<>Criar</>}
      disableConfirmButton={
        isPending ||
        pageState !== "FORM" ||
        hasAssociatedGeometry === null ||
        selectedIconKey === null ||
        (characterType === "SCALE" && (minValue === null || maxValue === null))
      }
    >
      <div className="h-full">
        {!isPending && pageState === "FORM" && (
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
                    setIsPublic(e.target.checked);
                  }}
                />
                <CIconChip
                  icon={<IconHelp />}
                  tooltip="Respostas dessa questão serão visíveis publicamente em avaliações também visíveis publicamente"
                />
              </div>

              <QuestionIconPicker
                selectedIconKey={selectedIconKey}
                onChange={setSelectedIconKey}
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
                  setType(val);
                  if (val === "BOOLEAN") {
                    setCharacterType("BOOLEAN");
                  } else if (characterType === "BOOLEAN") {
                    setCharacterType(null);
                  }
                  setSelectionType(null);
                  setQuestionTemplate(null);
                  setAddedOptions(undefined);
                  setCurrentOption("");
                  setMinimumOptionsError(false);
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
                    setCharacterType(e);
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
                    label="Valor mí­nimo"
                    name="minValue"
                    required
                    value={minValue}
                    onChange={(val) => {
                      setMinValue(val);
                    }}
                  />
                  <CNumberField
                    label="Valor máximo"
                    name="maxValue"
                    required
                    value={maxValue}
                    onChange={(val) => {
                      setMaxValue(val);
                    }}
                  />
                </>
              )}

              <div className={"flex flex-col gap-2"}>
                {!!characterType &&
                  type == "OPTIONS" &&
                  (characterType === "SCALE" ? minValue && maxValue : true) && (
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
                        onChange={(val) => {
                          setSelectionType(val);
                        }}
                        getOptionValue={(i) => i.value}
                        getOptionLabel={(i) => i.label}
                      />

                      <div className={"flex flex-col"}>
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
                                handleQuestionTemplate(e);
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
                                  setScaleOptionMode(val);
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
                                    onChange={(val) => {
                                      setScaleStep(val);
                                    }}
                                  />
                                  <CButton
                                    onClick={() => {
                                      if (
                                        minValue === null ||
                                        maxValue === null
                                      ) {
                                        setHelperCard({
                                          show: true,
                                          helperCardType: "ERROR",
                                          content: (
                                            <>
                                              Informe o valor mínimo e máximo
                                              antes de gerar as opções.
                                            </>
                                          ),
                                        });
                                        return;
                                      }
                                      if (
                                        scaleStep === null ||
                                        scaleStep <= 0
                                      ) {
                                        setHelperCard({
                                          show: true,
                                          helperCardType: "ERROR",
                                          content: (
                                            <>Informe um passo válido.</>
                                          ),
                                        });
                                        return;
                                      }
                                      if (minValue >= maxValue) {
                                        setHelperCard({
                                          show: true,
                                          helperCardType: "ERROR",
                                          content: (
                                            <>
                                              O valor mínimo deve ser menor que
                                              o máximo.
                                            </>
                                          ),
                                        });
                                        return;
                                      }
                                      const decimals =
                                        scaleStep.toString().split(".")[1]
                                          ?.length ?? 0;
                                      const nextOptions: { text: string }[] =
                                        [];
                                      const epsilon =
                                        Math.pow(10, -Math.max(decimals, 6)) /
                                        2;
                                      let current = minValue;
                                      let guard = 0;
                                      while (
                                        current <= maxValue + epsilon &&
                                        guard < 10000
                                      ) {
                                        const normalized = Number(
                                          current.toFixed(decimals),
                                        );
                                        nextOptions.push({
                                          text: String(normalized),
                                        });
                                        current += scaleStep;
                                        guard += 1;
                                      }
                                      setAddedOptions(nextOptions);
                                      setCurrentOption("");
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
                                        characterType === "PERCENTAGE" ? "%" : (
                                          ""
                                        )
                                      }
                                      value={
                                        currentOption.length > 0 ?
                                          Number(currentOption)
                                        : null
                                      }
                                      onChange={(val) => {
                                        setCurrentOption(() =>
                                          val != null ? String(val) : "",
                                        );
                                      }}
                                    />
                                  : <CTextField
                                      className="w-full"
                                      value={currentOption}
                                      onChange={(e) => {
                                        setCurrentOption(e.target.value);
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
                                        setHelperCard({
                                          show: true,
                                          helperCardType: "ERROR",
                                          content: (
                                            <>
                                              Informe um número dentro do
                                              intervalo da escala.
                                            </>
                                          ),
                                        });
                                        return;
                                      }
                                      if (addedOptions != undefined) {
                                        if (
                                          !addedOptions.some(
                                            (opt) => opt.text === currentOption,
                                          )
                                        )
                                          setAddedOptions([
                                            ...addedOptions,
                                            { text: currentOption },
                                          ]);
                                      } else
                                        setAddedOptions([
                                          { text: currentOption },
                                        ]);

                                      setCurrentOption("");
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
                          <p className="text-red-500">
                            Adicione pelo menos uma opção!
                          </p>
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
                                    localeNumberFormatter.format(
                                      Number(option.text),
                                    ) +
                                    `${characterType === "PERCENTAGE" ? "%" : ""}`
                                  : option.text}

                                  <CButton
                                    className="ml-auto"
                                    square
                                    color="error"
                                    variant={"text"}
                                    disabled={questionTemplate !== "FREE"}
                                    onClick={() =>
                                      handleRemoveOption(option.text)
                                    }
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
                    onChange={(val) => {
                      setHasAssociatedGeometry(val);
                    }}
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
                  onChange={(val) => {
                    setGeometryTypes(val);
                  }}
                />
              )}
            </div>
          </div>
        )}
        {pageState === "SUCCESS" && (
          <div className="flex flex-col items-center">
            <h5 className="text-center text-xl font-semibold">
              {`Questão "${state?.questionName}" criada!`}
            </h5>
            <div className="flex justify-center">
              <IconCheck className="h-32 w-32 text-2xl text-green-500" />
            </div>
            <CButton onClick={resetModal}>Criar nova questão</CButton>
          </div>
        )}
        {pageState === "ERROR" && (
          <div className="flex flex-col items-center">
            {state?.statusCode === 500 && (
              <h5 className="text-center text-xl font-semibold">
                Algo deu errado!
              </h5>
            )}

            <div className="flex justify-center">
              <IconX className="h-32 w-32 text-2xl text-red-500" />
            </div>
            <CButton
              onClick={() => {
                setPageState("FORM");
              }}
            >
              Tentar novamente
            </CButton>
          </div>
        )}
      </div>
    </CDialog>
  );
};

export default QuestionCreation;
