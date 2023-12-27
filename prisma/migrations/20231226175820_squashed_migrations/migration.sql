-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis" WITH VERSION "3.4.0";

-- CreateEnum
CREATE TYPE "dia_semana" AS ENUM ('Domingo', 'Segunda Feira', 'Terca Feira', 'Quarta Feira', 'Quinta Feira', 'Sexta Feira', 'Sabado');

-- CreateEnum
CREATE TYPE "estados" AS ENUM ('Acre', 'Alagoas', 'Amapa', 'Amazonas', 'Bahia', 'Ceara', 'Distrito Federal', 'Espirito Santo', 'Goias', 'Maranhao', 'Matro Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Para', 'Paraiba', 'Parana', 'Pernambuco', 'Piaui', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondonia', 'Roraima', 'Santa Catarina', 'Sao Paulo', 'Sergipe', 'Tocantins');

-- CreateEnum
CREATE TYPE "tipos_local" AS ENUM ('Canteiros Centrais e Laterais de Porte', 'Cantos de Quadra', 'Jardim', 'Largo', 'Mirante', 'Praca', 'Praca Cercada', 'Terreno Não Ocupado', 'Terrenos Remanescentes de Sistema Viario/Parcelamento de Solo', 'Rotatorio', 'Trevo');

-- CreateEnum
CREATE TYPE "tipos_usuario" AS ENUM ('ADMIN', 'PESQUISADOR');

-- CreateEnum
CREATE TYPE "categorias_espaco_livre" AS ENUM ('de Praticas Sociais', 'Espaco Livre Privado de Uso Coletivo');

-- CreateEnum
CREATE TYPE "question_types" AS ENUM ('Text', 'Numeric', 'Options');

-- CreateEnum
CREATE TYPE "option_types" AS ENUM ('selection', 'radio', 'checkbox');

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" "question_types" NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_question" (
    "id" SERIAL NOT NULL,
    "char_limit" INTEGER,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "text_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numeric_question" (
    "id" SERIAL NOT NULL,
    "min" INTEGER,
    "max" INTEGER,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "numeric_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options_question" (
    "id" SERIAL NOT NULL,
    "option_type" "option_types" NOT NULL,
    "maximum_selections" INTEGER,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "options_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "options_question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "e_praca" BOOLEAN,
    "observacoes" TEXT,
    "ano_criacao" DATE,
    "ano_reforma" DATE,
    "prefeito_criacao" VARCHAR(255),
    "legislacao" VARCHAR(255),
    "area_util" DOUBLE PRECISION,
    "area_prefeitura" DOUBLE PRECISION,
    "inclinacao" DOUBLE PRECISION,
    "regiao_urbana" VARCHAR(255),
    "invativo_nao_localizado" BOOLEAN,
    "poligono_area" DOUBLE PRECISION,
    "delimitacao_administrativa_menos_ampla" TEXT,
    "delimitacao_administrativa_mais_ampla" TEXT,
    "tipo" "tipos_local" NOT NULL,
    "poligono" Geometry(MultiPolygon, 4326),
    "categoria_espaco_livre" "categorias_espaco_livre",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endereco" (
    "id" SERIAL NOT NULL,
    "bairro" VARCHAR(255) NOT NULL,
    "rua" VARCHAR(255) NOT NULL,
    "cep" VARCHAR(255) NOT NULL,
    "numero" INTEGER NOT NULL,
    "local_id" INTEGER NOT NULL,
    "cidade_id" INTEGER NOT NULL,
    "estado" "estados" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "endereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cidade" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "cidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regiao" (
    "id" SERIAL NOT NULL,
    "regiao" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regiao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacao" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "dia_semana" "dia_semana" NOT NULL,
    "inicio" TIMETZ(0) NOT NULL,
    "fim" TIMETZ(0) NOT NULL,
    "alteracao_limites" BOOLEAN,
    "calcada_pavimentada" BOOLEAN NOT NULL,
    "conservacao_calcada" INTEGER NOT NULL,
    "wifi" BOOLEAN NOT NULL,
    "quantidade_lixeiras" INTEGER NOT NULL,
    "conservacao_lixeiras" INTEGER NOT NULL,
    "quantidade_banheiro" INTEGER NOT NULL,
    "conservacao_banheiro" INTEGER NOT NULL,
    "quantidade_telefone_publico" INTEGER NOT NULL,
    "conservacao_telefone_publico" INTEGER NOT NULL,
    "quantidade_bebedouro" INTEGER NOT NULL,
    "conservacao_bebedouro" INTEGER NOT NULL,
    "quantidade_obra_arte" INTEGER NOT NULL,
    "conservacao_obra_arte" INTEGER NOT NULL,
    "quantidade_paisagismo_planejado" INTEGER NOT NULL,
    "conservacao_paisagismo_planejado" INTEGER NOT NULL,
    "quantidade_cadeira_moveis" INTEGER NOT NULL,
    "conservacao_cadeira_moveis" INTEGER NOT NULL,
    "local_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" "tipos_usuario" NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acessibilidade" (
    "id" SERIAL NOT NULL,
    "calcada_entorno_faixa_livre" BOOLEAN NOT NULL,
    "calcada_entrono_faixa_servico" BOOLEAN NOT NULL,
    "altura_livre" BOOLEAN NOT NULL,
    "travessia_rebaixamento" BOOLEAN NOT NULL,
    "ausencia_obstaculos" BOOLEAN NOT NULL,
    "iclinacao_max" BOOLEAN NOT NULL,
    "inclinacao_longitudinal" BOOLEAN NOT NULL,
    "sinalizacao_tatil" BOOLEAN NOT NULL,
    "revestimento_piso" BOOLEAN NOT NULL,
    "vagas_pcd" INTEGER NOT NULL,
    "vagas_idosos" INTEGER NOT NULL,
    "rota_acessivel" BOOLEAN NOT NULL,
    "equipamento_adaptado" BOOLEAN NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acessibilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acesso_entorno" (
    "id" SERIAL NOT NULL,
    "cerca_horario_funcionamento" BOOLEAN NOT NULL,
    "placa_identificacao" BOOLEAN NOT NULL,
    "baias_onibus" INTEGER NOT NULL,
    "vagas_taxi" INTEGER NOT NULL,
    "vagas_carro" INTEGER NOT NULL,
    "vagas_moto" INTEGER NOT NULL,
    "ciclovia" BOOLEAN NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acesso_entorno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_atividades" (
    "id" SERIAL NOT NULL,
    "categoria" INTEGER NOT NULL,
    "sombra_minima" BOOLEAN NOT NULL,
    "iluminacao" BOOLEAN NOT NULL,
    "cercado" BOOLEAN NOT NULL,
    "bancos" BOOLEAN NOT NULL,
    "conservacao" INTEGER NOT NULL,
    "descricao" TEXT,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depredacao" (
    "id" SERIAL NOT NULL,
    "nivel_pichacao" INTEGER NOT NULL,
    "nivel_abandono" INTEGER NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "depredacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elementos_paisagisticos" (
    "id" SERIAL NOT NULL,
    "categoria" INTEGER NOT NULL,
    "sombra_minima" BOOLEAN NOT NULL,
    "iluminacao" BOOLEAN NOT NULL,
    "cercado" BOOLEAN NOT NULL,
    "bancos" BOOLEAN NOT NULL,
    "conservacao" INTEGER NOT NULL,
    "descricao" TEXT,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elementos_paisagisticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "espacos_assento" (
    "id" SERIAL NOT NULL,
    "categoria" INTEGER NOT NULL,
    "sombra_minima" BOOLEAN NOT NULL,
    "iluminacao" BOOLEAN NOT NULL,
    "cercado" BOOLEAN NOT NULL,
    "bancos" BOOLEAN NOT NULL,
    "conservacao" INTEGER NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "espacos_assento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" SERIAL NOT NULL,
    "frequencia_ultimo_ano" INTEGER NOT NULL,
    "categoria" INTEGER NOT NULL,
    "nome_responsavel" VARCHAR(255) NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguranca_viaria" (
    "id" SERIAL NOT NULL,
    "faixa_pedestre" BOOLEAN NOT NULL,
    "semaforo" BOOLEAN NOT NULL,
    "placas_velocidade" BOOLEAN NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seguranca_viaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uso_densidade_entorno" (
    "id" SERIAL NOT NULL,
    "uso_edificacoes" TEXT NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uso_densidade_entorno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vigilancia" (
    "id" SERIAL NOT NULL,
    "cameras" BOOLEAN NOT NULL,
    "posto_policial" BOOLEAN NOT NULL,
    "nivel_visibilidade" INTEGER NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vigilancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contagem" (
    "id" SERIAL NOT NULL,
    "data" DATE,
    "inicio" TIMESTAMPTZ(0),
    "fim" TIMESTAMPTZ(0),
    "quantidade_animais" INTEGER,
    "temperatura" DOUBLE PRECISION,
    "condicao_ceu" TEXT,
    "local_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoa_no_local" (
    "id" SERIAL NOT NULL,
    "classificacao_etaria" INTEGER,
    "genero" INTEGER,
    "atividade_fisica" INTEGER,
    "passando" BOOLEAN,
    "pessoa_deficiente" BOOLEAN,
    "atividade_ilicita" BOOLEAN,
    "situacao_rua" BOOLEAN,
    "contagem_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pessoa_no_local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruido" (
    "id" SERIAL NOT NULL,
    "nivel_db" DOUBLE PRECISION NOT NULL,
    "categoria" VARCHAR(255) NOT NULL,
    "local_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ruido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CidadeToRegiao" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AvaliacaoToUsuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "text_question_question_id_key" ON "text_question"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "numeric_question_question_id_key" ON "numeric_question"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "options_question_question_id_key" ON "options_question"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "cidade_nome_key" ON "cidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "acessibilidade_avaliacao_id_key" ON "acessibilidade"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "acesso_entorno_avaliacao_id_key" ON "acesso_entorno"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "area_atividades_avaliacao_id_key" ON "area_atividades"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "depredacao_avaliacao_id_key" ON "depredacao"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "elementos_paisagisticos_avaliacao_id_key" ON "elementos_paisagisticos"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "espacos_assento_avaliacao_id_key" ON "espacos_assento"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_avaliacao_id_key" ON "eventos"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "seguranca_viaria_avaliacao_id_key" ON "seguranca_viaria"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "uso_densidade_entorno_avaliacao_id_key" ON "uso_densidade_entorno"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "vigilancia_avaliacao_id_key" ON "vigilancia"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "contagem_local_id_key" ON "contagem"("local_id");

-- CreateIndex
CREATE UNIQUE INDEX "ruido_local_id_key" ON "ruido"("local_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CidadeToRegiao_AB_unique" ON "_CidadeToRegiao"("A", "B");

-- CreateIndex
CREATE INDEX "_CidadeToRegiao_B_index" ON "_CidadeToRegiao"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AvaliacaoToUsuario_AB_unique" ON "_AvaliacaoToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_AvaliacaoToUsuario_B_index" ON "_AvaliacaoToUsuario"("B");

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_question" ADD CONSTRAINT "text_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numeric_question" ADD CONSTRAINT "numeric_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_question" ADD CONSTRAINT "options_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option" ADD CONSTRAINT "option_options_question_id_fkey" FOREIGN KEY ("options_question_id") REFERENCES "options_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_cidade_id_fkey" FOREIGN KEY ("cidade_id") REFERENCES "cidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacao" ADD CONSTRAINT "avaliacao_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "acessibilidade" ADD CONSTRAINT "acessibilidade_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acesso_entorno" ADD CONSTRAINT "acesso_entorno_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_atividades" ADD CONSTRAINT "area_atividades_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depredacao" ADD CONSTRAINT "depredacao_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elementos_paisagisticos" ADD CONSTRAINT "elementos_paisagisticos_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "espacos_assento" ADD CONSTRAINT "espacos_assento_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguranca_viaria" ADD CONSTRAINT "seguranca_viaria_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uso_densidade_entorno" ADD CONSTRAINT "uso_densidade_entorno_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vigilancia" ADD CONSTRAINT "vigilancia_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contagem" ADD CONSTRAINT "contagem_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoa_no_local" ADD CONSTRAINT "pessoa_no_local_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruido" ADD CONSTRAINT "ruido_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CidadeToRegiao" ADD CONSTRAINT "_CidadeToRegiao_A_fkey" FOREIGN KEY ("A") REFERENCES "cidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CidadeToRegiao" ADD CONSTRAINT "_CidadeToRegiao_B_fkey" FOREIGN KEY ("B") REFERENCES "regiao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvaliacaoToUsuario" ADD CONSTRAINT "_AvaliacaoToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvaliacaoToUsuario" ADD CONSTRAINT "_AvaliacaoToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
