"use client";

import { useHelperCard } from "@/components/context/helperCardContext";
import { ResponseGeometry } from "@customTypes/assessments/geometry";
import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { Point, Polygon } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { createContext, useEffect, useMemo, useRef } from "react";

const MapContext = createContext(new Map());

const MapProvider = ({
  initialGeometries,
}: {
  initialGeometries: ResponseGeometry[] | undefined;
}) => {
  useGeographic();
  const { setHelperCard } = useHelperCard();
  const vectorSource = useRef<VectorSource>(new VectorSource());

  const mapRef = useRef<HTMLDivElement>(null);

  const styleFunction = () => {
    const style = new Style({
      fill: new Fill({
        color: "#9B59B24D",
      }),
      stroke: new Stroke({
        color: "#7C4091",
        lineCap: "butt",
        width: 3,
      }),
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: "#9B59B24D" }),
        stroke: new Stroke({ color: "#7C4091", width: 3 }),
      }),
    });

    return style;
  };

  const map = useMemo(() => {
    const vectorLayer = new VectorLayer({
      source: vectorSource.current,
      style: styleFunction,
    });

    return new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      controls: [],
    });
  }, []);
  const view = map.getView();
  useEffect(() => {
    if (mapRef.current !== null) map.setTarget(mapRef.current);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        view.animate({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 16,
          duration: 0,
        });
      },
      () => {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao obter sua localização!</>,
        });
      },
      {
        enableHighAccuracy: false,
        maximumAge: Infinity,
        timeout: 60000,
      },
    );

    return () => {
      map.setTarget(undefined);
    };
  }, [map, view, setHelperCard]);

  useEffect(() => {
    if (initialGeometries) {
      vectorSource.current.clear();
      initialGeometries.forEach((geometry) => {
        let feature;
        if (geometry.type === "Point") {
          feature = new Feature(new Point(geometry.coordinates as number[]));
        } else if (geometry.type === "Polygon") {
          feature = new Feature(new Polygon(geometry.coordinates as number[]));
        }
        if (feature) {
          vectorSource.current.addFeature(feature);
        }
      });
    }
  }, [initialGeometries]);

  return (
    <div
      id="map"
      className={"h-full w-full overflow-clip rounded-xl"}
      ref={mapRef}
    >
      <MapContext.Provider value={map}></MapContext.Provider>
    </div>
  );
};

MapProvider.displayName = "MapProvider";

export { MapContext };
export default MapProvider;
