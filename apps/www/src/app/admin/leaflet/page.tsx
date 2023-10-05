import { localsResponse } from "@/app/types";
import dynamic from "next/dynamic";

// Tem que ser importado dinamicamente sem SSR para que ele não tente acessar o elemento Window no servidor
const LeafletClient = dynamic(() => import("@/app/admin/leaflet/client"), {
  ssr: false,
});

/* O Next ainda não suporta funções assíncronas em client components por isso
 * o fetch deve ser feito no servidor e passado como prop para o cliente e não
 * por um route handler
 * TODO: Procurar um jeito melhor de fazer isso */
const LeafletRoot = async () => {
  const parkData: localsResponse[] = await fetch(
    "http://localhost:3333/locals",
    { cache: "no-store", next: { tags: ["locals"] } }, // REMEMBERME: Lembrar de remover no-store
  ).then((res) => res.json());

  return <LeafletClient parkData={parkData} />;
};

export default LeafletRoot;
