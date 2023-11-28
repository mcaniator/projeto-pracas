"use client";

import { cadastrar } from "@/lib/serverActions/cadastrar";

const AdminRoot = () => {
  let content = {
    nome: "nome da praca",
    endereco: {},
    avaliacao: {},
    tipo: "PRACA",
    categoriaEspacoLivre: "ESPACO_LIVRE_PUBLICO_USO_COLETIVO",
  };

  return (
    <div>
      <p>início temporário</p>
      {
        <button
          onClick={() =>
            (content = {
              nome: "praça sao matheus",
              endereco: {},
              avaliacao: {},
              tipo: "PRACA",
              categoriaEspacoLivre: "ESPACO_LIVRE_PUBLICO_USO_COLETIVO",
            })
          }
        >
          Mudar nome
        </button>
      }
      <button onClick={() => cadastrar(content)}>Cadastrar</button>
    </div>
  );
};

export default AdminRoot;
