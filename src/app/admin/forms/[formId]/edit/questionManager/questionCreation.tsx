"use client";

import QuestionUses from "@/app/admin/forms/[formId]/edit/questionManager/questionUses";
import CLinearProgress from "@/components/ui/CLinearProgress";
import { useFetchQuestionUses } from "@/lib/serverFunctions/apiCalls/question";
import { FetchquestionUsesResponse } from "@/lib/serverFunctions/queries/question";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import CButton from "@components/ui/cButton";
import CDialog from "@components/ui/dialog/cDialog";
import { useHelperCard } from "@context/helperCardContext";
import type {
  OptionForQuestionPicker,
  QuestionPickerQuestionToEdit,
} from "@customTypes/forms/formCreation";
import { Step, StepLabel, Stepper } from "@mui/material";
import type {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import { _questionSubmit, _questionUpdate } from "@serverActions/questionUtil";
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
  question,
}: {
  categoryId: number | undefined;
  categoryName: string | undefined;
  subcategoryId: number | undefined;
  subcategoryName: string | undefined;
  open: boolean;
  onClose: () => void;
  fetchCategoriesAfterCreation: () => void;
  question?: QuestionPickerQuestionToEdit | null;
}) => {
  const isEditing = !!question;
  const activeCategoryId = question?.categoryId ?? categoryId;
  const activeCategoryName = question?.categoryName ?? categoryName;
  const activeSubcategoryId = question?.subcategoryId ?? subcategoryId;
  const activeSubcategoryName = question?.subcategoryName ?? subcategoryName;
  const { setHelperCard } = useHelperCard();
  const [pageState, setPageState] = useState<"FORM" | "SUCCESS">("FORM");
  const [reloadOnClose, setReloadOnClose] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [characterType, setCharacterType] =
    useState<QuestionResponseCharacterTypes | null>(null);
  const [hasAssociatedGeometry, setHasAssociatedGeometry] = useState<
    boolean | null
  >(null);
  const [geometryTypes, setGeometryTypes] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState("");
  const [addedOptions, setAddedOptions] =
    useState<Omit<OptionForQuestionPicker, "id">[]>();
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
  const [questionUses, setQuestionUses] =
    useState<FetchquestionUsesResponse | null>(null);

  const [fetchQuestionUses, isFetchingQuestionUses] = useFetchQuestionUses({
    callbacks: {
      onSuccess: (response) => {
        setQuestionUses(response.data ?? null);
      },
    },
  });

  const [createFormAction, isCreatePending] = useResettableActionState({
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
      loadingMessage: "Salvando questão...",
    },
  });
  const [updateFormAction, isUpdatePending] = useResettableActionState({
    action: _questionUpdate,
    callbacks: {
      onSuccess: () => {
        fetchCategoriesAfterCreation();
        resetModal();
        onClose();
      },
      onError: () => {
        setPageState("FORM");
      },
    },
    options: {
      loadingMessage: "Salvando questão...",
    },
  });
  const isPending = isCreatePending || isUpdatePending;

  const handleQuestionTemplate = (template: string) => {
    switch (template) {
      case "YES_NO":
        setAddedOptions([
          {
            text: "Sim",
            isOverridable: false,
          },
          {
            text: "Não",
            isOverridable: false,
          },
        ]);
        break;
      case "QUALITY_SCALE":
        setAddedOptions([
          {
            text: "Péssimo",
            isOverridable: false,
          },
          {
            text: "Ruim",
            isOverridable: false,
          },
          {
            text: "Bom",
            isOverridable: false,
          },
          {
            text: "Ótimo",
            isOverridable: false,
          },
        ]);
        break;
      case "WEEKDAY":
        setAddedOptions([
          {
            text: "Domingo",
            isOverridable: false,
          },
          {
            text: "Segunda-feira",
            isOverridable: false,
          },
          {
            text: "Terça-feira",
            isOverridable: false,
          },
          {
            text: "Quarta-feira",
            isOverridable: false,
          },
          {
            text: "Quinta-feira",
            isOverridable: false,
          },
          {
            text: "Sexta-feira",
            isOverridable: false,
          },
          {
            text: "Sábado",
            isOverridable: false,
          },
        ]);
        break;
      default:
        setAddedOptions([]);
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
    setIsPublic(true);
    setTitle(null);
    setNotes(null);
    setStep(1);
    setPendingFormData(null);
    setPreviewDraft(null);
    setQuestionUses(null);
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
    if (isEditing) {
      return;
    }
    setAddedOptions(undefined);
  }, [isEditing]);

  useEffect(() => {
    if (!open || !question) {
      return;
    }
    void fetchQuestionUses({ questionId: question.id });
    setType(question.questionType);
    setCharacterType(question.characterType);
    setSelectionType(question.optionType);
    setCurrentOption("");
    setHasAssociatedGeometry(question.geometryTypes.length > 0);
    setAddedOptions(
      question.options.map((option) => ({
        text: option.text,
        isOverridable: option.isOverridable,
      })),
    );
    setQuestionTemplate(question.questionType === "OPTIONS" ? "FREE" : null);
    setGeometryTypes(question.geometryTypes);
    setSelectedIconKey(question.iconKey);
    setPageState("FORM");
    setMinValue(question.scaleConfig?.minValue ?? null);
    setMaxValue(question.scaleConfig?.maxValue ?? null);
    setScaleOptionMode("MANUAL");
    setScaleStep(null);
    setIsPublic(question.isPublic);
    setTitle(question.name);
    setNotes(question.notes);
    setStep(1);
    setPendingFormData(null);
    setPreviewDraft(null);
    setReloadOnClose(false);
  }, [open, question, fetchQuestionUses]);

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
      showError(<>Selecione um Í­cone para a questão.</>);
      return false;
    }
    if (isScale) {
      if (minValue === null || maxValue === null) {
        showError(<>Informe o valor mí­nimo e máximo da escala.</>);
        return false;
      }
      if (minValue >= maxValue) {
        showError(<>O valor mínimo deve ser menor que o máximo.</>);
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
          <>As opções devem ser números dentro do intervalo da escala.</>,
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
      if (question) {
        formData.set("questionId", String(question.id));
      }
      setPendingFormData(formData);
      setPreviewDraft(buildPreviewDraft(formData));
      setStep(2);
      return;
    }

    if (!pendingFormData) {
      return;
    }

    startTransition(() => {
      if (isEditing) {
        updateFormAction(pendingFormData);
        return;
      }
      createFormAction(pendingFormData);
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
      title={isEditing ? "Editar questão" : "Criar questão"}
      confirmChildren={step === 1 ? <IconArrowForwardUp /> : <IconCheck />}
      cancelChildren={pageState === "FORM" ? <IconArrowBackUp /> : undefined}
      disableCancelButton={step === 1}
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
        {isFetchingQuestionUses && (
          <CLinearProgress label="Buscando usos da questão..." />
        )}

        {isEditing && !isFetchingQuestionUses && !!questionUses && (
          <QuestionUses questionUses={questionUses} />
        )}

        <div
          className={
            (
              !isPending &&
              pageState === "FORM" &&
              step === 1 &&
              !isFetchingQuestionUses
            ) ?
              ""
            : "hidden"
          }
        >
          <QuestionCreationFormStep
            categoryId={activeCategoryId}
            categoryName={activeCategoryName}
            subcategoryId={activeSubcategoryId ?? undefined}
            subcategoryName={activeSubcategoryName ?? undefined}
            title={title}
            notes={notes}
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
            isQuestionUsed={!!questionUses && questionUses?.numberOfForms > 0}
            onTitleChange={setTitle}
            onNotesChange={setNotes}
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
          {question && (
            <input type="hidden" name="questionId" value={question.id} />
          )}
        </div>

        <div
          className={
            !isPending && pageState === "FORM" && step === 2 ? "" : "hidden"
          }
        >
          {previewDraft && (
            <QuestionCreationPreviewStep
              draft={previewDraft}
              categoryName={activeCategoryName}
              subcategoryName={activeSubcategoryName ?? undefined}
            />
          )}
        </div>

        {pageState === "SUCCESS" && (
          <div className="flex flex-col items-center">
            <h5 className="text-center text-xl font-semibold">
              {isEditing ? "Questão editada!" : "Questão criada!"}
            </h5>
            <div className="flex justify-center">
              <IconCheck className="h-32 w-32 text-2xl text-green-500" />
            </div>
            {!isEditing && (
              <CButton onClick={resetModal}>Criar nova questão</CButton>
            )}
          </div>
        )}
      </div>
    </CDialog>
  );
};

export default QuestionCreation;
