import { SelectedLocationObj } from "@/app/admin/export/client";
import CCheckbox from "@/components/ui/cCheckbox";
import CSwitch from "@/components/ui/cSwtich";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchAssessments } from "@/lib/serverFunctions/apiCalls/assessment";
import { useFetchTallys } from "@/lib/serverFunctions/apiCalls/tally";
import { FetchAssessmentsResponse } from "@/lib/serverFunctions/queries/assessment";
import { FetchTallysResponse } from "@/lib/serverFunctions/queries/tally";
import { Divider, LinearProgress } from "@mui/material";
import { IconCheck, IconClipboard, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";

type ListType = "ASSESSMENT" | "TALLY";
const listTypeOptions = [
  {
    value: "ASSESSMENT",
    label: "Avaliações",
  },
  {
    value: "TALLY",
    label: "Contagens",
  },
] as { value: ListType; label: string }[];
const LocationParamsDialog = ({
  open,
  onClose,
  location,
  handleSelectedLocationObjChange,
}: {
  open: boolean;
  onClose: () => void;
  location: SelectedLocationObj | null;
  handleSelectedLocationObjChange: (locationObj: SelectedLocationObj) => void;
}) => {
  const [fetchAssessments, loadingAssessments] = useFetchAssessments({
    callbacks: {
      onSuccess: (response) => {
        setAssessments(response.data?.assessments ?? []);
      },
    },
  });
  const [fetchTallys, loadingTallys] = useFetchTallys({
    callbacks: {
      onSuccess: (response) => {
        setTallys(response.data?.tallys ?? []);
      },
    },
  });
  const [localLocation, setLocalLocation] =
    useState<SelectedLocationObj | null>(location); // We first save the params here. Only after user confirms it is save in the main component.
  const [tallys, setTallys] = useState<FetchTallysResponse["tallys"]>();
  const [assessments, setAssessments] =
    useState<FetchAssessmentsResponse["assessments"]>();
  const [listType, setListType] = useState<ListType>("ASSESSMENT");
  useEffect(() => {
    if (!open || !location) return;
    void fetchAssessments({ locationId: location.id });
    void fetchTallys({ locationId: location.id });
    setLocalLocation(location);
  }, [location, open]);

  if (!location || !localLocation) return null;
  console.log(localLocation);
  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Itens para exportar"
      subtitle={location.name}
      confirmChildren={<IconCheck />}
      onConfirm={() => {
        handleSelectedLocationObjChange(localLocation);
        onClose();
      }}
      fullScreen
    >
      <div className="flex h-full flex-col gap-1">
        <h5>Dados Cadastrais</h5>
        <CSwitch
          label="Exportar dados cadastrais"
          checked={localLocation.exportRegistrationInfo}
          onChange={(e) => {
            setLocalLocation({
              ...localLocation,
              exportRegistrationInfo: e.target.checked,
            });
          }}
        />
        <CToggleButtonGroup
          value={listType}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          options={listTypeOptions}
          onChange={(_, v) => setListType(v.value)}
        />
        {(loadingAssessments || loadingTallys) && (
          <div className="flex w-full flex-col justify-center text-lg">
            <LinearProgress />
            Carregando dados...
          </div>
        )}
        <Divider />
        {listType === "TALLY" && (
          <Virtuoso
            data={tallys}
            style={{ height: "100%", width: "100%" }}
            itemContent={(_, t) => (
              <div className="pb-4">
                <div
                  key={t.id}
                  className="flex flex-row items-center bg-gray-200 p-2 px-2 shadow-xl"
                >
                  <CCheckbox
                    checked={localLocation.tallysIds.includes(t.id)}
                    onChange={(e) => {
                      setLocalLocation((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          tallysIds:
                            e.target.checked ?
                              [...prev.tallysIds, t.id]
                            : prev.tallysIds.filter((id) => id !== t.id),
                        };
                      });
                    }}
                  />
                  <div className="flex w-full flex-row items-center justify-between">
                    <span>{`${dateTimeFormatter.format(new Date(t.startDate))} - ${t.endDate ? dateTimeFormatter.format(new Date(t.endDate)) : "Sem data final!"}`}</span>
                    <span className="flex">
                      <IconUser />
                      {t.user.username}
                    </span>
                  </div>
                </div>
              </div>
            )}
          />
        )}
        {listType === "ASSESSMENT" && (
          <Virtuoso
            data={assessments}
            style={{ height: "100%", width: "100%" }}
            itemContent={(_, a) => (
              <div className="pb-4">
                <div
                  key={a.id}
                  className="flex flex-row items-center bg-gray-200 p-2 px-2 shadow-xl"
                >
                  <CCheckbox />
                  <div className="flex flex-col gap-1">
                    <span>{`${dateTimeFormatter.format(new Date(a.startDate))} - ${a.endDate ? dateTimeFormatter.format(new Date(a.endDate)) : "Sem data final!"}`}</span>
                    <span>
                      <IconClipboard />
                      {a.form.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </CDialog>
  );
};

export default LocationParamsDialog;
