import { MapContext } from "@/app/admin/map/mapProvider";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import type {
  FormSubmissionCategoryItem,
  FormSubmissionQuestionItem,
} from "@/lib/serverFunctions/queries/formSubmission";
import type { ResponseFormGeometry } from "@/lib/types/formSubmission/responseFormTypes";
import {
  createResponseGeometryFeature,
  getResponseGeometryStyle,
} from "@/lib/utils/responseGeometryMap";
import type OpenLayersMap from "ol/Map";
import Overlay from "ol/Overlay";
import type { Coordinate } from "ol/coordinate";
import { Point, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { BehavioralMapPosition } from "./observationState";

export const getBehavioralMapFormGeometryFeatures = (
  formGeometries: ResponseFormGeometry[],
  formCategories: FormSubmissionCategoryItem[],
) => {
  const questionsById = new Map<number, FormSubmissionQuestionItem>();
  for (const category of formCategories) {
    for (const item of category.categoryChildren) {
      const questions = "questionId" in item ? [item] : item.questions;
      for (const question of questions) {
        questionsById.set(question.questionId, question);
      }
    }
  }

  return formGeometries.flatMap(({ questionId, geometries }) => {
    const question = questionsById.get(questionId);
    return geometries.flatMap((geometry, index) => {
      const feature = createResponseGeometryFeature({
        ...geometry,
        description: geometry.description?.trim() || question?.name,
      });
      if (!feature) return [];
      const shape = feature.getGeometry();
      if (!(shape instanceof Point || shape instanceof Polygon)) return [];
      const anchor = shape instanceof Polygon ? shape.getInteriorPoint() : shape;
      const [longitude, latitude] = anchor.getCoordinates();
      if (longitude === undefined || latitude === undefined) return [];
      const position: BehavioralMapPosition = [longitude, latitude];
      return [
        {
          key: geometry.localId ?? `${questionId}-${index}`,
          localId: geometry.localId,
          iconKey: question?.iconKey,
          feature,
          position,
        },
      ];
    });
  });
};

const BehavioralMapFormGeometryIcon = ({
  map,
  iconKey,
  position,
}: {
  map: OpenLayersMap;
  iconKey: string | undefined;
  position: Coordinate;
}) => {
  const [element] = useState(() => document.createElement("div"));

  useEffect(() => {
    const overlay = new Overlay({
      element,
      position,
      positioning: "center-center",
      stopEvent: false,
      className: "ol-overlay-container !pointer-events-none",
    });
    map.addOverlay(overlay);
    return () => {
      map.removeOverlay(overlay);
    };
  }, [element, map, position]);

  return createPortal(
    <span
      aria-hidden="true"
      className="flex items-center justify-center text-xs leading-none text-[#6a1b9a]"
    >
      <CDynamicIcon iconKey={iconKey} />
    </span>,
    element,
  );
};

const BehavioralMapFormGeometryLayer = ({
  geometryFeatures,
  selectedGeometryLocalIds,
  visible,
  labelsVisible,
}: {
  geometryFeatures: ReturnType<typeof getBehavioralMapFormGeometryFeatures>;
  selectedGeometryLocalIds: readonly string[];
  visible: boolean;
  labelsVisible: boolean;
}) => {
  const map = useContext(MapContext);
  const source = useMemo(() => new VectorSource(), []);
  const layer = useMemo(
    () =>
      new VectorLayer({
        source,
        zIndex: 7,
        properties: { isFormGeometryLayer: true },
      }),
    [source],
  );

  useEffect(() => {
    const selectedIds = new Set(selectedGeometryLocalIds);
    layer.setStyle((feature) => {
      const localId = feature.getId();
      const style = getResponseGeometryStyle(feature, {
        showLabel: labelsVisible,
        strokeColor:
          typeof localId === "string" && selectedIds.has(localId) ?
            "#e53935"
          : undefined,
      });
      const label = style.getText();
      label?.setTextBaseline("bottom");
      label?.setOffsetY(-10);
      return style;
    });
  }, [labelsVisible, layer, selectedGeometryLocalIds]);

  useEffect(() => {
    source.clear();
    source.addFeatures(geometryFeatures.map(({ feature }) => feature));
  }, [geometryFeatures, source]);

  useEffect(() => {
    layer.setVisible(visible);
  }, [layer, visible]);

  useEffect(() => {
    if (!map) return;
    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
  }, [layer, map]);

  if (!map || !visible) return null;

  return geometryFeatures.map(({ key, iconKey, position }) => (
    <BehavioralMapFormGeometryIcon
      key={key}
      map={map}
      iconKey={iconKey}
      position={position}
    />
  ));
};

export default BehavioralMapFormGeometryLayer;
