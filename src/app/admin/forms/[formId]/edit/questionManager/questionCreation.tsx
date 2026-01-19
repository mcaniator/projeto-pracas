"use client";

import CButton from "@components/ui/cButton";
import CDialog from "@components/ui/dialog/cDialog";
import { useHelperCard } from "@context/helperCardContext";
import { _questionSubmit } from "@serverActions/questionUtil";
import { IconCheck, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
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

type CharacterType = "TEXT" | "NUMBER";

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
  const [characterType, setCharacterType] = useState<CharacterType | null>(
    null,
  );
  const [hasAssociatedGeometry, setHasAssociatedGeometry] = useState<
    boolean | null
  >(null);
  const [geometryTypes, setGeometryTypes] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState("");
  const [addedOptions, setAddedOptions] = useState<{ text: string }[]>();
  const [selectionType, setSelectionType] = useState<string | null>(null);
  const [minumumOptionsError, setMinimumOptionsError] = useState(false);
  const [questionTemplate, setQuestionTemplate] = useState<string | null>(null);

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
    setPageState("FORM");
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
        if (
          type === "OPTIONS" &&
          (!addedOptions || addedOptions.length === 0)
        ) {
          setMinimumOptionsError(true);
          return;
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
        isPending || pageState !== "FORM" || hasAssociatedGeometry === null
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

              <CRadioGroup
                label="Tipo de questão"
                name="questionType"
                options={[
                  { value: "WRITTEN", label: "Escrito" },
                  { value: "OPTIONS", label: "Seleção" },
                ]}
                value={type}
                onChange={(val) => {
                  setType(val);
                }}
                getOptionValue={(i) => i.value}
                getOptionLabel={(i) => i.label}
              />

              {type.length > 0 && (
                <CRadioGroup
                  label="Tipo de caracteres"
                  name="characterType"
                  options={[
                    { value: "TEXT", label: "Texto" },
                    { value: "NUMBER", label: "Numérico" },
                  ]}
                  value={characterType}
                  onChange={(e) => {
                    setCharacterType(e as CharacterType);
                  }}
                  getOptionValue={(i) => i.value}
                  getOptionLabel={(i) => i.label}
                />
              )}

              <div className={"flex flex-col gap-2"}>
                {!!characterType && type == "OPTIONS" && (
                  <>
                    <CRadioGroup
                      label="Tipo de seleção"
                      name="optionType"
                      options={[
                        { value: "RADIO", label: "Única" },
                        { value: "CHECKBOX", label: "Múltipla" },
                      ]}
                      value={selectionType}
                      onChange={(val) => {
                        setSelectionType(val);
                      }}
                      getOptionValue={(i) => i.value}
                      getOptionLabel={(i) => i.label}
                    />

                    <div className={"flex flex-col"}>
                      {selectionType && selectionType.length > 0 && (
                        <CRadioGroup
                          label="Tipo de opções"
                          value={questionTemplate}
                          onChange={(e) => {
                            handleQuestionTemplate(e);
                          }}
                          options={
                            (
                              characterType === "NUMBER" ||
                              selectionType === "CHECKBOX"
                            ) ?
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
                        />
                      )}

                      {questionTemplate === "FREE" && (
                        <>
                          <div className="mt-1 font-semibold">
                            Digite as opções:
                          </div>
                          <div className="flex w-full items-center">
                            {characterType === "NUMBER" ?
                              <CNumberField
                                className="w-full"
                                value={
                                  currentOption.length > 0 ?
                                    Number(currentOption)
                                  : null
                                }
                                onChange={(val) => {
                                  setCurrentOption(
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
                                  setAddedOptions([{ text: currentOption }]);

                                setCurrentOption("");
                              }}
                            >
                              <IconPlus />
                            </CButton>
                          </div>
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
                                {option.text}

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
                (questionTemplate && questionTemplate.length > 0)) &&
                characterType &&
                characterType.length > 0 && (
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
                  label="Tipos de geomtria aceitos"
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
