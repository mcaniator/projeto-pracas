"use client";

import { MapContext } from "@/app/admin/map/mapProvider";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import Feature from "ol/Feature";
import { unByKey } from "ol/Observable";
import GeoJSON from "ol/format/GeoJSON";
import type Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import { useContext, useEffect, useMemo } from "react";

import type {
  BehavioralMapGroup,
  BehavioralMapLink,
} from "./observationState";
import type {
  BehavioralMapObservation,
  BehavioralMapPendingPosition,
} from "./observationState";

type Details = FetchBehavioralMapDetailsResponse["behavioralMapDetails"];

type MapPosition = [number, number];

const linkSourceIconSrc =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  );

const cross = (origin: MapPosition, a: MapPosition, b: MapPosition) =>
  (a[0] - origin[0]) * (b[1] - origin[1]) -
  (a[1] - origin[1]) * (b[0] - origin[0]);

const createGroupOutline = (points: MapPosition[]): MapPosition[] => {
  const padding = 0.00003;
  if (points.length === 1) {
    const [x, y] = points[0]!;
    return Array.from({ length: 33 }, (_, index) => {
      const angle = (index / 32) * 2 * Math.PI;
      return [x + Math.cos(angle) * padding, y + Math.sin(angle) * padding];
    });
  }

  if (points.length === 2) {
    const [a, b] = points as [MapPosition, MapPosition];
    const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return [
      ...Array.from({ length: 17 }, (_, index) => {
        const theta = angle + Math.PI / 2 + (index / 16) * Math.PI;
        return [
          a[0] + Math.cos(theta) * padding,
          a[1] + Math.sin(theta) * padding,
        ] as MapPosition;
      }),
      ...Array.from({ length: 17 }, (_, index) => {
        const theta = angle - Math.PI / 2 + (index / 16) * Math.PI;
        return [
          b[0] + Math.cos(theta) * padding,
          b[1] + Math.sin(theta) * padding,
        ] as MapPosition;
      }),
    ];
  }

  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lower: MapPosition[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower.at(-2)!, lower.at(-1)!, point) <= 0)
      lower.pop();
    lower.push(point);
  }
  const upper: MapPosition[] = [];
  for (const point of [...sorted].reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2)!, upper.at(-1)!, point) <= 0)
      upper.pop();
    upper.push(point);
  }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  const center: MapPosition = [
    hull.reduce((sum, [x]) => sum + x, 0) / hull.length,
    hull.reduce((sum, [, y]) => sum + y, 0) / hull.length,
  ];
  const expanded = hull.map(([x, y]) => {
    const dx = x - center[0];
    const dy = y - center[1];
    const distance = Math.hypot(dx, dy) || 1;
    return [
      x + (dx / distance) * padding,
      y + (dy / distance) * padding,
    ] as MapPosition;
  });
  return [...expanded, expanded[0]!];
};

const BehavioralMapMapLayer = ({
  details,
  isGroupsVisible,
  isLinksVisible,
  isObservationsVisible,
  observations,
  links,
  personGroups,
  selectedGroupTargetLocalIds,
  selectedLinkTargetLocalIds,
  selectedLinkLocalId,
  selectedLinkSourceLocalId,
  selectedGroupLocalId,
  pendingPosition,
  onMapClick,
  onObservationClick,
  onLinkClick,
  onGroupClick,
  selectedObservationLocalId,
}: {
  details: Details;
  isGroupsVisible: boolean;
  isLinksVisible: boolean;
  isObservationsVisible: boolean;
  observations: BehavioralMapObservation[];
  personGroups: BehavioralMapGroup[];
  selectedGroupTargetLocalIds: string[];
  links: BehavioralMapLink[];
  selectedLinkTargetLocalIds: string[];
  selectedLinkLocalId: string | null;
  selectedLinkSourceLocalId: string | null;
  selectedGroupLocalId: string | null;
  pendingPosition: BehavioralMapPendingPosition | null;
  onMapClick: (position: [number, number]) => void;
  onObservationClick: (localId: string) => void;
  onLinkClick: (localId: string) => void;
  onGroupClick: (localId: string) => void;
  selectedObservationLocalId: string | null;
}) => {
  const map = useContext(MapContext);
  const groupSource = useMemo(() => new VectorSource<Feature<Geometry>>(), []);
  const groupLayer = useMemo(
    () =>
      new VectorLayer({
        source: groupSource,
        zIndex: 8,
        style: (feature) =>
          new Style({
            fill: new Fill({
              color:
                feature.get("isSelectedGroup") ?
                  "rgba(229, 57, 53, 0.16)"
                : "rgba(76, 175, 80, 0.16)",
            }),
            stroke: new Stroke({
              color: feature.get("isSelectedGroup") ? "#e53935" : "#2e7d32",
              width: 2,
            }),
            text: new Text({
              text: String(feature.get("label") ?? ""),
              font: "600 12px sans-serif",
              overflow: true,
              padding: [2, 4, 2, 4],
              backgroundFill: new Fill({ color: "rgba(255,255,255,0.9)" }),
              fill: new Fill({
                color: feature.get("isSelectedGroup") ? "#e53935" : "#1b5e20",
              }),
            }),
          }),
      }),
    [groupSource],
  );
  const linkSource = useMemo(
    () => new VectorSource<Feature<Geometry>>(),
    [],
  );
  const linkLayer = useMemo(
    () =>
      new VectorLayer({
        source: linkSource,
        zIndex: 9,
        style: (feature) =>
          new Style({
            stroke: new Stroke({
              color:
                feature.get("isSelectedLink") ? "#e53935" : "#8e24aa",
              width: 2,
            }),
            text: new Text({
              text: String(feature.get("description") ?? ""),
              font: "600 12px sans-serif",
              offsetY: feature.get("isSelfLink") ? -12 : -10,
              padding: [2, 4, 2, 4],
              backgroundFill: new Fill({ color: "rgba(255,255,255,0.9)" }),
              fill: new Fill({
                color:
                  feature.get("isSelectedLink") ? "#e53935" : "#6a1b9a",
              }),
            }),
          }),
      }),
    [linkSource],
  );
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
          const isRelatedToSelectedLink =
            feature.get("isRelatedToSelectedLink") === true;
          const isSelectedGroupMember =
            feature.get("isSelectedGroupMember") === true;
          const isLinkTarget =
            feature.get("isLinkTarget") === true;
          const isGroupTarget = feature.get("isGroupTarget") === true;
          const isLinkSource =
            feature.get("isLinkSource") === true;
          const color =
            (
              isDraft ||
              isSelected ||
              isRelatedToSelectedLink ||
              isSelectedGroupMember ||
              isGroupTarget ||
              isLinkTarget
            ) ?
              "#e53935"
            : "#1976d2";
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
          const linkSourceStyle = new Style({
            image: new Icon({
              src: linkSourceIconSrc,
              scale: 0.6,
              anchor: [0.5, 0.5],
            }),
          });
          if (quantity === 1) {
            return isLinkSource ?
                [pointStyle, linkSourceStyle]
              : pointStyle;
          }

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
          return isLinkSource ?
              [pointStyle, linkSourceStyle, quantityBadgeStyle]
            : [pointStyle, quantityBadgeStyle];
        },
      }),
    [observationSource],
  );

  useEffect(() => {
    groupLayer.setVisible(isGroupsVisible);
  }, [groupLayer, isGroupsVisible]);

  useEffect(() => {
    linkLayer.setVisible(isLinksVisible);
  }, [linkLayer, isLinksVisible]);

  useEffect(() => {
    if (!map) return;
    map.addLayer(groupLayer);
    return () => {
      map.removeLayer(groupLayer);
    };
  }, [groupLayer, map]);

  useEffect(() => {
    if (!map) return;
    map.addLayer(linkLayer);
    return () => {
      map.removeLayer(linkLayer);
    };
  }, [linkLayer, map]);

  useEffect(() => {
    const observationsByGroup = new Map<string, BehavioralMapObservation[]>();
    observations.forEach((observation) => {
      observation.groupLocalIds.forEach((groupLocalId) => {
        const members = observationsByGroup.get(groupLocalId) ?? [];
        members.push(observation);
        observationsByGroup.set(groupLocalId, members);
      });
    });

    const features = personGroups.flatMap((group) => {
      const members = observationsByGroup.get(group.localId) ?? [];
      if (members.length === 0) return [];
      const points = members.map(({ position }) => position);
      const ring = createGroupOutline(points);
      const feature = new Feature<Geometry>({
        geometry: new Polygon([ring]),
      });
      feature.set("label", group.label);
      feature.set("groupLocalId", group.localId);
      feature.set("isSelectedGroup", group.localId === selectedGroupLocalId);
      return [feature];
    });
    groupSource.clear(true);
    groupSource.addFeatures(features);
  }, [groupSource, observations, personGroups, selectedGroupLocalId]);

  useEffect(() => {
    const observationsById = new Map(
      observations.map((observation) => [observation.localId, observation]),
    );
    const features = links.flatMap((link) => {
      const source = observationsById.get(link.observationALocalId);
      const target = observationsById.get(link.observationBLocalId);
      if (!source || !target) return [];
      let coordinates: [number, number][] = [source.position, target.position];
      if (source.localId === target.localId) {
        const [x, y] = source.position;
        const radius = 0.000018;
        coordinates = Array.from({ length: 25 }, (_, index) => {
          const angle = -Math.PI / 2 + (index / 24) * 2 * Math.PI;
          return [
            x + Math.cos(angle) * radius,
            y + radius + Math.sin(angle) * radius,
          ];
        });
      }
      const feature = new Feature<Geometry>({
        geometry: new LineString(coordinates),
      });
      feature.set("linkLocalId", link.localId);
      feature.set(
        "isSelectedLink",
        link.localId === selectedLinkLocalId,
      );
      feature.set("description", link.description);
      feature.set("isSelfLink", source.localId === target.localId);
      return [feature];
    });
    linkSource.clear(true);
    linkSource.addFeatures(features);
  }, [
    links,
    linkSource,
    observations,
    selectedLinkLocalId,
    selectedGroupLocalId,
  ]);

  useEffect(() => {
    observationLayer.setVisible(isObservationsVisible);
  }, [isObservationsVisible, observationLayer]);

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
        isRelatedToSelectedLink: links.some(
          (link) =>
            link.localId === selectedLinkLocalId &&
            (link.observationALocalId === observation.localId ||
              link.observationBLocalId === observation.localId),
        ),
        isLinkTarget: selectedLinkTargetLocalIds.includes(
          observation.localId,
        ),
        isGroupTarget: selectedGroupTargetLocalIds.includes(
          observation.localId,
        ),
        isLinkSource:
          observation.localId === selectedLinkSourceLocalId,
        isSelectedGroupMember:
          selectedGroupLocalId !== null &&
          observation.groupLocalIds.includes(selectedGroupLocalId),
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
    selectedLinkTargetLocalIds,
    selectedGroupTargetLocalIds,
    selectedLinkSourceLocalId,
    selectedGroupLocalId,
    selectedLinkLocalId,
    links,
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

      const linkLocalId = map.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) => {
          if (layer !== linkLayer) return undefined;
          return feature.get("linkLocalId");
        },
        { layerFilter: (layer) => layer === linkLayer, hitTolerance: 6 },
      );
      if (typeof linkLocalId === "string") {
        onLinkClick(linkLocalId);
        return;
      }

      const groupLocalId = map.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) =>
          layer === groupLayer ? feature.get("groupLocalId") : undefined,
        { layerFilter: (layer) => layer === groupLayer },
      );
      if (typeof groupLocalId === "string") {
        onGroupClick(groupLocalId);
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

      const clickableLink = map.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) =>
          (
            layer === linkLayer &&
            typeof feature.get("linkLocalId") === "string"
          ) ?
            feature
          : undefined,
        {
          layerFilter: (layer) => layer === linkLayer,
          hitTolerance: 6,
        },
      );
      const clickableGroup = map.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) =>
          (
            layer === groupLayer &&
            typeof feature.get("groupLocalId") === "string"
          ) ?
            feature
          : undefined,
        {
          layerFilter: (layer) => layer === groupLayer,
        },
      );
      const currentTarget = map.getTargetElement();
      if (currentTarget) {
        currentTarget.style.cursor =
          clickableObservation || clickableLink || clickableGroup ?
            "pointer"
          : originalCursor;
      }
    });

    return () => {
      unByKey([listenerKey, pointerMoveKey]);
      const currentTarget = map.getTargetElement();
      if (currentTarget) currentTarget.style.cursor = originalCursor;
    };
  }, [
    map,
    observationLayer,
    linkLayer,
    groupLayer,
    onMapClick,
    onObservationClick,
    onLinkClick,
    onGroupClick,
  ]);

  return null;
};

export default BehavioralMapMapLayer;
