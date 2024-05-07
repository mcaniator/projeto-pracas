"use client";

import { Button } from "@/components/ui/old-button";
import { IconLocationPin } from "@tabler/icons-react";
import { useMap } from "react-leaflet";
import Control from "react-leaflet-custom-control";

const CenterButton = () => {
  const map = useMap();

  return (
    <div>
      <Control position={"bottomleft"}>
        <Button
          variant={"admin"}
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                map.flyTo({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                });
              },
              null,
              {
                enableHighAccuracy: false,
                maximumAge: Infinity,
                timeout: 60000,
              },
            );
          }}
          size={"icon"}
          className={"text-white"}
          name={"Center on user"}
        >
          <IconLocationPin />
        </Button>
      </Control>
    </div>
  );
};

export { CenterButton };
