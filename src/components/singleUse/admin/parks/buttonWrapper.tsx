"use client";

import { Button } from "@/components/ui/button";
import { adicionarContagem } from "@/lib/serverActions/adicionarContagem";
import { adicionarPessoaNaContagem } from "@/lib/serverActions/adicionarPessoaNaContagem";
import { cadastrarLocal } from "@/lib/serverActions/cadastrarLocal";
import { consultarLocal } from "@/lib/serverActions/consultarLocal";

const ButtonWrapper = () => {
  let content = {
    nome: "nome da praca",
    endereco: {},
    avaliacao: {},
    tipo: "PRACA",
    categoriaEspacoLivre: "ESPACO_LIVRE_PUBLICO_USO_COLETIVO",
  };

  let idConsulta = 5;
  let localId: number = 0;
  let contagemId: number = 0;
  const handleAddContagem = (event: any) => {
    event.preventDefault();
    adicionarContagem(localId, { quantidadeAnimais: 0, temperatura: 30.0, pessoaNoLocal: {} });
  };

  const handleAddPessoa = (event: any) => {
    event.preventDefault();
    adicionarPessoaNaContagem(localId, contagemId, { classificacaoEtaria: 3, genero: 2, atividadeFisica: 0 });
  };

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
      <Button onClick={() => cadastrarLocal(content, {})}>Cadastrar</Button>
      <Button onClick={() => consultarLocal(idConsulta)}>Consultar</Button>
      <br></br>
      <label htmlFor="id_contagem">Id da praça para a contagem: </label>

      <input
        type="number"
        name="localIdInput"
        onChange={(e) => {
          localId = parseInt(e.target.value);
        }}
      />
      <Button
        type="submit"
        onClick={() => {
          adicionarContagem(localId, { quantidadeAnimais: 0, temperatura: 30.0, pessoaNoLocal: {} });
        }}
      >
        Adicionar contagem
      </Button>

      <br></br>
      <label>Id da contagem:</label>

      <input
        type="number"
        name="ContagemIdInput"
        onChange={(e) => {
          contagemId = parseInt(e.target.value);
        }}
      />
      <Button
        type="submit"
        onClick={() => {
          adicionarPessoaNaContagem(localId, contagemId, { classificacaoEtaria: 3, genero: 2, atividadeFisica: 0 });
        }}
      >
        Adicionar pessoa
      </Button>
    </>
  );
};

export { ButtonWrapper };
