"use client";

import Feature, { FeatureLike } from "ol/Feature";
import { click } from "ol/events/condition";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, SimpleGeometry } from "ol/geom";
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

import { FetchLocationsResponse } from "../../../lib/serverFunctions/queries/location";
import { MapContext } from "./mapProvider";

const PolygonProviderVectorSourceContext = createContext<
  VectorSource<Feature<Geometry>>
>(new VectorSource());

const PolygonProvider = ({
  fullLocations,
  selectedLocation,
  children,
  isMobileView,
  handleSelectLocation,
}: {
  fullLocations: FetchLocationsResponse["locations"];
  selectedLocation: FetchLocationsResponse["locations"][number] | null;
  children: ReactNode;
  isMobileView: boolean;
  handleSelectLocation: (id: number | null) => void;
}) => {
  const map = useContext(MapContext);

  const polygonsVectorSource = useMemo(
    () => new VectorSource({ wrapX: true }),
    [],
  );

  useEffect(() => {
    //Definição do estilo e comportamento dos polígonos
    const reader = new GeoJSON();
    const featureArray = fullLocations
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

    map?.addInteraction(selectInteraction);

    map?.on("singleclick", (evt) => {
      map?.forEachFeatureAtPixel(evt.pixel, (feature) => {
        handleSelectLocation(Number(feature.getId()));
      });
    });

    map?.on("pointermove", (evt) => {
      const hit = map?.hasFeatureAtPixel(evt.pixel);

      map.getTargetElement().style.cursor = hit ? "pointer" : "default";
    });
    return () => {
      polygonsVectorSource.removeFeatures(featureArray);
      map?.removeLayer(polygonsLayer);
    };
  }, [map, fullLocations, polygonsVectorSource, handleSelectLocation]);

  useEffect(() => {
    //Foco no local selecionado
    for (const interaction of map?.getInteractions().getArray() ?? []) {
      if (interaction instanceof Select) {
        const features = polygonsVectorSource.getFeatures();
        const selectedFeature = features.find(
          (feature) => feature.getId() === selectedLocation?.id,
        );
        interaction.getFeatures().clear();
        if (!selectedFeature) return;
        interaction.getFeatures().push(selectedFeature);
        const geometry = selectedFeature.getGeometry();
        if (geometry !== undefined && geometry instanceof SimpleGeometry) {
          const view = map?.getView();
          view?.fit(geometry, {
            duration: 1000,
            padding: [100, 100, 100, isMobileView ? 100 : 800],
          });
        }
        break;
      }
    }
  }, [selectedLocation, isMobileView, map, polygonsVectorSource]);

  return (
    <PolygonProviderVectorSourceContext.Provider value={polygonsVectorSource}>
      {children}
    </PolygonProviderVectorSourceContext.Provider>
  );
};

export { PolygonProviderVectorSourceContext };
export default PolygonProvider;
