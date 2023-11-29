-- AlterTable
ALTER TABLE "local" ALTER COLUMN "ano_criacao" DROP NOT NULL,
ALTER COLUMN "ano_reforma" DROP NOT NULL,
ALTER COLUMN "area_util" DROP NOT NULL,
ALTER COLUMN "categoria_espaco_livre" DROP NOT NULL,
ALTER COLUMN "invativo_nao_localizado" DROP NOT NULL,
ALTER COLUMN "poligono_area" DROP NOT NULL,
ALTER COLUMN "prefeito_criacao" DROP NOT NULL,
ALTER COLUMN "regiao_urbana" DROP NOT NULL,
ALTER COLUMN "tipo" DROP NOT NULL;
