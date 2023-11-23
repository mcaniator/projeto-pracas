/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coutings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `form-structure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forms-fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `locals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `numericfield` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `optionfield` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `person_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `textfield` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_locals_id_fkey";

-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_forms_id_fkey";

-- DropForeignKey
ALTER TABLE "form-structure" DROP CONSTRAINT "form-structure_id_forms_fields_fkey";

-- DropForeignKey
ALTER TABLE "form-structure" DROP CONSTRAINT "form-structure_id_forms_fkey";

-- DropForeignKey
ALTER TABLE "forms-fields" DROP CONSTRAINT "forms-fields_category_id_fkey";

-- DropForeignKey
ALTER TABLE "numericfield" DROP CONSTRAINT "numericfield_id_field_fkey";

-- DropForeignKey
ALTER TABLE "option" DROP CONSTRAINT "option_id_optionfield_fkey";

-- DropForeignKey
ALTER TABLE "optionfield" DROP CONSTRAINT "optionfield_id_field_fkey";

-- DropForeignKey
ALTER TABLE "textfield" DROP CONSTRAINT "textfield_id_field_fkey";

-- DropTable
DROP TABLE "addresses";

-- DropTable
DROP TABLE "category";

-- DropTable
DROP TABLE "coutings";

-- DropTable
DROP TABLE "evaluations";

-- DropTable
DROP TABLE "form-structure";

-- DropTable
DROP TABLE "forms";

-- DropTable
DROP TABLE "forms-fields";

-- DropTable
DROP TABLE "locals";

-- DropTable
DROP TABLE "numericfield";

-- DropTable
DROP TABLE "option";

-- DropTable
DROP TABLE "optionfield";

-- DropTable
DROP TABLE "person_category";

-- DropTable
DROP TABLE "textfield";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "acessibilidade" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "calcadaEntornoFaixaLivre" BOOLEAN,
    "calcadaEntornoFaixaServico" BOOLEAN,
    "alturaLivre" BOOLEAN,
    "travessiaRebaixamento" BOOLEAN,
    "ausenciaObstaculos" BOOLEAN,
    "inclinacaoMax" BOOLEAN,
    "inclinacaoLongitudinal" BOOLEAN,
    "sinalizacaoTatil" BOOLEAN,
    "revestimentoPiso" BOOLEAN,
    "vagasPCD" INTEGER,
    "vagasIdosos" INTEGER,
    "rotaAcessivel" BOOLEAN,
    "equipamentoAdaptado" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "acessibilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areaAtividades" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "categoria" INTEGER,
    "sombraMinima" BOOLEAN,
    "iluminacao" BOOLEAN,
    "cercado" BOOLEAN,
    "bancos" BOOLEAN,
    "conservacao" INTEGER,
    "descricao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "areaAtividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacao" (
    "id" SERIAL NOT NULL,
    "local_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "data" DATE,
    "diaSemana" INTEGER,
    "inicio" TIME(0),
    "fim" TIME(0),
    "alteracaoLimites" BOOLEAN,
    "calcadaPavimentada" BOOLEAN,
    "conservacaoCalcada" INTEGER,
    "wifi" BOOLEAN,
    "qtdLixeiras" INTEGER,
    "conservacaoLixeiras" INTEGER,
    "qtdBanheiro" INTEGER,
    "conservacaoBanheiro" INTEGER,
    "qtdTelefonePublico" INTEGER,
    "conservacaoTelefonePublico" INTEGER,
    "qtdBededouro" INTEGER,
    "conservacaoBededouro" INTEGER,
    "qtdObraArte" INTEGER,
    "conservacaoObraArte" INTEGER,
    "qtdPaisagismoPlanejado" INTEGER,
    "conservacaoPaisagismoPlanejado" INTEGER,
    "qtdCadeiraMoveis" INTEGER,
    "conservacaoCadeiraMoveis" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acessoEntorno" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "cercaHorarioFuncionamento" BOOLEAN,
    "placaIdentificacao" BOOLEAN,
    "baiasOnibus" INTEGER,
    "vagasTaxi" INTEGER,
    "vagasCarro" INTEGER,
    "vagasMoto" INTEGER,
    "ciclovia" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "acessoEntorno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contagem" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "data" DATE,
    "inicio" TIMESTAMP(3),
    "fim" TIMESTAMP(3),
    "qtdAnimais" INTEGER,
    "temperatura" DOUBLE PRECISION,
    "condicaoCeu" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "contagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depredacao" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "nivelPichacao" INTEGER,
    "nivelAbandono" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "depredacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elementosPaisagisticos" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "categoria" INTEGER,
    "sombraMinima" BOOLEAN,
    "iluminacao" BOOLEAN,
    "cercado" BOOLEAN,
    "bancos" BOOLEAN,
    "conservacao" INTEGER,
    "descricao" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "elementosPaisagisticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endereco" (
    "id" SERIAL NOT NULL,
    "local_id" INTEGER NOT NULL,
    "UF" VARCHAR(255),
    "cidade" VARCHAR(255),
    "bairro" VARCHAR(255),
    "rua" VARCHAR(255),
    "CEP" VARCHAR(255),
    "numero" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "endereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "espacosAssento" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "categoria" INTEGER,
    "sombraMinima" BOOLEAN,
    "iluminacao" BOOLEAN,
    "cercado" BOOLEAN,
    "bancos" BOOLEAN,
    "conservacao" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "espacosAssento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feira" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "frequenciaUltimoAno" INTEGER,
    "categoria" INTEGER,
    "nomeResponsavel" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" INTEGER NOT NULL,
    "categoriaEspacoLivre" INTEGER NOT NULL,
    "observacoes" TEXT,
    "anoCriacao" VARCHAR(255),
    "anoReforma" VARCHAR(255),
    "prefeitoCriacao" VARCHAR(255),
    "legislacao" VARCHAR(255),
    "areaUtil" DOUBLE PRECISION,
    "areaPrefeitura" DOUBLE PRECISION,
    "inclinacao" DOUBLE PRECISION,
    "regiaoUrbana" DOUBLE PRECISION,
    "inativoNaoLocalizado" BOOLEAN,
    "poligono" Geometry(MultiPolygon, 4326),
    "poligonoArea" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoaNoLocal" (
    "id" SERIAL NOT NULL,
    "contagem_id" INTEGER NOT NULL,
    "classificacaoEtaria" INTEGER,
    "genero" INTEGER,
    "atividadeFisica" INTEGER,
    "passando" BOOLEAN,
    "pessoaDeficiente" BOOLEAN,
    "atividadeIlicita" BOOLEAN,
    "situacaoRua" BOOLEAN,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "pessoaNoLocal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruido" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "nivelDb" DOUBLE PRECISION,
    "categoria" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ruido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segurancaViaria" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "faixaPedestre" BOOLEAN,
    "semaforo" BOOLEAN,
    "placasVelocidade" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "segurancaViaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usoDensidadeEntorno" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "usoEdificacoes" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "usoDensidadeEntorno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "tipo" INTEGER NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vigilancia" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER NOT NULL,
    "cameras" BOOLEAN,
    "postoPolicial" BOOLEAN,
    "nivelVisibilidade" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "vigilancia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_avaliacaoTousuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "acessibilidade_avaliacao_id_key" ON "acessibilidade"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "areaAtividades_avaliacao_id_key" ON "areaAtividades"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "acessoEntorno_avaliacao_id_key" ON "acessoEntorno"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "contagem_avaliacao_id_key" ON "contagem"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "depredacao_avaliacao_id_key" ON "depredacao"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "elementosPaisagisticos_avaliacao_id_key" ON "elementosPaisagisticos"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "espacosAssento_avaliacao_id_key" ON "espacosAssento"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "feira_avaliacao_id_key" ON "feira"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "ruido_avaliacao_id_key" ON "ruido"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "segurancaViaria_avaliacao_id_key" ON "segurancaViaria"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "usoDensidadeEntorno_avaliacao_id_key" ON "usoDensidadeEntorno"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "vigilancia_avaliacao_id_key" ON "vigilancia"("avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "_avaliacaoTousuario_AB_unique" ON "_avaliacaoTousuario"("A", "B");

-- CreateIndex
CREATE INDEX "_avaliacaoTousuario_B_index" ON "_avaliacaoTousuario"("B");

-- AddForeignKey
ALTER TABLE "acessibilidade" ADD CONSTRAINT "acessibilidade_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areaAtividades" ADD CONSTRAINT "areaAtividades_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacao" ADD CONSTRAINT "avaliacao_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "acessoEntorno" ADD CONSTRAINT "acessoEntorno_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contagem" ADD CONSTRAINT "contagem_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depredacao" ADD CONSTRAINT "depredacao_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elementosPaisagisticos" ADD CONSTRAINT "elementosPaisagisticos_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "espacosAssento" ADD CONSTRAINT "espacosAssento_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feira" ADD CONSTRAINT "feira_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoaNoLocal" ADD CONSTRAINT "pessoaNoLocal_contagem_id_fkey" FOREIGN KEY ("contagem_id") REFERENCES "contagem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruido" ADD CONSTRAINT "ruido_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segurancaViaria" ADD CONSTRAINT "segurancaViaria_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usoDensidadeEntorno" ADD CONSTRAINT "usoDensidadeEntorno_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vigilancia" ADD CONSTRAINT "vigilancia_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "avaliacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_avaliacaoTousuario" ADD CONSTRAINT "_avaliacaoTousuario_A_fkey" FOREIGN KEY ("A") REFERENCES "avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_avaliacaoTousuario" ADD CONSTRAINT "_avaliacaoTousuario_B_fkey" FOREIGN KEY ("B") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
