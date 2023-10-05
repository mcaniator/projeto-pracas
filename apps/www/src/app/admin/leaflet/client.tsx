"use client";

/* O Leaflet não foi feito para ser usado com React e o adaptador sendo usado nesse projeto
 * não faz um trabalho bom o suficiente para fazer o código integrar com o ambiente do React,
 * por isso esse código está bem confuso e cheio de gambiarra, não necessariamente porque ele
 * está mal feito, mas porque não há um jeito melhor de fazer o que está sendo feito. */
import { mapSubmition } from "@/actions/submition";
import { josefin_sans } from "@/app/fonts";
import { localsResponse } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import {
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import Control from "react-leaflet-custom-control";

const LeafletClient = ({ parkData }: { parkData: localsResponse[] }) => {
  const [drawingActive, setDrawingActive] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<
    LatLngExpression[] | null
  >(null);

  const DrawingElement = () => {
    // Constante mágica do react-leaflet que faz o handler dentro dele ser interpretado
    const map = useMapEvents({
      click: (mouseEvent) => {
        setCurrentPolygon(
          currentPolygon == null
            ? [{ lat: mouseEvent.latlng.lat, lng: mouseEvent.latlng.lng }]
            : [
                ...currentPolygon,
                { lat: mouseEvent.latlng.lat, lng: mouseEvent.latlng.lng },
              ],
        );
      },
    });

    // Não é necessário retornar nada para a função mágica funcionar
    return currentPolygon == null ? null : (
      <Polygon positions={currentPolygon} color={"#E7A1FF"} />
    );
  };

  return (
    <div className={"h-full w-full"}>
      <MapContainer
        center={[-21.7642, -43.3496]}
        zoom={16}
        scrollWheelZoom={true}
        className={"h-full w-full rounded-tl-3xl shadow-lg"}
        touchZoom={true}
      >
        {/* Gambiarra para esconder o botão dependendo do estado
            O React-Leaflet não expõe os componentes diretamente para a Virtual DOM do React, portanto
            eles não podem ser dinamicamente removidos/inseridos, assim o children do elemento que
            deve ser ocultado */}
        <div>
          <Control position={"topleft"}>
            {!drawingActive && (
              <Button
                onClick={() => {
                  setDrawingActive(true);
                }}
                className={josefin_sans.className}
              >
                Criar Polígono
              </Button>
            )}
          </Control>

          <Control position={"topleft"}>
            {drawingActive && (
              <Dialog>
                <DialogTrigger
                  asChild
                  disabled={
                    currentPolygon?.length == undefined ||
                    currentPolygon?.length <= 2
                  }
                >
                  <Button className={josefin_sans.className}>
                    Salvar Polígono
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Praça</DialogTitle>
                    <DialogDescription>
                      <form>
                        <Input type={"text"} name={"name"} required />
                        <Input type={"text"} name={"common name"} required />
                      </form>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
          </Control>

          <Control position={"topleft"}>
            {drawingActive && (
              <Button
                onClick={() => {
                  setDrawingActive(false);
                  setCurrentPolygon(null);
                }}
                className={josefin_sans.className}
              >
                Descartar Polígono
              </Button>
            )}
          </Control>
        </div>

        {/* Deve estar acima do componente TileLayer se não não faz nada */}
        {drawingActive && <DrawingElement />}

        {parkData.map((value, index) => (
          <div key={index}>
            {value.polygon.coordinates.map((value, key) => (
              <Polygon key={key} positions={value} color={"#8FBC94"}>
                {!drawingActive && (
                  <Popup>
                    <p>temp</p>
                  </Popup>
                )}
              </Polygon>
            ))}
          </div>
        ))}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default LeafletClient;
