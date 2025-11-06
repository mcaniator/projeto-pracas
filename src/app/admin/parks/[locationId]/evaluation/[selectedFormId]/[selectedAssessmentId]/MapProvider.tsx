"use client";

import { ResponseGeometry } from "@customTypes/assessments/geometry";
import { QuestionGeometryTypes } from "@prisma/client";
import { IconClick, IconDragDrop, IconPolygon } from "@tabler/icons-react";
import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { click } from "ol/events/condition";
import { Point, Polygon } from "ol/geom";
import { Draw, Modify, Select } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import {
  createContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import CToggleButtonGroup from "../../../../../../../components/ui/cToggleButtonGroup";

type MapMode = "DRAW" | "SELECT" | "DRAG";

const geometryTypeTranslation = new globalThis.Map<
  QuestionGeometryTypes,
  string
>([
  ["POINT", "Pontos"],
  ["POLYGON", "Polígonos"],
]);

const geometryTypeFormatter = new globalThis.Map<
  QuestionGeometryTypes,
  "Point" | "Polygon"
>([
  ["POINT", "Point"],
  ["POLYGON", "Polygon"],
]);

const mapModeOptions: {
  id: MapMode;
  icon: React.ReactNode;
  tooltip: string;
}[] = [
  { id: "DRAW", icon: <IconPolygon />, tooltip: "Desenhar" },
  { id: "SELECT", icon: <IconClick />, tooltip: "Excluir" },
  { id: "DRAG", icon: <IconDragDrop />, tooltip: "Arrastar" },
];

interface MapProviderProps {
  geometryType: QuestionGeometryTypes[];
  questionId: number;
  initialGeometries: ResponseGeometry[] | undefined;
  handleQuestionGeometryChange: (
    questionId: number,
    geometries: ResponseGeometry[],
  ) => void;
  handleChangeIsInSelectMode: (val: boolean) => void;
  finalized: boolean;
}

const MapContext = createContext(new Map());

const MapProvider = forwardRef(
  (
    {
      geometryType,
      questionId,
      initialGeometries,
      handleQuestionGeometryChange,
      handleChangeIsInSelectMode,
      finalized,
    }: MapProviderProps,
    ref,
  ) => {
    useGeographic();
    const [geometryTypeOptions] = useState(
      geometryType.map((g) => ({
        id: geometryTypeFormatter.get(g)!,
        label: geometryTypeTranslation.get(g),
      })),
    );
    const [currentGeometryType, setCurrentGeometryType] = useState<
      "Point" | "Polygon"
    >(geometryTypeOptions[0]!.id);
    const [mapMode, setMapMode] = useState<MapMode>("DRAW");
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(
      null,
    );
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
        type: currentGeometryType,
        style:
          currentGeometryType === "Polygon" ?
            {
              "fill-color": "#9B59B24D",
              "stroke-color": "#7C4091",
              "stroke-line-cap": "butt",
              "stroke-line-dash": [10],
              "stroke-width": 3,
            }
          : {
              "circle-radius": 5,
              "circle-fill-color": "#9B59B2",
            },
      });
      if (!finalized) {
        map.addInteraction(draw);
        handleChangeIsInSelectMode(false);
        setMapMode("DRAW");
      }

      return () => {
        map.setTarget(undefined);
      };
    }, [map, view, currentGeometryType, finalized, handleChangeIsInSelectMode]);

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
      if (finalized) return;
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
          type: currentGeometryType,
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
        className={"relative h-full w-full overflow-clip"}
        ref={mapRef}
      >
        <MapContext.Provider value={map}>
          {!finalized && (
            <div className="absolute z-50 flex w-full flex-wrap justify-between">
              <CToggleButtonGroup
                value={currentGeometryType}
                options={geometryTypeOptions}
                getLabel={(i) => i.label}
                getValue={(i) => i.id}
                onChange={(_, v) => {
                  setCurrentGeometryType(v.id);
                }}
              />
              <CToggleButtonGroup
                options={mapModeOptions}
                value={mapMode}
                getLabel={(i) => i.icon}
                getValue={(i) => i.id}
                getTooltip={(i) => i.tooltip}
                onChange={(_, v) => {
                  switchMode(v.id);
                }}
              />
            </div>
          )}
        </MapContext.Provider>
      </div>
    );
  },
);

MapProvider.displayName = "MapProvider";

export { MapContext };
export default MapProvider;
