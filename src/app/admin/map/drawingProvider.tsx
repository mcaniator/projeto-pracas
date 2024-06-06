"use client";

import { FeatureLike } from "ol/Feature";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
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
  useState,
} from "react";

import { MapContext } from "./mapProvider";

const DrawingProviderVectorSourceContext = createContext(new VectorSource());

const DrawingProvider = ({ children }: { children: ReactNode }) => {
  const map = useContext(MapContext);

  const styleFunction = useMemo(
    () => (feature: FeatureLike) => {
      const style = new Style({
        fill: new Fill({
          color: "#9B59B24D",
        }),
        stroke: new Stroke({
          color: "#7C4091",
          lineCap: "butt",
          width: 3,
        }),
        text: new Text({
          fill: new Fill({
            color: "#FFFFFF",
          }),
          scale: 4,
          stroke: new Stroke({
            width: 1,
            color: "#000000",
          }),
          text:
            ((map.getView().getZoom() ?? 0) > 15 ?
              (feature.get("description") as string)
            : null) ?? "",
        }),
      });

      return style;
    },
    [map],
  );

  const source = useMemo(() => new VectorSource({ wrapX: false }), []);
  const vector = useMemo(
    () =>
      new VectorLayer({
        source: source,
        style: styleFunction,
      }),
    [source, styleFunction],
  );
  const modify = useMemo(() => new Modify({ source: source }), [source]);
  const draw = useMemo(
    () =>
      new Draw({
        source: source,
        type: "Polygon",
        style: {
          "fill-color": "#9B59B24D",
          "stroke-color": "#7C4091",
          "stroke-line-cap": "butt",
          "stroke-line-dash": [10],
          "stroke-width": 3,
        },
      }),
    [source],
  );
  const snap = useMemo(() => new Snap({ source: source }), [source]);

  useEffect(() => {
    map.addLayer(vector);
    map.addInteraction(modify);
    map.addInteraction(draw);
    map.addInteraction(snap);

    return () => {
      map.removeLayer(vector);
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      map.removeInteraction(snap);
    };
  }, [map, vector, modify, draw, snap]);

  const [vectorSource, setVectorSource] = useState(source);
  useEffect(() => {
    setVectorSource(source);
  }, [source]);

  return (
    <DrawingProviderVectorSourceContext.Provider value={vectorSource}>
      {children}
    </DrawingProviderVectorSourceContext.Provider>
  );
};

export { DrawingProvider, DrawingProviderVectorSourceContext };
