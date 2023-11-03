/* O Leaflet não foi feito para ser usado com React e o adaptador sendo usado nesse projeto
   não faz um trabalho bom o suficiente para fazer o código integrar com o ambiente do React,
   por isso esse código está bem confuso e cheio de gambiarra, não necessariamente porque ele
   está mal feito, mas porque não há um jeito melhor de fazer o que está sendo feito. */
import { CreatePolygon } from "@/components/singleUse/admin/leaflet/createPolygon";
import { EditPolygon } from "@/components/singleUse/admin/leaflet/editPolygon";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

// Tem que ser importado dinamicamente sem SSR para que ele não tente acessar o elemento Window no servidor
const LeafletProvider = dynamic(() => import("@/components/singleUse/admin/leaflet/leafletProvider"), {
  ssr: false,
});

const LeafletRoot = async () => {
  const localsData = await prisma.locals.findMany();

  const polygons: { type: string; coordinates: [number, number][][] }[] = await prisma.$queryRaw<
    { st_asgeojson: string }[]
  >`SELECT ST_AsGeoJSON(polygon) FROM locals`.then((result) => result.map((value) => JSON.parse(value.st_asgeojson)));

  const parkData = localsData.map((value, index) => ({ polygon: polygons[index].coordinates[0], ...value }));
  const addressData = await prisma.addresses.findMany();

  return (
    <LeafletProvider>
      <CreatePolygon />
      <EditPolygon parkData={parkData} addressData={addressData} />
    </LeafletProvider>
  );
};

export default LeafletRoot;
