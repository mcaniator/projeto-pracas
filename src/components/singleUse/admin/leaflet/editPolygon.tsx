"use client";

import { DrawingContext } from "@/components/singleUse/admin/leaflet/leafletProvider";
import { PolygonEditForm } from "@/components/singleUse/admin/leaflet/polygonEditForm";
import { Select } from "@/components/ui/select";
import type { addresses, locals } from "@prisma/client";
import L, { LatLngExpression } from "leaflet";
import { useContext, useState } from "react";
import { Polygon, Popup, Tooltip, useMap } from "react-leaflet";
import Control from "react-leaflet-custom-control";

interface localsPolygon extends locals {
  polygon: [number, number][];
}

const EditPolygon = ({ parkData, addressData }: { parkData: localsPolygon[]; addressData: addresses[] }) => {
  const [polygon, setPolygon] = useState<LatLngExpression[]>();
  const { drawingContext } = useContext(DrawingContext);
  const [value, setValue] = useState(-1);

  const FlySelection = ({ polygon }: { polygon: LatLngExpression[] }) => {
    const map = useMap();
    const park = L.polygon(polygon != undefined ? polygon : [{ lat: 0, lng: 0 }]);
    map.flyTo(park.getBounds().getCenter());

    park.remove();

    setPolygon(undefined);
    setValue(-1);
    return null;
  };

  return (
    <div>
      {parkData.map((value, index) => (
        <div key={index}>
          <Polygon positions={value.polygon as LatLngExpression[]} color={"#8FBC94"}>
            {!drawingContext && (
              <Popup>
                <PolygonEditForm parkData={value} addressData={addressData.filter((aux) => aux.locals_id == value.id)} />
              </Popup>
            )}

            <Tooltip className={"bg-blue-800to"} permanent>
              {value.name}
            </Tooltip>
          </Polygon>
        </div>
      ))}

      <Control position={"topright"}>
        {!drawingContext && (
          <Select
            value={value}
            onChange={(value) => {
              if (parseInt(value.target.value) != -1) {
                const temp = parkData.find((individualData) => individualData.id == parseInt(value.target.value))?.polygon.map((value) => value);

                setPolygon(temp != undefined ? (temp as LatLngExpression[]) : undefined);
              }

              setValue(parseInt(value.target.value));
            }}
          >
            <option value={-1} />
            {parkData.map((value, index) => (
              <option key={index} value={value.id}>
                {value.name}
              </option>
            ))}
          </Select>
        )}
      </Control>
      {polygon != undefined && !drawingContext && <FlySelection polygon={polygon} />}
    </div>
  );
};

export { EditPolygon };
