-- AlterTable
CREATE SEQUENCE locals_id_seq;
ALTER TABLE "locals" ALTER COLUMN "id" SET DEFAULT nextval('locals_id_seq');
ALTER SEQUENCE locals_id_seq OWNED BY "locals"."id";
