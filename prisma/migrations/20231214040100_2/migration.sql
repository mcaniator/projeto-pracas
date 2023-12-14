-- AlterTable
ALTER TABLE "contagem" ALTER COLUMN "data" DROP NOT NULL,
ALTER COLUMN "inicio" DROP NOT NULL,
ALTER COLUMN "fim" DROP NOT NULL,
ALTER COLUMN "temperatura" DROP NOT NULL,
ALTER COLUMN "condicao_ceu" DROP NOT NULL,
ALTER COLUMN "quantidade_animais" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pessoa_no_local" ALTER COLUMN "classificacao_etaria" DROP NOT NULL,
ALTER COLUMN "genero" DROP NOT NULL,
ALTER COLUMN "atividade_fisica" DROP NOT NULL,
ALTER COLUMN "passando" DROP NOT NULL,
ALTER COLUMN "pessoa_deficiente" DROP NOT NULL,
ALTER COLUMN "atividade_ilicita" DROP NOT NULL,
ALTER COLUMN "situacao_rua" DROP NOT NULL;
