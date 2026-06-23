"use client";

import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { Point, Polygon } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { useEffect, useMemo, useRef } from "react";

import {
  getInitialViewTargetKey,
  resolveInitialViewTarget,
} from "../responseForm/responseFormMapInitialView";

const styleFunction = () =>
  new Style({
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

const AssessmentViewerMapProvider = ({
  geometries,
  locationPolygonGeoJson,
}: {
  geometries: ResponseGeometry[];
  locationPolygonGeoJson: string | null;
}) => {
  useGeographic();

  const mapRef = useRef<HTMLDivElement>(null);
  const vectorSource = useRef<VectorSource>(new VectorSource());
  const lastAppliedInitialViewKeyRef = useRef<string | null>(null);

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
    if (mapRef.current !== null) {
      map.setTarget(mapRef.current);
    }

    return () => {
      map.setTarget(undefined);
    };
  }, [map]);

  useEffect(() => {
    vectorSource.current.clear();

    geometries.forEach((geometry) => {
      let feature: Feature | undefined;

      if (geometry.type === "Point") {
        feature = new Feature(new Point(geometry.coordinates as number[]));
      } else if (geometry.type === "Polygon") {
        feature = new Feature(
          new Polygon(geometry.coordinates as number[][][]),
        );
      }

      if (feature) {
        vectorSource.current.addFeature(feature);
      }
    });
  }, [geometries]);

  useEffect(() => {
    const initialViewTarget = resolveInitialViewTarget({
      locationPolygonGeoJson,
      initialGeometries: geometries,
    });

    if (initialViewTarget.type === "geolocation") return;

    const initialViewTargetKey = getInitialViewTargetKey(initialViewTarget);

    if (lastAppliedInitialViewKeyRef.current === initialViewTargetKey) {
      return;
    }

    lastAppliedInitialViewKeyRef.current = initialViewTargetKey;

    view.fit(initialViewTarget.extent, {
      padding: [48, 48, 48, 48],
      duration: 0,
    });
  }, [geometries, locationPolygonGeoJson, view]);

  return (
    <div
      id="assessment-viewer-map"
      className="relative h-full w-full overflow-clip"
      ref={mapRef}
    />
  );
};

export default AssessmentViewerMapProvider;
