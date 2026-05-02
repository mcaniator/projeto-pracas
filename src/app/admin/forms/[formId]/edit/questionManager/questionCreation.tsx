"use client";

import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import CButton from "@components/ui/cButton";
import CDialog from "@components/ui/dialog/cDialog";
import { useHelperCard } from "@context/helperCardContext";
import { Step, StepLabel, Stepper } from "@mui/material";
import type {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { _questionSubmit } from "@serverActions/questionUtil";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCheck,
} from "@tabler/icons-react";
import {
  type FormEventHandler,
  type ReactNode,
  startTransition,
  useEffect,
  useState,
} from "react";

import QuestionCreationFormStep from "./questionCreationFormStep";
import QuestionCreationPreviewStep from "./questionCreationPreviewStep";
import type {
  QuestionCreationDraft,
  ScaleOptionMode,
} from "./questionCreationTypes";

const steps = ["Configuração", "Prévia"];

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
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS">("FORM");
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
  const [step, setStep] = useState(1);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [previewDraft, setPreviewDraft] =
    useState<QuestionCreationDraft | null>(null);

  const [formAction, isPending, , resetActionState] = useResettableActionState({
    action: _questionSubmit,
    callbacks: {
      onSuccess: () => {
        setReloadOnClose(true);
        setPageState("SUCCESS");
      },
      onError: () => {
        setPageState("FORM");
      },
    },
    options: {
      loadingMessage: "Salvando questÃ£o...",
    },
  });

  const handleQuestionTemplate = (template: string) => {
    switch (template) {
      case "YES_NO":
        setAddedOptions([{ text: "Sim" }, { text: "NÃ£o" }]);
        break;
      case "QUALITY_SCALE":
        setAddedOptions([
          { text: "PÃ©ssimo" },
          { text: "Ruim" },
          { text: "Bom" },
          { text: "Ã“timo" },
        ]);
        break;
      default:
        break;
    }
    setQuestionTemplate(template);
  };

  const resetModal = () => {
    resetActionState();
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
    setStep(1);
    setPendingFormData(null);
    setPreviewDraft(null);
  };
  const handleRemoveOption = (option: string) => {
    setAddedOptions((prev) => prev?.filter((p) => p.text !== option));
  };

  const handleClose = () => {
    if (reloadOnClose) {
      fetchCategoriesAfterCreation();
    }
    resetModal();
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

  const showError = (content: ReactNode) => {
    setHelperCard({
      show: true,
      helperCardType: "ERROR",
      content,
    });
  };

  const validateCurrentQuestion = () => {
    const isScale = characterType === "SCALE";
    if (!selectedIconKey || selectedIconKey.length === 0) {
      showError(<>Selecione um Ã­cone para a questÃ£o.</>);
      return false;
    }
    if (isScale) {
      if (minValue === null || maxValue === null) {
        showError(<>Informe o valor mÃ­nimo e mÃ¡ximo da escala.</>);
        return false;
      }
      if (minValue >= maxValue) {
        showError(<>O valor mÃ­nimo deve ser menor que o mÃ¡ximo.</>);
        return false;
      }
    }
    if (type === "OPTIONS" && (!addedOptions || addedOptions.length === 0)) {
      setMinimumOptionsError(true);
      return false;
    }
    if (type === "OPTIONS" && isScale && addedOptions) {
      const invalidOption = addedOptions.find((option) => {
        const parsed = Number(option.text);
        if (Number.isNaN(parsed)) return true;
        if (minValue === null || maxValue === null) return true;
        return parsed < minValue || parsed > maxValue;
      });
      if (invalidOption) {
        showError(
          <>As opÃ§Ãµes devem ser nÃºmeros dentro do intervalo da escala.</>,
        );
        return false;
      }
    }
    if (hasAssociatedGeometry && geometryTypes.length === 0) {
      showError(<>Nenhum tipo de geometria selecionado!</>);
      return false;
    }

    return true;
  };

  const buildPreviewDraft = (formData: FormData): QuestionCreationDraft => {
    const notes = String(formData.get("notes") ?? "");

    return {
      name: String(formData.get("name") ?? ""),
      notes: notes.length > 0 ? notes : null,
      iconKey: selectedIconKey ?? "",
      isPublic,
      questionType: type as QuestionTypes,
      characterType: characterType as QuestionResponseCharacterTypes,
      optionType:
        type === "OPTIONS" ? (selectionType as OptionTypes | null) : null,
      options: addedOptions ?? [],
      hasAssociatedGeometry: hasAssociatedGeometry === true,
      geometryTypes:
        hasAssociatedGeometry === true ?
          (geometryTypes as QuestionGeometryTypes[])
        : [],
      scaleConfig:
        characterType === "SCALE" && minValue !== null && maxValue !== null ?
          { minValue, maxValue }
        : null,
    };
  };

  const handleSubmit: FormEventHandler<HTMLDivElement> &
    FormEventHandler<HTMLFormElement> = (event) => {
    if (!(event.currentTarget instanceof HTMLFormElement)) {
      return;
    }
    event.preventDefault();

    if (pageState !== "FORM") {
      return;
    }

    if (step === 1) {
      if (!validateCurrentQuestion()) {
        return;
      }

      const formData = new FormData(event.currentTarget);
      setPendingFormData(formData);
      setPreviewDraft(buildPreviewDraft(formData));
      setStep(2);
      return;
    }

    if (!pendingFormData) {
      return;
    }

    startTransition(() => {
      formAction(pendingFormData);
    });
  };

  const handleCancel = () => {
    if (step === 2) {
      setStep(1);
      return;
    }

    handleClose();
  };

  return (
    <CDialog
      onClose={handleClose}
      open={open}
      isForm
      fullScreen
      onSubmit={handleSubmit}
      title="Criar questão"
      confirmChildren={step === 1 ? <IconArrowForwardUp /> : <>Criar</>}
      cancelChildren={<IconArrowBackUp />}
      onCancel={handleCancel}
      confirmLoading={isPending}
      disableConfirmButton={
        isPending ||
        pageState !== "FORM" ||
        (step === 1 &&
          (hasAssociatedGeometry === null ||
            selectedIconKey === null ||
            (characterType === "SCALE" &&
              (minValue === null || maxValue === null)))) ||
        (step === 2 && !pendingFormData)
      }
    >
      <div className="flex h-full flex-col gap-4">
        <Stepper activeStep={step - 1}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div
          className={
            !isPending && pageState === "FORM" && step === 1 ? "" : "hidden"
          }
        >
          <QuestionCreationFormStep
            categoryId={categoryId}
            categoryName={categoryName}
            subcategoryId={subcategoryId}
            subcategoryName={subcategoryName}
            type={type}
            characterType={characterType}
            hasAssociatedGeometry={hasAssociatedGeometry}
            geometryTypes={geometryTypes}
            currentOption={currentOption}
            addedOptions={addedOptions}
            selectionType={selectionType}
            minumumOptionsError={minumumOptionsError}
            questionTemplate={questionTemplate}
            selectedIconKey={selectedIconKey}
            isPublic={isPublic}
            minValue={minValue}
            maxValue={maxValue}
            scaleOptionMode={scaleOptionMode}
            scaleStep={scaleStep}
            onQuestionTemplateChange={handleQuestionTemplate}
            onRemoveOption={handleRemoveOption}
            onTypeChange={setType}
            onCharacterTypeChange={setCharacterType}
            onHasAssociatedGeometryChange={setHasAssociatedGeometry}
            onGeometryTypesChange={setGeometryTypes}
            onCurrentOptionChange={setCurrentOption}
            onAddedOptionsChange={setAddedOptions}
            onSelectionTypeChange={setSelectionType}
            onMinimumOptionsErrorChange={setMinimumOptionsError}
            onSelectedIconKeyChange={setSelectedIconKey}
            onIsPublicChange={setIsPublic}
            onMinValueChange={setMinValue}
            onMaxValueChange={setMaxValue}
            onScaleOptionModeChange={setScaleOptionMode}
            onScaleStepChange={setScaleStep}
            showError={showError}
          />
        </div>

        <div
          className={
            !isPending && pageState === "FORM" && step === 2 ? "" : "hidden"
          }
        >
          {previewDraft && (
            <QuestionCreationPreviewStep
              draft={previewDraft}
              categoryName={categoryName}
              subcategoryName={subcategoryName}
            />
          )}
        </div>

        {pageState === "SUCCESS" && (
          <div className="flex flex-col items-center">
            <h5 className="text-center text-xl font-semibold">
              Questão criada!
            </h5>
            <div className="flex justify-center">
              <IconCheck className="h-32 w-32 text-2xl text-green-500" />
            </div>
            <CButton onClick={resetModal}>Criar nova questão</CButton>
          </div>
        )}
      </div>
    </CDialog>
  );
};

export default QuestionCreation;
