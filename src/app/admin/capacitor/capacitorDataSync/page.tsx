"use client";

import CitySelector from "@/components/citySelector/citySelector";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import { adminSQLiteDbDataSync } from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { fetchAdminSQLiteLastSync } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/lastSync";
import { fetchPendencies } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/pendencies";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchSQLiteSyncData } from "@/lib/serverFunctions/apiCalls/sqliteSync";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { Chip } from "@mui/material";
import {
  IconBuilding,
  IconCalendarClock,
  IconDownload,
  IconListCheck,
  IconWifiOff,
} from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

const CapacitorDataSync = () => {
  const { setLoadingOverlay } = useLoadingOverlay();
  const { isConnected } = useNetwork();
  const [fetchData] = useFetchSQLiteSyncData();
  const [sqliteMetaData, setSqliteMetaData] = useState<{
    lastSync: Date;
    cityId: number;
    cityName: string;
  }>();
  const [pendencies, setPendencies] = useState<{
    assessments: number;
  } | null>();

  const [selectedCity, setSelectedCity] = useState<
    FetchCitiesResponse["cities"][number] | null
  >(null);

  const loadSqliteMetaData = async () => {
    const data = await fetchAdminSQLiteLastSync();
    if (!data.data.lastSync) return;
    const { lastSync } = data.data;
    setSqliteMetaData({
      lastSync: lastSync.timestamp,
      cityId: lastSync.cityId,
      cityName: lastSync.cityName,
    });
  };

  const loadPendencies = async () => {
    const response = await fetchPendencies({});
    if (response.responseInfo.statusCode !== 200 || !response.data) {
      enqueueSnackbar(
        response.responseInfo.message ??
          "Erro ao consultar pendências no dispositivo!",
        { variant: "error" },
      );
      setPendencies({ assessments: 0 });
      return;
    }
    setPendencies(response.data.assessments > 0 ? response.data : null);
  };

  const syncData = async () => {
    try {
      if (!selectedCity) return;
      setLoadingOverlay({ show: true, message: "Baixando dados..." });
      const response = await fetchData({
        params: {
          cityId: selectedCity.id,
        },
      });
      if (!response.data) return;
      await adminSQLiteDbDataSync({
        data: response.data,
        selectedCity: selectedCity,
      });
      await loadSqliteMetaData();
      enqueueSnackbar(<>Dados sincronizados com sucesso!</>, {
        variant: "success",
      });
    } catch (e) {
      enqueueSnackbar(<>Erro ao sincronizar dados!</>, { variant: "error" });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  useEffect(() => {
    void loadSqliteMetaData();
    void loadPendencies();
  }, []);

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader titleIcon={<IconWifiOff />} title="Uso offline" />
      <div className="flex h-full flex-col gap-1 overflow-auto">
        <p className="text-lg">
          Prepare o aplicativo para realizar avaliações offline
        </p>

        {sqliteMetaData && (
          <div className="flex flex-col rounded-md bg-gray-400 p-2 text-white">
            <div className="font-semibold">Última sincronização</div>
            <div className="flex items-center">
              <IconCalendarClock />
              {dateTimeFormatter.format(sqliteMetaData.lastSync)}
            </div>
            <div className="flex items-center">
              <IconBuilding />
              {sqliteMetaData.cityName}
            </div>
          </div>
        )}
        <div></div>
        <CitySelector
          selectedCity={selectedCity}
          fetchCitiesParams={{
            noEmptyLocations: true,
          }}
          onSelectedCityChange={(e) => {
            setSelectedCity(e);
          }}
        />
        <CButton
          onClick={() => {
            void syncData();
          }}
          disabled={!isConnected || pendencies !== null}
        >
          <IconDownload />
          Baixar dados
        </CButton>
        {pendencies && (
          <>
            <p>Envie todas as pendências para receber novos dados</p>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Pendências a enviar:</span>
              <Chip
                icon={<IconListCheck />}
                label={`Avaliações: ${pendencies.assessments}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CapacitorDataSync;
