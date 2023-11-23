"use client";

import { useState } from "react";

import cadastrar from "./cadastrar";

const AdminRoot = () => {
  const [content, setContent] = useState({
    nome: "nome da praca",
    endereco: {},
    avaliacao: {},
    tipo: "PRACA",
    categoriaEspacoLivre: "ESPACO_LIVRE_PUBLICO_USO_COLETIVO",
  });

  return (
    <div>
      <p>início temporário</p>
      {
        <button
          onClick={() =>
            setContent({
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
