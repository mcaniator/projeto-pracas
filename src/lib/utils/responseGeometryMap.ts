import type { ResponseGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import Feature, { type FeatureLike } from "ol/Feature";
import { Point, Polygon } from "ol/geom";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";

export const createResponseGeometryFeature = (
  responseGeometry: ResponseGeometry,
): Feature | undefined => {
  const { type, coordinates, description } = responseGeometry;
  if (type === "Point") {
    return new Feature({
      geometry: new Point(coordinates as number[]),
      description,
    });
  }
  if (type === "Polygon") {
    return new Feature({
      geometry: new Polygon(coordinates as number[][][]),
      description,
    });
  }
};

export const getResponseGeometryStyle = (
  feature: FeatureLike,
  selected = false,
) => {
  const description = feature.get("description") as string | null | undefined;
  const isPoint = feature.getGeometry()?.getType() === "Point";
  const stroke = new Stroke({
    color: selected ? "#3399cc" : "#7C4091",
    width: 3,
  });
  const fill = new Fill({ color: "#9B59B24D" });

  return new Style({
    fill,
    stroke,
    image: new CircleStyle({ radius: 8, fill, stroke }),
    text:
      description ?
        new Text({
          text: description,
          font: "600 12px sans-serif",
          offsetY: isPoint ? -16 : 0,
          overflow: true,
          padding: [2, 4, 2, 4],
          backgroundFill: new Fill({ color: "rgba(255,255,255,0.9)" }),
          fill: new Fill({ color: "#6a1b9a" }),
        })
      : undefined,
  });
};
