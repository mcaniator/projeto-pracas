"use client";

import { useUserContext } from "@/components/context/UserContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  type BehavioralMapDraft,
  type BehavioralMapDraftValues,
  deleteBehavioralMapDraft,
  fetchBehavioralMapDraft,
  saveBehavioralMapDraft,
} from "./behavioralMapDraft";

const useBehavioralMapDraft = ({
  behavioralMapId,
  ownerId,
  savedUpdatedAt,
  values,
  onRestore,
}: {
  behavioralMapId: number;
  ownerId: string;
  savedUpdatedAt: Date;
  values: BehavioralMapDraftValues;
  onRestore: (values: BehavioralMapDraftValues) => void;
}) => {
  const { user } = useUserContext();
  const { setLoadingOverlay } = useLoadingOverlay();
  const userCanEdit =
    ownerId === user.id || user.roles.includes("TALLY_MANAGER");
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<Date>();
  const [savedVersionUpdatedAt, setSavedVersionUpdatedAt] =
    useState(savedUpdatedAt);
  const [pendingDraftChoice, setPendingDraftChoice] =
    useState<BehavioralMapDraft>();
  const savedUpdatedAtRef = useRef(savedUpdatedAt);
  const savedValuesRef = useRef(values);
  const previousValuesRef = useRef(values);
  const restoringDraftRef = useRef(false);
  const draftSaveTimeoutRef = useRef<number | undefined>(undefined);
  const pendingDraftRef = useRef<BehavioralMapDraft | undefined>(undefined);
  const draftWriteRef = useRef(Promise.resolve());

  const flushDraftSave = useCallback(() => {
    window.clearTimeout(draftSaveTimeoutRef.current);
    const draft = pendingDraftRef.current;
    pendingDraftRef.current = undefined;
    if (!draft) return;
    draftWriteRef.current = draftWriteRef.current
      .then(() => saveBehavioralMapDraft(draft))
      .catch(() => {
        enqueueSnackbar("Erro ao salvar o rascunho do mapa comportamental!", {
          variant: "error",
        });
      });
  }, []);

  const scheduleDraftSave = useCallback(
    (nextValues: BehavioralMapDraftValues) => {
      if (!userCanEdit || !isDraftLoaded || pendingDraftChoice) return;
      const updatedAt = new Date();
      pendingDraftRef.current = {
        ...nextValues,
        id: behavioralMapId,
        userId: user.id,
        username: user.username,
        savedUpdatedAt: savedUpdatedAtRef.current,
        draftUpdatedAt: updatedAt,
      };
      setDraftUpdatedAt(updatedAt);
      window.clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = window.setTimeout(flushDraftSave, 500);
    },
    [
      behavioralMapId,
      flushDraftSave,
      isDraftLoaded,
      pendingDraftChoice,
      user.id,
      user.username,
      userCanEdit,
    ],
  );

  const clearDraft = useCallback(async () => {
    window.clearTimeout(draftSaveTimeoutRef.current);
    const pendingDraft = pendingDraftRef.current;
    pendingDraftRef.current = undefined;
    try {
      await draftWriteRef.current;
      await deleteBehavioralMapDraft(behavioralMapId);
      setDraftUpdatedAt(undefined);
      return true;
    } catch {
      if (pendingDraft && !pendingDraftRef.current) {
        pendingDraftRef.current = pendingDraft;
        flushDraftSave();
      }
      enqueueSnackbar("Erro ao excluir o rascunho do mapa comportamental!", {
        variant: "error",
      });
      return false;
    }
  }, [behavioralMapId, flushDraftSave]);

  const markSaved = useCallback(
    async (updatedAt: Date, savedValues: BehavioralMapDraftValues) => {
      savedValuesRef.current = savedValues;
      savedUpdatedAtRef.current = updatedAt;
      setSavedVersionUpdatedAt(updatedAt);
      await clearDraft();
    },
    [clearDraft],
  );

  const applyDraft = useCallback(
    (draft: BehavioralMapDraft) => {
      restoringDraftRef.current = true;
      onRestore(draft);
      setDraftUpdatedAt(draft.draftUpdatedAt);
      setPendingDraftChoice(undefined);
    },
    [onRestore],
  );

  const applySavedVersion = useCallback(async () => {
    setLoadingOverlay({ show: true, message: "Carregando..." });
    try {
      if (!(await clearDraft())) return false;
      restoringDraftRef.current = true;
      onRestore(savedValuesRef.current);
      setPendingDraftChoice(undefined);
      return true;
    } finally {
      setLoadingOverlay({ show: false });
    }
  }, [clearDraft, onRestore, setLoadingOverlay]);

  useEffect(() => {
    if (previousValuesRef.current === values) return;
    previousValuesRef.current = values;
    if (restoringDraftRef.current) {
      restoringDraftRef.current = false;
      return;
    }
    scheduleDraftSave(values);
  }, [scheduleDraftSave, values]);

  useEffect(() => {
    if (!userCanEdit) {
      setIsDraftLoaded(true);
      return;
    }
    let ignore = false;
    const loadDraft = async () => {
      setLoadingOverlay({ show: true, message: "Carregando dados locais..." });
      try {
        const draft = await fetchBehavioralMapDraft(behavioralMapId);
        if (ignore || !draft) return;
        if (savedUpdatedAt.getTime() <= draft.savedUpdatedAt.getTime()) {
          applyDraft(draft);
        } else {
          setPendingDraftChoice(draft);
        }
      } catch {
        if (!ignore) {
          enqueueSnackbar("Erro ao carregar dados locais!", { variant: "error" });
        }
      } finally {
        if (!ignore) {
          setIsDraftLoaded(true);
          setLoadingOverlay({ show: false });
        }
      }
    };
    void loadDraft();
    return () => {
      ignore = true;
      setLoadingOverlay({ show: false });
    };
  }, [
    applyDraft,
    behavioralMapId,
    savedUpdatedAt,
    setLoadingOverlay,
    userCanEdit,
  ]);

  useEffect(() => {
    window.addEventListener("pagehide", flushDraftSave);
    return () => {
      window.removeEventListener("pagehide", flushDraftSave);
      flushDraftSave();
    };
  }, [flushDraftSave]);

  return {
    isDraftLoaded,
    draftUpdatedAt,
    savedVersionUpdatedAt,
    pendingDraftChoice,
    applyDraft,
    applySavedVersion,
    scheduleDraftSave,
    clearDraft,
    markSaved,
  };
};

export default useBehavioralMapDraft;
