"use client";

import { Button } from "@/components/ui/button";
import { cadastrar } from "@/lib/serverActions/cadastrar";
import { consultar } from "@/lib/serverActions/consultar";

const ButtonWrapper = () => {
  let content = {
    nome: "nome da praca",
    endereco: {},
    avaliacao: {},
    tipo: "PRACA",
    categoriaEspacoLivre: "ESPACO_LIVRE_PUBLICO_USO_COLETIVO",
  };

  let idConsulta = 5;

  return (
    <>
      <Button
        onClick={() =>
          (content = {
            nome: "praça são matheus",
            endereco: {},
            avaliacao: {},
            tipo: "PRACA",
            categoriaEspacoLivre: "ESPACO_LIVRE_PUBLICO_USO_COLETIVO",
          })
        }
      >
        Mudar nome
      </Button>
      <Button onClick={() => cadastrar(content)}>Cadastrar</Button>
      <Button onClick={() => consultar(idConsulta)}>Consultar</Button>
    </>
  );
};

export { ButtonWrapper };
