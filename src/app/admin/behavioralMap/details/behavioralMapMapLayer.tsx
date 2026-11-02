"use client";

import { MapContext } from "@/app/admin/map/mapProvider";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import Feature from "ol/Feature";
import { unByKey } from "ol/Observable";
import GeoJSON from "ol/format/GeoJSON";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import { useContext, useEffect, useMemo } from "react";

import type {
  BehavioralMapObservation,
  BehavioralMapPendingPosition,
} from "./observationState";

type Details = FetchBehavioralMapDetailsResponse["behavioralMapDetails"];

const BehavioralMapMapLayer = ({
  details,
  observations,
  pendingPosition,
  onMapClick,
  onObservationClick,
  selectedObservationLocalId,
}: {
  details: Details;
  observations: BehavioralMapObservation[];
  pendingPosition: BehavioralMapPendingPosition | null;
  onMapClick: (position: [number, number]) => void;
  onObservationClick: (localId: string) => void;
  selectedObservationLocalId: string | null;
}) => {
  const map = useContext(MapContext);
  const observationSource = useMemo(
    () => new VectorSource<Feature<Point>>(),
    [],
  );
  const observationLayer = useMemo(
    () =>
      new VectorLayer({
        source: observationSource,
        zIndex: 10,
        style: (feature) => {
          const isDraft = feature.get("isDraft") === true;
          const isSelected = feature.get("isSelected") === true;
          const color = isDraft || isSelected ? "#e53935" : "#1976d2";
          if (isDraft) {
            return [
              new Style({
                image: new CircleStyle({
                  radius: 10,
                  fill: new Fill({ color }),
                  stroke: new Stroke({ color: "#ffffff", width: 2 }),
                }),
              }),
              new Style({
                text: new Text({
                  text: "+",
                  font: "bold 16px sans-serif",
                  textAlign: "center",
                  textBaseline: "middle",
                  fill: new Fill({ color: "#ffffff" }),
                }),
              }),
            ];
          }

          const pointStyle = new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({ color }),
              stroke: new Stroke({ color: "#ffffff", width: 2 }),
            }),
          });

          const quantity = Number(feature.get("quantity") ?? 1);
          if (quantity === 1) return pointStyle;

          const quantityBadgeStyle = new Style({
            text: new Text({
              text: "x" + String(quantity),
              font: "600 11px sans-serif",
              offsetX: 8,
              offsetY: -8,
              padding: [1, 1, 1, 1],
              backgroundFill: new Fill({ color: "#ffffff" }),
              backgroundStroke: new Stroke({ color, width: 1.5 }),
              fill: new Fill({ color }),
            }),
          });
          return [pointStyle, quantityBadgeStyle];
        },
      }),
    [observationSource],
  );

  useEffect(() => {
    if (!map) return;
    map.addLayer(observationLayer);
    return () => {
      map.removeLayer(observationLayer);
    };
  }, [map, observationLayer]);

  useEffect(() => {
    const features = observations.map((observation) => {
      const feature = new Feature<Point>({
        geometry: new Point(observation.position),
      });
      feature.setProperties({
        kind: "observation",
        observationLocalId: observation.localId,
        quantity: observation.quantity,
        isSelected: observation.localId === selectedObservationLocalId,
      });
      return feature;
    });

    if (pendingPosition) {
      const draftFeature = new Feature<Point>({
        geometry: new Point(pendingPosition.position),
      });
      draftFeature.set("isDraft", true);
      features.push(draftFeature);
    }

    observationSource.clear(true);
    observationSource.addFeatures(features);
  }, [
    observations,
    observationSource,
    pendingPosition,
    selectedObservationLocalId,
  ]);

  useEffect(() => {
    if (!map) return;

    const polygonGeoJson = details.location.st_asgeojson;
    if (!polygonGeoJson) {
      map.updateSize();
      return;
    }

    try {
      const feature = new GeoJSON().readFeature(polygonGeoJson);
      const frame = requestAnimationFrame(() => {
        map.updateSize();
        map.getView().fit(feature.getGeometry()!.getExtent(), {
          padding: [32, 32, 32, 32],
          maxZoom: 19,
          duration: 250,
        });
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    } catch {
      map.updateSize();
    }
  }, [details.location.st_asgeojson, map]);

  useEffect(() => {
    if (!map) return;

    const targetElement = map.getTargetElement();
    const originalCursor = targetElement?.style.cursor ?? "";
    const listenerKey = map.on("singleclick", (event) => {
      const clickedFeature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) => {
          if (layer !== observationLayer) return undefined;
          return feature;
        },
        { layerFilter: (layer) => layer === observationLayer },
      );

      const localId = clickedFeature?.get("observationLocalId") as unknown;
      if (typeof localId === "string") {
        onObservationClick(localId);
        return;
      }

      const longitude = event.coordinate[0];
      const latitude = event.coordinate[1];
      if (longitude === undefined || latitude === undefined) return;

      onMapClick([longitude, latitude]);
    });
    const pointerMoveKey = map.on("pointermove", (event) => {
      if (event.dragging) return;

      const clickableObservation = map.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) => {
          if (
            layer !== observationLayer ||
            typeof feature.get("observationLocalId") !== "string"
          ) {
            return undefined;
          }
          return feature;
        },
        { layerFilter: (layer) => layer === observationLayer },
      );

      const currentTarget = map.getTargetElement();
      if (currentTarget) {
        currentTarget.style.cursor =
          clickableObservation ? "pointer" : originalCursor;
      }
    });

    return () => {
      unByKey([listenerKey, pointerMoveKey]);
      const currentTarget = map.getTargetElement();
      if (currentTarget) currentTarget.style.cursor = originalCursor;
    };
  }, [map, observationLayer, onMapClick, onObservationClick]);

  return null;
};

export default BehavioralMapMapLayer;
