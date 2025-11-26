"use client";

import { useHelperCard } from "@components/context/helperCardContext";
import { LocationsWithPolygonResponse } from "@customTypes/location/location";
import Feature, { FeatureLike } from "ol/Feature";
import { click } from "ol/events/condition";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import { Select } from "ol/interaction";
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

import { MapContext } from "./mapProvider";

const PolygonProviderVectorSourceContext = createContext<
  VectorSource<Feature<Geometry>>
>(new VectorSource());

const PolygonProvider = ({
  fullLocationsPromise,
  children,
}: {
  fullLocationsPromise: LocationsWithPolygonResponse;
  children: ReactNode;
}) => {
  const fullLocations = fullLocationsPromise;
  const { setHelperCard } = useHelperCard();
  const map = useContext(MapContext);

  const polygonsVectorSource = useMemo(
    () => new VectorSource({ wrapX: true }),
    [],
  );

  useEffect(() => {
    if (fullLocations.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para visualizar polígonos!</>,
      });
    } else if (fullLocations.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao carregar polígonos!</>,
      });
    }
    const reader = new GeoJSON();
    const featureArray = fullLocations.locations
      .filter((location) => location.st_asgeojson)
      .map((location) => {
        const geometry = reader.readGeometry(location.st_asgeojson);

        const polygonName = location.name;
        geometry.set("name", polygonName ?? "");

        geometry.set("id", location.id);

        const feature = new Feature(geometry);
        feature.setId(location.id);

        return feature;
      });

    const styleFunction = (feature: FeatureLike) => {
      const style = new Style({
        fill: new Fill({
          color: "#1B28DE4D",
        }),
        stroke: new Stroke({
          color: "#0079AB",
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

    const selectStyleFunction = (feature: FeatureLike) => {
      const style = new Style({
        fill: new Fill({
          color: "#9B59B24D",
        }),
        stroke: new Stroke({
          color: "#9B59B2",
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
              feature.getGeometry()?.get("name") ?
                feature.getGeometry()?.get("name") + ""
              : ""
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

    const selectInteraction = new Select({
      condition: click,
      hitTolerance: 10,
      style: selectStyleFunction,
    });
    selectInteraction.on("select", (event) => {
      const selected = event.selected[0];
      if (selected) {
        setHelperCard({
          show: true,
          helperCardType: "CONFIRM",
          content: "Polígono selecionado",
        });
      } else {
        setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: "Polígono  deselecionado",
        });
      }
    });
    map?.addInteraction(selectInteraction);

    map?.on("pointermove", (evt) => {
      const hit = map?.hasFeatureAtPixel(evt.pixel);

      map.getTargetElement().style.cursor = hit ? "pointer" : "default";
    });
    return () => {
      polygonsVectorSource.removeFeatures(featureArray);
      map?.removeLayer(polygonsLayer);
    };
  }, [map, fullLocations, polygonsVectorSource, setHelperCard]);

  return (
    <PolygonProviderVectorSourceContext.Provider value={polygonsVectorSource}>
      {children}
    </PolygonProviderVectorSourceContext.Provider>
  );
};

export { PolygonProviderVectorSourceContext };
export default PolygonProvider;
