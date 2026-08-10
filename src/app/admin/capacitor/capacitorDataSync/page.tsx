"use client";

import CitySelector from "@/components/citySelector/citySelector";
import { useUserContext } from "@/components/context/UserContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { fetchAdminSQLiteLastSync } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/lastSync";
import { SQLiteBulkInsertOperation } from "@/lib/capacitor/sqlite/sqlite";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchSQLiteSyncData } from "@/lib/serverFunctions/apiCalls/sqliteSync";
import { FetchCitiesResponse } from "@/lib/serverFunctions/queries/city";
import { Capacitor } from "@capacitor/core";
import {
  IconBuilding,
  IconCalendarClock,
  IconDownload,
  IconWifiOff,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

const CapacitorDataSync = () => {
  const { user } = useUserContext();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [fetchData] = useFetchSQLiteSyncData();
  const { isConnected, setNetworkStatus, setServerOnline } = useNetwork();
  const [sqliteMetaData, setSqliteMetaData] = useState<{
    lastSync: Date;
    cityId: number;
    cityName: string;
  }>();

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

  const syncData = async () => {
    if (!selectedCity) return;
    setLoadingOverlay({ show: true, message: "Baixando dados..." });
    const response = await fetchData({
      params: {
        cityId: selectedCity.id,
        userId: user.id,
      },
    });
    if (!response.data) return;
    await adminSQLiteDb.clear();
    const {
      currentUser,
      city,
      narrowAdministrativeUnits,
      intermediateAdministrativeUnits,
      broadAdministrativeUnits,
      locationCategory,
      locationType,
      locations,
    } = response.data;
    const bulkInserts: SQLiteBulkInsertOperation[] = [
      {
        table: "last_sync",
        columns: ["timestamp", "city_id", "city_name"],
        rows: [[new Date(), selectedCity.id, selectedCity.name]],
      },
      {
        table: "user",
        columns: [
          "id",
          "name",
          "email",
          "emailVerified",
          "image",
          "username",
          "roles",
          "active",
          "created_at",
          "updated_at",
        ],
        rows: [
          [
            currentUser.id,
            currentUser.name,
            currentUser.email,
            currentUser.emailVerified,
            currentUser.image,
            currentUser.username,
            JSON.stringify(currentUser.roles),
            currentUser.active,
            currentUser.createdAt,
            currentUser.updatedAt,
          ],
        ],
      },
      {
        table: "city",
        columns: [
          "id",
          "name",
          "state",
          "narrow_administrative_unit_title",
          "intermediate_administrative_unit_title",
          "broad_administrative_unit_title",
          "created_at",
          "updated_at",
        ],
        rows: [
          [
            city.id,
            city.name,
            city.state,
            city.narrowAdministrativeUnitTitle,
            city.intermediateAdministrativeUnitTitle,
            city.broadAdministrativeUnitTitle,
            city.createdAt,
            city.updatedAt,
          ],
        ],
      },
      {
        table: "location_category",
        columns: ["id", "name"],
        rows: locationCategory.map((item) => [item.id, item.name]),
      },
      {
        table: "location_type",
        columns: ["id", "name"],
        rows: locationType.map((item) => [item.id, item.name]),
      },
      {
        table: "narrow_administrative_unit",
        columns: ["id", "name", "city_id"],
        rows: narrowAdministrativeUnits.map((item) => [
          item.id,
          item.name,
          item.cityId,
        ]),
      },
      {
        table: "intermediate_administrative_unit",
        columns: ["id", "name", "city_id"],
        rows: intermediateAdministrativeUnits.map((item) => [
          item.id,
          item.name,
          item.cityId,
        ]),
      },
      {
        table: "broad_administrative_unit",
        columns: ["id", "name", "city_id"],
        rows: broadAdministrativeUnits.map((item) => [
          item.id,
          item.name,
          item.cityId,
        ]),
      },
      {
        table: "location",
        columns: [
          "id",
          "name",
          "popular_name",
          "first_street",
          "second_street",
          "third_street",
          "fourth_street",
          "notes",
          "city_id",
          "creation_year",
          "last_maintenance_year",
          "legislation",
          "usable_area",
          "legal_area",
          "incline",
          "is_park",
          "inactive_not_found",
          "polygon_area",
          "type_id",
          "category_id",
          "polygon",
          "is_public",
          "main_image_id",
          "narrow_administrative_unit_id",
          "intermediate_administrative_unit_id",
          "broad_administrative_unit_id",
          "created_at",
          "updated_at",
        ],
        rows: locations.map((item) => [
          item.id,
          item.name,
          item.popularName,
          item.firstStreet,
          item.secondStreet,
          item.thirdStreet,
          item.fourthStreet,
          item.notes,
          item.cityId,
          item.creationYear,
          item.lastMaintenanceYear,
          item.legislation,
          item.usableArea,
          item.legalArea,
          item.incline,
          item.isPark,
          item.inactiveNotFound,
          item.polygonArea,
          item.typeId,
          item.categoryId,
          item.polygon,
          item.isPublic,
          item.mainImageId,
          item.narrowAdministrativeUnitId,
          item.intermediateAdministrativeUnitId,
          item.broadAdministrativeUnitId,
          item.createdAt,
          item.updatedAt,
        ]),
      },
    ];

    await adminSQLiteDb.executeBulkInsertTransaction(bulkInserts);

    await loadSqliteMetaData();
  };

  useEffect(() => {
    void loadSqliteMetaData();
  }, []);
  const debugEnabled = useMemo(() => {
    return process.env.NEXT_PUBLIC_DEBUG === "true";
  }, []);
  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader titleIcon={<IconWifiOff />} title="Uso offline" />
      <div className="flex h-full flex-col gap-1 overflow-auto">
        <p className="text-lg">
          Prepare o aplicativo para realizar avaliações offline
        </p>
        {debugEnabled && Capacitor.isNativePlatform() && (
          <CButton
            onClick={() => {
              setNetworkStatus(!isConnected);
              setServerOnline(!isConnected);
            }}
          >
            {isConnected ?
              "(Debug) Ativar modo offline"
            : "(Debug) Desativar modo offline"}
          </CButton>
        )}

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
        >
          <IconDownload />
          Baixar dados
        </CButton>
      </div>
    </div>
  );
};

export default CapacitorDataSync;
