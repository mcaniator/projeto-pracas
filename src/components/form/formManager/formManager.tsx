"use client";

import PermissionGuard from "@/components/auth/permissionGuard";
import { useNetwork } from "@/components/context/networkContext";
import CCircularProgress from "@/components/ui/CCircularProgress";
import CAccordion from "@/components/ui/accordion/CAccordion";
import CAccordionDetails from "@/components/ui/accordion/CAccordionDetails";
import CAccordionSummary from "@/components/ui/accordion/CAccordionSummary";
import CButton from "@/components/ui/cButton";
import CChip from "@/components/ui/cChip";
import CDialog from "@/components/ui/dialog/cDialog";
import CMenu from "@/components/ui/menu/cMenu";
import { dateTimeWithoutSecondsFormater } from "@/lib/formatters/dateFormatters";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import {
  useFetchFormStructure,
  useFetchForms,
} from "@/lib/serverFunctions/apiCalls/form";
import {
  FetchFormsResponse,
  fetchFormStructureResponse,
} from "@/lib/serverFunctions/queries/form";
import { Chip, Radio, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { FormUse } from "@prisma/client";
import {
  IconCopy,
  IconEye,
  IconPencil,
  IconPlus,
  IconTrashX,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaTrashRestore } from "react-icons/fa";

import FormEditor from "../formEditor";
import { buildFormPreviewSubmission } from "../formPreviewUtils";
import FormArchiveDialog from "./formArchiveDialog";
import FormCreationDialog from "./formCreationDialog";

const ResponseFormV2 = dynamic(
  () => import("@/components/ui/responseForm/responseFormV2"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <CCircularProgress label="Carregando prévia..." />
      </div>
    ),
  },
);

type FormRow = FetchFormsResponse["forms"][number];

const FormManager = ({
  formUse,
  title,
  value,
  onValueChange,
  enablePreview = false,
}: {
  formUse: FormUse;
  title?: string;
  value?: number | null;
  onValueChange?: (value: FormRow | null) => void;
  enablePreview?: boolean;
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useAppSnackbar();
  const { isConnected } = useNetwork();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const [_fetchForms, loading] = useFetchForms({
    callbacks: {
      onSuccess: ({ data }) => {
        if (data) {
          setForms(data.forms);
        }
      },
    },
  });
  const [fetchFormStructure, isPreviewLoading] = useFetchFormStructure({
    callbacks: {
      onSuccess: ({ data }) => {
        setPreviewFormStructure(data?.formStructure);
      },
      onError: () => {
        setPreviewFormStructure(undefined);
      },
    },
  });

  const loadForms = useCallback(
    ({ invalidateCache }: { invalidateCache?: boolean } = {}) => {
      void _fetchForms({
        params: { formUse, includeArchived: true },
        requestOptions: {
          cache: invalidateCache ? "reload" : "default",
        },
      });
    },
    [_fetchForms, formUse],
  );

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const [forms, setForms] = useState<FetchFormsResponse["forms"]>([]);
  const [previewFormStructure, setPreviewFormStructure] =
    useState<fetchFormStructureResponse["formStructure"]>();
  const [openFormCreationDialog, setOpenFormCreationDialog] = useState(false);
  const [openFormArchiveDialog, setOpenFormArchiveDialog] = useState(false);
  const [openFormEditorDialog, setOpenFormEditorDialog] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number>();
  const [needsListReload, setNeedsListReload] = useState(false);
  const [selectedForm, setSelectedForm] = useState<{
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }>();
  const isFormSelectionEnabled = value !== undefined;
  const previewFormSubmission = useMemo(
    () =>
      previewFormStructure ?
        buildFormPreviewSubmission({ formStructure: previewFormStructure })
      : undefined,
    [previewFormStructure],
  );
  const selectedFormValue = useMemo(
    () => forms.find((form) => form.id === value),
    [forms, value],
  );

  useEffect(() => {
    setPreviewFormStructure(undefined);

    if (!enablePreview || value === undefined || value === null) {
      return;
    }

    void fetchFormStructure({ params: { formId: value } });
  }, [enablePreview, fetchFormStructure, value]);

  useEffect(() => {
    if (openFormEditorDialog || !needsListReload) return;

    loadForms({ invalidateCache: true });
    setNeedsListReload(false);
  }, [loadForms, needsListReload, openFormEditorDialog]);

  const handleClone = (cloneForm: {
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }) => {
    setSelectedForm(cloneForm);
    setOpenFormCreationDialog(true);
  };

  const handleArchive = (formToArchive: {
    id: number;
    name: string;
    archived: boolean;
    finalized: boolean;
  }) => {
    setSelectedForm(formToArchive);
    setOpenFormArchiveDialog(true);
  };

  const handleOpenFormEditor = (formId: number) => {
    setSelectedFormId(formId);
    setOpenFormEditorDialog(true);
  };

  const handleCloseFormEditor = () => {
    setOpenFormEditorDialog(false);
  };

  const columns: GridColDef<FormRow>[] = [
    {
      field: "Ações",
      headerName: "",
      width: isFormSelectionEnabled ? 130 : 80,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <div className="flex h-full items-center">
          {isFormSelectionEnabled && (
            <Radio
              checked={params.row.id === value}
              inputProps={{
                "aria-label": `Selecionar formulário ${params.row.name}`,
              }}
              onChange={() => {
                if (params.row.archived) {
                  enqueueSnackbar(
                    "Não é possível selecionar um formulário arquivado!",
                    { variant: "error" },
                  );
                  return;
                }
                if (!params.row.finalized) {
                  enqueueSnackbar(
                    "Não é possível selecionar um formulário em construção!",
                    { variant: "error" },
                  );
                  return;
                }
                if (params.row.id !== value) {
                  onValueChange?.(params.row);
                }
              }}
            />
          )}
          <CMenu
            options={[
              {
                label:
                  params.row.finalized ?
                    <div className="flex items-center">
                      <IconEye />
                      Ver
                    </div>
                  : <div className="flex items-center">
                      <IconPencil />
                      Editar
                    </div>,
                onClick: () => handleOpenFormEditor(params.row.id),
              },
              {
                label: (
                  <div className="flex items-center">
                    <IconCopy />
                    Clonar
                  </div>
                ),
                disabled: !isConnected,
                onClick: () => {
                  handleClone({
                    id: params.row.id,
                    name: params.row.name,
                    archived: params.row.archived,
                    finalized: params.row.finalized,
                  });
                },
              },
              {
                label: (
                  <div className="flex items-center">
                    {params.row.archived ?
                      <>
                        <FaTrashRestore /> Restaurar
                      </>
                    : <>
                        <IconTrashX />
                        Excluir
                      </>
                    }
                  </div>
                ),
                disabled: !isConnected || params.row.id === value,
                sx: {
                  color: "red",
                },
                onClick: () => {
                  handleArchive({
                    id: params.row.id,
                    name: params.row.name,
                    archived: params.row.archived,
                    finalized: params.row.finalized,
                  });
                },
              },
            ]}
          />
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      valueGetter: (value, row) =>
        row.archived ? "Arquivado"
        : row.finalized ? "Finalizado"
        : "Em construção",
      renderCell: (params: GridRenderCellParams<FormRow>) => (
        <Chip
          sx={{ width: "120px" }}
          color={
            params.row.archived ? "error"
            : params.row.finalized ?
              "primary"
            : "info"
          }
          label={
            params.row.archived ? "Arquivado"
            : params.row.finalized ?
              "Finalizado"
            : "Em construção"
          }
        />
      ),
    },
    {
      field: "usageCount",
      headerName: "Usos",
      width: 100,
      align: "center",
      renderCell: (params: GridRenderCellParams<FormRow>) =>
        params.row.usageCount,
    },
    {
      field: "updatedAt",
      headerName: "Última edição",
      width: 180,
      renderCell: (params: GridRenderCellParams<FormRow>) =>
        dateTimeWithoutSecondsFormater.format(params.row.updatedAt),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        className={`flex items-center gap-2 ${title ? "justify-between" : "justify-end"}`}
      >
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        <PermissionGuard requiresAnyRoles={["PROTOCOL_MANAGER"]}>
          <CButton
            square={isMobileView}
            disabled={!isConnected}
            tooltip={isConnected ? "" : "Conecte-se para criar um formulário"}
            onClick={() => {
              setSelectedForm(undefined);
              setOpenFormCreationDialog(true);
            }}
          >
            <IconPlus /> {isMobileView ? "" : "Criar"}
          </CButton>
        </PermissionGuard>
      </div>

      <DataGrid
        className="min-h-0 flex-1"
        loading={loading}
        rows={forms}
        columns={columns}
        autoHeight={false}
        rowSelection={false}
      />

      {isFormSelectionEnabled && (
        <div className="flex items-center gap-2">
          <span>Selecionado:</span>
          {selectedFormValue && onValueChange ?
            <CChip
              label={selectedFormValue.name}
              onDelete={() => onValueChange(null)}
            />
          : <span className="text-gray-500">Nenhum</span>}
        </div>
      )}

      {enablePreview && value !== undefined && value !== null && (
        <CAccordion>
          <CAccordionSummary>
            Prévia de preenchimento de formulário
          </CAccordionSummary>
          <CAccordionDetails>
            <div className="h-[500px] min-h-0">
              {isPreviewLoading && (
                <div className="flex h-full items-center justify-center">
                  <CCircularProgress label="Carregando prévia..." />
                </div>
              )}
              {!isPreviewLoading && previewFormSubmission && (
                <ResponseFormV2
                  key={previewFormSubmission.formStructure.formId}
                  formSubmission={previewFormSubmission}
                  geometries={[]}
                  responseImages={{}}
                  readOnly={false}
                  onGeometriesChange={() => undefined}
                  onImagesChange={() => undefined}
                />
              )}
            </div>
          </CAccordionDetails>
        </CAccordion>
      )}

      <CDialog
        title="Formulário"
        fullScreen
        disableDialogActions
        open={openFormEditorDialog}
        onClose={handleCloseFormEditor}
      >
        {selectedFormId !== undefined && (
          <FormEditor
            formId={selectedFormId}
            formUse={formUse}
            onSave={(finalized) => {
              setNeedsListReload(true);
              if (finalized) setOpenFormEditorDialog(false);
            }}
          />
        )}
      </CDialog>

      <FormCreationDialog
        open={openFormCreationDialog}
        formUse={formUse}
        cloneForm={selectedForm}
        reloadForms={() => {
          loadForms({ invalidateCache: true });
        }}
        onClose={() => setOpenFormCreationDialog(false)}
      />
      <FormArchiveDialog
        open={openFormArchiveDialog}
        onClose={() => setOpenFormArchiveDialog(false)}
        reloadForms={() => {
          loadForms({ invalidateCache: true });
        }}
        formToArchive={selectedForm}
      />
    </div>
  );
};

export default FormManager;
