"use client";

import { Button } from "@/components/button";
import { ResponseGeometry } from "@customTypes/assessments/geometry";
import { IconX } from "@tabler/icons-react";
import { IconMap } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { Coordinate } from "ol/coordinate";
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from "react-aria-components";

const MapProvider = dynamic(() => import("./MapProvider"), { ssr: false });

const MapPopup = ({
  questionName,
  initialGeometries,
}: {
  questionName: string;
  initialGeometries:
    | { assessmentId: number; questionId: number; geometry: string | null }[]
    | undefined;
}) => {
  const geometries = initialGeometries?.map((fetchedGeometry) => {
    const { questionId, geometry } = fetchedGeometry;
    if (!geometry) {
      return { questionId, geometries: [] };
    }
    const geometries: ResponseGeometry[] = [];
    const geometriesWithoutCollection = geometry
      .replace("GEOMETRYCOLLECTION(", "")
      .slice(0, -1);
    const regex = /(?:POINT|POLYGON)\([^)]*\)+/g;
    const geometriesStrs = geometriesWithoutCollection.match(regex);
    if (geometriesStrs) {
      for (const geometry of geometriesStrs) {
        if (geometry.startsWith("POINT")) {
          const geometryPointsStr = geometry
            .replace("POINT(", "")
            .replace(")", "");
          const geometryPoints = geometryPointsStr.split(" ");
          const geometryPointsNumber: number[] = [];
          for (const geo of geometryPoints) {
            geometryPointsNumber.push(Number(geo));
          }
          geometries.push({
            type: "Point",
            coordinates: geometryPointsNumber,
          });
        } else if (geometry.startsWith("POLYGON")) {
          const geometryRingsStr = geometry
            .replace("POLYGON(", " ")
            .slice(0, -1);
          const ringsStrs = geometryRingsStr.split("),(");
          const ringsCoordinates: Coordinate[][] = [];
          for (const ring of ringsStrs) {
            const geometryPointsStr = ring.split(",");
            const geometryPointsCoordinates: Coordinate[] = [];
            for (const point of geometryPointsStr) {
              const pointClean = point.replace("(", "").replace(")", "").trim();
              const geometryPoints = pointClean.split(" ");
              const geometryPointsNumber: number[] = [];
              for (const geo of geometryPoints) {
                geometryPointsNumber.push(Number(geo));
              }
              geometryPointsCoordinates.push(geometryPointsNumber);
            }
            ringsCoordinates.push(geometryPointsCoordinates);
          }
          geometries.push({ type: "Polygon", coordinates: ringsCoordinates });
        }
      }
    }

    return { questionId, geometries: geometries };
  });

  return (
    <DialogTrigger>
      <Button className="items-center p-2">
        <IconMap />
      </Button>
      {
        <ModalOverlay
          className={({ isEntering, isExiting }) =>
            `fixed inset-0 z-40 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 text-center backdrop-blur ${
              isEntering ? "duration-300 ease-out animate-in fade-in" : ""
            } ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""}`
          }
          isDismissable
        >
          <Modal
            className={({ isEntering, isExiting }) =>
              `h-full max-h-full w-full overflow-scroll rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
                isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
              } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
            }
          >
            <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
              {({ close }) => (
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <h4 className="text-2xl">{`${questionName}`}</h4>
                    <Button
                      className="ml-auto text-black"
                      variant={"ghost"}
                      size={"icon"}
                      onPress={() => {
                        close();
                      }}
                    >
                      <IconX />
                    </Button>
                  </div>

                  <div className="h-[75vh] w-full rounded-lg bg-gray-200 ring-2 ring-gray-300">
                    <MapProvider
                      initialGeometries={geometries?.flatMap(
                        (geo) => geo.geometries,
                      )}
                    ></MapProvider>
                  </div>
                </div>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      }
    </DialogTrigger>
  );
};

export { MapPopup };
