"use client";

import { DrawingContext } from "@/app/admin/leaflet/elements/leafletProvider";
import { PolygonEditForm } from "@/app/admin/leaflet/elements/pseudo-elements/polygonEditForm";
import { addressResponse, localsResponse } from "@/app/types";
import { Select } from "@/components/ui/select";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useContext, useState } from "react";
import { Polygon, Popup, Tooltip, useMap } from "react-leaflet";

const FlySelection = ({ polygon }: { polygon: LatLngExpression[] }) => {
  const map = useMap();
  const park = L.polygon(polygon != undefined ? polygon : [{ lat: 0, lng: 0 }]);
  map.flyTo(park.getBounds().getCenter());

  park.remove();
  return null;
};

const EditPolygon = ({
  parkData,
  addressData,
}: {
  parkData: localsResponse[];
  addressData: addressResponse[];
}) => {
  const [polygon, setPolygon] = useState<LatLngExpression[]>();
  const { drawingContext } = useContext(DrawingContext);
  const [value, setValue] = useState(-1);

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

      <div className={"relative z-[10000]"}>
        <Select
          value={value}
          onBlur={(value) => {
            console.log(value.target.value);
            if (parseInt(value.target.value) != -1) {
              const temp = parkData
                .find(
                  (individualData) =>
                    individualData.id == parseInt(value.target.value),
                )
                ?.polygon.coordinates.map((value) => value);

              setPolygon(temp != undefined ? temp[0] : undefined);
            }

            setValue(parseInt(value.target.value));
          }}
          onFocus={() => {
            setValue(-1);
            setPolygon(undefined);
          }}
        >
          <option value={-1} />
          {parkData.map((value, index) => (
            <option key={index} value={value.id}>
              {value.name}
            </option>
          ))}
        </Select>
      </div>
      {polygon != undefined && !drawingContext && (
        <FlySelection polygon={polygon} />
      )}
    </div>
  );
};

export { EditPolygon };
