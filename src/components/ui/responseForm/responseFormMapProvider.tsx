"use client";

import { useGeolocation } from "@/components/context/geolocationContext";
import CButton from "@/components/ui/cButton";
import CTextField from "@/components/ui/cTextField";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import CDialog from "@/components/ui/dialog/cDialog";
import useCenterOnUserLocation from "@/lib/hooks/useCenterOnUserLocation";
import { ResponseGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import {
  createResponseGeometryFeature,
  getResponseGeometryStyle,
} from "@/lib/utils/responseGeometryMap";
import { QuestionGeometryTypes } from "@prisma/client";
import {
  IconClick,
  IconDragDrop,
  IconLocationPin,
  IconPencil,
  IconPolygon,
} from "@tabler/icons-react";
import type Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { click, never } from "ol/events/condition";
import { Point, Polygon } from "ol/geom";
import { Draw, Modify, Select } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { useGeographic } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { getUid } from "ol/util";
import {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getInitialViewTargetKey,
  resolveInitialViewTarget,
} from "./responseFormMapInitialView";

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
  {
    id: "SELECT",
    icon: <IconClick />,
    tooltip: "Selecionar para editar a descrição ou excluir",
  },
  { id: "DRAG", icon: <IconDragDrop />, tooltip: "Arrastar" },
];

interface MapProviderProps {
  geometryType: QuestionGeometryTypes[];
  questionId: number;
  locationPolygonGeoJson: string | null;
  initialGeometries: ResponseGeometry[] | undefined;
  handleResponseGeometryChange: (
    questionId: number,
    geometries: ResponseGeometry[],
  ) => void;
  onGeometrySelectionChange: (hasSelection: boolean) => void;
  finalized: boolean;
}

const MapContext = createContext(new Map());

const MapProvider = forwardRef(
  (
    {
      geometryType,
      questionId,
      locationPolygonGeoJson,
      initialGeometries,
      handleResponseGeometryChange,
      onGeometrySelectionChange,
      finalized,
    }: MapProviderProps,
    ref,
  ) => {
    useGeographic();
    const centerOnUserLocation = useCenterOnUserLocation();
    const { cachedUserCoordinates, isReadingUserLocation } = useGeolocation();
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
    const [descriptionFeature, setDescriptionFeature] =
      useState<Feature | null>(null);
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
    const vectorSource = useRef<VectorSource>(new VectorSource());
    const mapRef = useRef<HTMLDivElement>(null);
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
    const isUserLocationLoading =
      !cachedUserCoordinates && isReadingUserLocation;

    const createDrawInteraction = useCallback(() => {
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
      draw.on("drawend", ({ feature }) => setDescriptionFeature(feature));
      return draw;
    }, [currentGeometryType]);

    useEffect(() => {
      if (mapRef.current !== null) {
        map.setTarget(mapRef.current);
      }

      for (const interaction of map.getInteractions().getArray().slice()) {
        if (
          interaction instanceof Draw ||
          interaction instanceof Modify ||
          interaction instanceof Select
        ) {
          map.removeInteraction(interaction);
        }
      }
      if (!finalized) {
        map.addInteraction(createDrawInteraction());
        setMapMode("DRAW");
      }
      setSelectedFeature(null);
      onGeometrySelectionChange(false);

      return () => {
        map.setTarget(undefined);
      };
    }, [map, createDrawInteraction, finalized, onGeometrySelectionChange]);

    useEffect(() => {
      vectorSource.current.clear();

      initialGeometries?.forEach((geometry) => {
        const feature = createResponseGeometryFeature(geometry);
        if (feature) {
          vectorSource.current.addFeature(feature);
        }
      });
    }, [initialGeometries]);

    useEffect(() => {
      const initialViewTarget = resolveInitialViewTarget({
        locationPolygonGeoJson,
        initialGeometries,
      });
      const initialViewTargetKey = getInitialViewTargetKey(initialViewTarget);

      if (lastAppliedInitialViewKeyRef.current === initialViewTargetKey) {
        return;
      }

      lastAppliedInitialViewKeyRef.current = initialViewTargetKey;

      if (initialViewTarget.type !== "geolocation") {
        view.fit(initialViewTarget.extent, {
          padding: [50, 50, 50, 50],
          duration: 0,
          maxZoom: 20,
        });
        return;
      }

      void centerOnUserLocation({
        view,
        zoom: 16,
        duration: 0,
        maximumAge: Infinity,
        useCachedLocationImmediately: true,
      });
    }, [centerOnUserLocation, initialGeometries, locationPolygonGeoJson, view]);

    const getGeometries = () => {
      const features = vectorSource.current.getFeatures();
      const geometries = features
        .map((feature) => {
          const geometry = feature.getGeometry();
          if (geometry instanceof Point || geometry instanceof Polygon) {
            const description = feature.get("description") as
              | string
              | null
              | undefined;
            return {
              type: geometry.getType(),
              coordinates: geometry.getCoordinates(),
              description: description?.trim() || null,
            };
          }
        })
        .filter((g) => g !== undefined);

      if (geometries !== undefined) {
        handleResponseGeometryChange(questionId, geometries);
      }
    };

    const removeSelectedFeature = () => {
      if (!selectedFeature) return;
      for (const interaction of map.getInteractions().getArray()) {
        if (interaction instanceof Select) {
          interaction.getFeatures().remove(selectedFeature);
        }
      }
      vectorSource.current.removeFeature(selectedFeature);
      setSelectedFeature(null);
      onGeometrySelectionChange(false);
    };

    const switchMode = (newMode: MapMode) => {
      if (finalized || newMode === mapMode) return;

      for (const interaction of map.getInteractions().getArray().slice()) {
        if (
          interaction instanceof Draw ||
          interaction instanceof Modify ||
          interaction instanceof Select
        ) {
          map.removeInteraction(interaction);
        }
      }
      setSelectedFeature(null);
      onGeometrySelectionChange(false);

      if (newMode === "SELECT") {
        const selectInteraction = new Select({
          condition: click,
          toggleCondition: never,
          hitTolerance: 10,
          style: (feature) => getResponseGeometryStyle(feature, true),
        });
        selectInteraction.on("select", (event) => {
          const selected = event.selected[0] ?? null;
          setSelectedFeature(selected);
          onGeometrySelectionChange(selected !== null);
        });
        map.addInteraction(selectInteraction);
      } else if (newMode === "DRAW") {
        map.addInteraction(createDrawInteraction());
      } else {
        const modify = new Modify({ source: vectorSource.current });
        map.addInteraction(modify);
      }
      setMapMode(newMode);
    };

    const closeDescriptionDialog = () => setDescriptionFeature(null);

    const saveDescription = () => {
      const value = descriptionInputRef.current?.value;
      if (descriptionFeature && value !== undefined) {
        descriptionFeature.set("description", value.trim());
      }
      closeDescriptionDialog();
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
          {!finalized && selectedFeature && (
            <div className="absolute bottom-2 left-2 z-50">
              <CButton onClick={() => setDescriptionFeature(selectedFeature)}>
                <IconPencil />
                Editar descrição
              </CButton>
            </div>
          )}
          <CDialog
            open={descriptionFeature !== null}
            title="Descrição da geometria"
            onClose={closeDescriptionDialog}
            onCancel={closeDescriptionDialog}
            onConfirm={saveDescription}
            cancelChildren="Cancelar"
            confirmChildren="Confirmar"
          >
            {descriptionFeature && (
              <CTextField
                key={getUid(descriptionFeature)}
                label="Descrição (opcional)"
                defaultValue={
                  descriptionFeature.get("description") ?
                    String(descriptionFeature.get("description"))
                  : null
                }
                inputRef={descriptionInputRef}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.stopPropagation();
                }}
              />
            )}
          </CDialog>
          <div className="pointer-events-auto absolute bottom-2 right-2 z-50 flex h-fit w-fit flex-col gap-2 overflow-auto">
            <CButton
              square
              tooltip="Centralizar na sua localização"
              loading={isUserLocationLoading}
              onClick={() => {
                void centerOnUserLocation({
                  view,
                  zoom: 17,
                  duration: 500,
                  maximumAge: 0,
                  useCachedLocationImmediately: true,
                });
              }}
            >
              <IconLocationPin />
            </CButton>
          </div>
        </MapContext.Provider>
      </div>
    );
  },
);

MapProvider.displayName = "MapProvider";

export { MapContext };
export default MapProvider;
