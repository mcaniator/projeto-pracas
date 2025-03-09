"use client";

import { Button } from "@/components/button";
import { IconClick, IconDragDrop, IconPolygon } from "@tabler/icons-react";
import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { click } from "ol/events/condition";
import { Point, Polygon } from "ol/geom";
import { Draw, Modify, Select } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import {
  createContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { ModalGeometry } from "./responseForm";

type MapMode = "DRAW" | "SELECT" | "DRAG";

interface MapProviderProps {
  questionId: number;
  initialGeometries: ModalGeometry[] | undefined;
  drawType: "Point" | "Polygon";
  handleQuestionGeometryChange: (
    questionId: number,
    geometries: ModalGeometry[],
  ) => void;
  handleChangeIsInSelectMode: (val: boolean) => void;
}

const MapContext = createContext(new Map());

const MapProvider = forwardRef(
  (
    {
      questionId,
      initialGeometries,
      drawType,
      handleQuestionGeometryChange,
      handleChangeIsInSelectMode,
    }: MapProviderProps,
    ref,
  ) => {
    useGeographic();
    const [mapMode, setMapMode] = useState<MapMode>("DRAW");
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(
      null,
    );
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
      interactions.forEach((interaction) => {
        if (
          interaction instanceof Draw ||
          interaction instanceof Modify ||
          interaction instanceof Select
        )
          map.removeInteraction(interaction);
      });
      const draw = new Draw({
        source: vectorSource.current,
        type: drawType,
      });
      map.addInteraction(draw);
      handleChangeIsInSelectMode(false);
      setMapMode("DRAW");
      return () => {
        map.setTarget(undefined);
      };
    }, [map, view, drawType, handleChangeIsInSelectMode]);

    useEffect(() => {
      if (initialGeometries) {
        vectorSource.current.clear();
        initialGeometries.forEach((geometry) => {
          let feature;
          if (geometry.type === "Point") {
            feature = new Feature(new Point(geometry.coordinates as number[]));
          } else if (geometry.type === "Polygon") {
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

    const getGeometries = () => {
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
    };

    const removeSelectedFeature = () => {
      if (selectedFeature) {
        vectorSource.current.removeFeature(selectedFeature);
        setSelectedFeature(null);
      }
    };
    const switchMode = (newMode: MapMode) => {
      if (newMode === "SELECT") {
        const interactions = map.getInteractions();

        interactions.forEach((interaction) => {
          if (interaction instanceof Draw || interaction instanceof Modify) {
            map.removeInteraction(interaction);
          }
        });

        const selectInteraction = new Select({
          condition: click,
          hitTolerance: 10,
        });
        selectInteraction.on("select", (event) => {
          const selected = event.selected[0];
          if (selected) {
            setSelectedFeature(selected);
            handleChangeIsInSelectMode(true);
          } else {
            setSelectedFeature(null);
          }
        });
        map.addInteraction(selectInteraction);
        setMapMode("SELECT");
      } else if (newMode === "DRAW") {
        const interactions = map.getInteractions();
        interactions.forEach((interaction) => {
          if (interaction instanceof Modify || interaction instanceof Select) {
            map.removeInteraction(interaction);
          }
        });
        const draw = new Draw({
          source: vectorSource.current,
          type: drawType,
        });
        map.addInteraction(draw);
        setMapMode("DRAW");
        handleChangeIsInSelectMode(false);
      } else {
        const interactions = map.getInteractions();
        interactions.forEach((interaction) => {
          if (interaction instanceof Select || interaction instanceof Draw) {
            map.removeInteraction(interaction);
          }
        });
        const modify = new Modify({ source: vectorSource.current });
        map.addInteraction(modify);
        setMapMode("DRAG");
        handleChangeIsInSelectMode(false);
      }
    };

    useImperativeHandle(ref, () => ({
      saveGeometries: getGeometries,
      removeSelectedFeature: removeSelectedFeature,
    }));

    return (
      <div
        id="map"
        className={"h-full w-full overflow-clip rounded-xl"}
        ref={mapRef}
      >
        <MapContext.Provider value={map}>
          <div className="fixed z-50 inline-flex w-fit gap-1 rounded-xl bg-gray-400 py-1 shadow-inner">
            <Button
              variant={"ghost"}
              onPress={() => switchMode("DRAW")}
              className={`rounded-xl px-4 py-1 ${mapMode === "DRAW" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            >
              <IconPolygon></IconPolygon>
            </Button>
            <Button
              variant={"ghost"}
              onPress={() => switchMode("SELECT")}
              className={`rounded-xl bg-blue-500 px-4 py-1 ${mapMode === "SELECT" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            >
              <IconClick />
            </Button>
            <Button
              variant={"ghost"}
              onPress={() => switchMode("DRAG")}
              className={`rounded-xl bg-blue-500 px-4 py-1 ${mapMode === "DRAG" ? "bg-gray-200/20 shadow-md" : "bg-gray-400/0 shadow-none"}`}
            >
              <IconDragDrop />
            </Button>
          </div>
        </MapContext.Provider>
      </div>
    );
  },
);

MapProvider.displayName = "MapProvider";

export { MapContext };
export default MapProvider;
