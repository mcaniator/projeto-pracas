"use client";

import type { Location } from "@prisma/client";
import Feature, { FeatureLike } from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { useHelperCard } from "../../../components/context/helperCardContext";
import { MapContext } from "./mapProvider";

const PolygonProviderVectorSourceContext = createContext<
  VectorSource<Feature<Geometry>>
>(new VectorSource());

const PolygonProvider = ({
  polygons,
  locations,
  children,
}: {
  polygons: {
    statusCode: number;
    polygons: { st_asgeojson: string; id: number }[];
  };
  locations: Location[];
  children: ReactNode;
}) => {
  const { setHelperCard } = useHelperCard();
  const map = useContext(MapContext);

  const polygonsVectorSource = useMemo(
    () => new VectorSource({ wrapX: true }),
    [],
  );

  useEffect(() => {
    if (polygons.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para visualizar polígonos!</>,
      });
    } else if (polygons.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao carregar polígonos!</>,
      });
    }
    const reader = new GeoJSON();
    const featureArray = polygons.polygons.map((polygon) => {
      const geometry = reader.readGeometry(polygon.st_asgeojson);

      const polygonNamePos = locations.findIndex(
        (val) => val.id === polygon.id,
      );
      const polygonName = locations[polygonNamePos]?.name;
      geometry.set("name", polygonName ?? "");

      geometry.set("id", polygon.id);

      const feature = new Feature(geometry);
      feature.setId(polygon.id);

      return feature;
    });

    const styleFunction = (feature: FeatureLike) => {
      const style = new Style({
        fill: new Fill({
          color: "#8FBC944D",
        }),
        stroke: new Stroke({
          color: "#608E66",
          lineCap: "butt",
          width: 3,
        }),
        text: new Text({
          fill: new Fill({
            color: "#FFFFFF",
          }),
          scale: 3,
          stroke: new Stroke({
            width: 1,
            color: "#000000",
          }),
          overflow: true,
          text:
            ((map?.getView().getZoom() ?? 0) > 15 ?
              feature.getGeometry()?.get("name") + ""
            : null) ?? "",
        }),
      });

      return style;
    };

    const polygonsLayer = new VectorLayer({
      source: polygonsVectorSource,
      style: styleFunction,
    });

    polygonsVectorSource.addFeatures(featureArray);
    map?.addLayer(polygonsLayer);
    return () => {
      polygonsVectorSource.removeFeatures(featureArray);
      map?.removeLayer(polygonsLayer);
    };
  }, [map, polygons, locations, polygonsVectorSource, setHelperCard]);

  return (
    <PolygonProviderVectorSourceContext.Provider value={polygonsVectorSource}>
      {children}
    </PolygonProviderVectorSourceContext.Provider>
  );
};

export { PolygonProviderVectorSourceContext };
export default PolygonProvider;
