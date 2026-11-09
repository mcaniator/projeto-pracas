"use client";

import type { ResponseGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import {
  createResponseGeometryFeature,
  getResponseGeometryStyle,
} from "@/lib/utils/responseGeometryMap";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { useEffect, useMemo, useRef } from "react";

import {
  getInitialViewTargetKey,
  resolveInitialViewTarget,
} from "../responseForm/responseFormMapInitialView";

const FormSubmissionViewerMapProvider = ({
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
      style: (feature) => getResponseGeometryStyle(feature),
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
      const feature = createResponseGeometryFeature(geometry);
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
      padding: [50, 50, 50, 50],
      duration: 0,
      maxZoom: 20,
    });
  }, [geometries, locationPolygonGeoJson, view]);

  return (
    <div
      id="form-submission-viewer-map"
      className="relative h-full w-full overflow-clip"
      ref={mapRef}
    />
  );
};

export default FormSubmissionViewerMapProvider;
