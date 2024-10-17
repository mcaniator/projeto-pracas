"use client";

import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { Point, Polygon } from "ol/geom";
import { Draw, Modify } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { ModalGeometry } from "./responseForm";

interface MapProviderProps {
  questionId: number;
  initialGeometries: ModalGeometry[] | undefined;
  drawType: "Point" | "Polygon";
  handleQuestionGeometryChange: (
    questionId: number,
    geometries: ModalGeometry[],
  ) => void;
}

const MapContext = createContext(new Map());

const MapProvider = forwardRef(
  (
    {
      questionId,
      initialGeometries,
      drawType,
      handleQuestionGeometryChange,
    }: MapProviderProps,
    ref,
  ) => {
    useGeographic();
    const vectorSource = useRef<VectorSource>(new VectorSource());

    const mapRef = useRef<HTMLDivElement>(null);

    const map = useMemo(() => {
      const vectorLayer = new VectorLayer({
        source: vectorSource.current,
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
        null,
        {
          enableHighAccuracy: false,
          maximumAge: Infinity,
          timeout: 60000,
        },
      );
      const interactions = map.getInteractions();
      let hasModifyListener = false;
      interactions.forEach((interaction) => {
        if (interaction instanceof Draw) {
          map.removeInteraction(interaction);
        }
        if (interaction instanceof Modify) {
          hasModifyListener = true;
        }
      });
      const draw = new Draw({
        source: vectorSource.current,
        type: drawType,
      });
      map.addInteraction(draw);
      if (!hasModifyListener) {
        const modify = new Modify({ source: vectorSource.current });
        map.addInteraction(modify);
      }

      return () => {
        map.setTarget(undefined);
      };
    }, [map, view, drawType]);

    const loadInitialGeometries = useCallback(() => {
      if (initialGeometries) {
        vectorSource.current.clear();
        initialGeometries.forEach((geometry) => {
          let feature;
          if (geometry.type === "Point") {
            feature = new Feature(new Point(geometry.coordinates as number[]));
          } else if (geometry.type === "Polygon") {
            //console.log(geometry.coordinates);
            feature = new Feature(
              new Polygon(geometry.coordinates as number[]),
            );
          }
          if (feature) {
            vectorSource.current.addFeature(feature);
          }
        });
      }
    }, [initialGeometries]);

    useEffect(() => {
      loadInitialGeometries();
    }, [loadInitialGeometries]);

    const getGeometries = useCallback(() => {
      const features = vectorSource.current.getFeatures();
      const geometries = features
        .map((feature) => {
          const geometry = feature.getGeometry();
          if (geometry instanceof Point || geometry instanceof Polygon) {
            return {
              type: geometry.getType(),
              coordinates: geometry.getCoordinates(),
            };
          }
        })
        .filter((g) => g !== undefined);
      if (geometries !== undefined) {
        handleQuestionGeometryChange(questionId, geometries);
      }
    }, [handleQuestionGeometryChange, questionId]);

    useImperativeHandle(ref, () => ({
      saveGeometries: getGeometries,
    }));

    return (
      <div
        id="map"
        className={"h-full w-full overflow-clip rounded-tl-3xl"}
        ref={mapRef}
      >
        <MapContext.Provider value={map}></MapContext.Provider>
      </div>
    );
  },
);

MapProvider.displayName = "MapProvider";

export { MapContext };
export default MapProvider;
