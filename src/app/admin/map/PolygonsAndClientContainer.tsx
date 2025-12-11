"use client";

import { useLoadingOverlay } from "@components/context/loadingContext";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import PermissionGuard from "../../../components/auth/permissionGuard";
import CButton from "../../../components/ui/cButton";
import { _fetchLocations } from "../../../lib/serverFunctions/apiCalls/location";
import { FetchLocationsResponse } from "../../../lib/serverFunctions/queries/location";
import { APIResponseInfo } from "../../../lib/types/backendCalls/APIResponse";
import PolygonProvider from "./polygonProvider";
import RegisterMenu from "./register/registerMenu";
import Sidebar from "./sidebar/sidebar";

const PolygonsAndClientContainer = () => {
  //const locationsWithPolygon = use(locationsWithPolygonPromise);
  const { setLoadingOverlay } = useLoadingOverlay();
  const [locationsWithPolygon, setLocationsWithPolygon] = useState<{
    locations: FetchLocationsResponse["locations"];
    responseInfo: APIResponseInfo;
  }>({ locations: [], responseInfo: { statusCode: 0 } });

  const [isCreating, setIsCreating] = useState(false);

  const fetchLocations = useCallback(async () => {
    setLoadingOverlay({ show: true, message: "Carregando praças..." });
    const locationsResponse = await _fetchLocations({ cityId: 1 });
    setLocationsWithPolygon({
      locations: locationsResponse.data?.locations ?? [],
      responseInfo: locationsResponse.responseInfo,
    });
    setLoadingOverlay({ show: false });
  }, [setLoadingOverlay]);

  useEffect(() => {
    void fetchLocations();
  }, [setLoadingOverlay, fetchLocations]);

  return (
    <PolygonProvider
      fullLocations={locationsWithPolygon.locations}
      fetchLocationsResponseInfo={locationsWithPolygon.responseInfo}
    >
      <div
        className={`absolute bottom-0 top-0 z-50 w-fit overflow-auto pr-4 transition-all duration-300 ease-in-out ${!isCreating ? "translate-x-0" : `pointer-events-none -translate-x-full`} `}
      >
        <div className="flex max-h-full w-fit justify-between overflow-auto p-4">
          <Sidebar />
        </div>
      </div>

      <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
        {!isCreating && (
          <div className="absolute bottom-4 right-4 top-4 z-50 h-fit w-fit overflow-auto pr-4">
            <div>
              <CButton
                onClick={() => {
                  setIsCreating((prev) => !prev);
                }}
              >
                <IconPlus /> Cadastrar praça
              </CButton>
            </div>
          </div>
        )}
      </PermissionGuard>
      <PermissionGuard requiresAnyRoles={["PARK_MANAGER"]}>
        <div
          className={`absolute bottom-0 right-0 top-0 z-50 h-fit max-h-full w-fit overflow-auto transition-all duration-300 ease-in-out ${isCreating ? "translate-x-0" : `pointer-events-none translate-x-full`} `}
        >
          <div className="flex max-h-full w-fit justify-between overflow-auto p-4">
            <RegisterMenu
              close={() => {
                setIsCreating(false);
              }}
              reloadLocations={() => {
                void fetchLocations();
              }}
            />
          </div>
        </div>
      </PermissionGuard>
    </PolygonProvider>
  );
};

export default PolygonsAndClientContainer;
