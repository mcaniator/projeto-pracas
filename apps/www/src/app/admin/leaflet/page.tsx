/* O Leaflet não foi feito para ser usado com React e o adaptador sendo usado nesse projeto
 * não faz um trabalho bom o suficiente para fazer o código integrar com o ambiente do React,
 * por isso esse código está bem confuso e cheio de gambiarra, não necessariamente porque ele
 * está mal feito, mas porque não há um jeito melhor de fazer o que está sendo feito. */
import CreatePolygon from "@/app/admin/leaflet/elements/createPolygon";
import { EditPolygon } from "@/app/admin/leaflet/elements/editPolygon";
import { addressResponse, localsResponse } from "@/app/types";
import dynamic from "next/dynamic";

// Tem que ser importado dinamicamente sem SSR para que ele não tente acessar o elemento Window no servidor
const LeafletProvider = dynamic(
  () => import("@/app/admin/leaflet/elements/leafletProvider"),
  {
    ssr: false,
  },
);

const LeafletRoot = async () => {
  const parkData: localsResponse[] = await fetch(
    "http://localhost:3333/locals",
    { next: { tags: ["locals"] } },
  ).then((res) => res.json());

  const addressData: addressResponse[] = await fetch(
    "http://localhost:3333/addresses",
    { next: { tags: ["locals"] } },
  ).then((res) => res.json());

  return (
    <LeafletProvider>
      <CreatePolygon />
      <EditPolygon parkData={parkData} addressData={addressData} />
    </LeafletProvider>
  );
};

export default LeafletRoot;
