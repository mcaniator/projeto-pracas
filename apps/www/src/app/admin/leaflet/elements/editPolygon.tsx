"use client";

import { DrawingContext } from "@/app/admin/leaflet/elements/leafletProvider";
import { PolygonEditForm } from "@/app/admin/leaflet/elements/pseudo-elements/polygonEditForm";
import { addressResponse, localsResponse } from "@/app/types";
import { useContext } from "react";
import { Polygon, Popup, Tooltip } from "react-leaflet";

const EditPolygon = ({
  parkData,
  addressData,
}: {
  parkData: localsResponse[];
  addressData: addressResponse[];
}) => {
  const { drawingContext } = useContext(DrawingContext);

  return (
    <div>
      {parkData.map((value, index) => (
        <div key={index}>
          {value.polygon.coordinates.map((positions, key) => (
            <Polygon key={key} positions={positions} color={"#8FBC94"}>
              {!drawingContext && (
                <Popup>
                  <PolygonEditForm
                    polygonID={value.id}
                    parkData={value}
                    addressData={addressData}
                  />
                </Popup>
              )}

              <Tooltip className={"bg-blue-800to"} permanent>
                {value.name}
              </Tooltip>
            </Polygon>
          ))}
        </div>
      ))}
    </div>
  );
};

export { EditPolygon };
