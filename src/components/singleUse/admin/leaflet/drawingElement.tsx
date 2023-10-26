import { PolygonContext } from "@/components/singleUse/admin/leaflet/createPolygon";
import { useContext } from "react";
import { Polygon, useMapEvents } from "react-leaflet";

const DrawingElement = () => {
  const { polygonContext, setPolygonContext } = useContext(PolygonContext);

  // Constante mágica do react-leaflet que faz o handler dentro dele ser interpretado
  const map = useMapEvents({
    click: (mouseEvent) => {
      setPolygonContext(
        polygonContext == null
          ? [{ lat: mouseEvent.latlng.lat, lng: mouseEvent.latlng.lng }]
          : [...polygonContext, { lat: mouseEvent.latlng.lat, lng: mouseEvent.latlng.lng }],
      );
    },
  });

  // Não é necessário retornar nada para a função mágica funcionar
  return polygonContext == null ? null : <Polygon positions={polygonContext} color={"#E7A1FF"} />;
};

export { DrawingElement };
