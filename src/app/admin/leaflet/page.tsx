/**
 * O Leaflet não foi feito para ser usado com React e o adaptador sendo usado nesse projeto
 * não faz um trabalho bom o suficiente para fazer o código integrar com o ambiente do React,
 * por isso esse código está bem confuso e cheio de gambiarra, não necessariamente porque ele
 * está mal feito, mas porque não há um jeito melhor de fazer o que está sendo feito.
 **/
import { CenterButton } from "@/components/singleUse/admin/leaflet/centerButton";
import { CreatePolygon } from "@/components/singleUse/admin/leaflet/createPolygon";
import dynamic from "next/dynamic";

// Tem que ser importado dinamicamente sem SSR para que ele não tente acessar o elemento Window no servidor
const LeafletProvider = dynamic(
  () => import("@/components/singleUse/admin/leaflet/leafletProvider"),
  {
    ssr: false,
  },
);

const LeafletRoot = () => {
  // const localsData = await prisma.local.findMany();
  // const polygons = await fetchPolygons();
  //
  // console.log(polygons);
  // const parkData = localsData.map((value, index) => ({ polygon: polygons[index]?.coordinates[0], ...value }));
  // const addressData = await prisma.endereco.findMany();

  return (
    <LeafletProvider>
      <CreatePolygon />
      {/*<EditPolygon parkData={parkData} addressData={addressData} />*/}
      <CenterButton />
    </LeafletProvider>
  );
};

export default LeafletRoot;
