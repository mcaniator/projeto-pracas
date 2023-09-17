# Projeto Praças

Projeto sendo realizado em conjunto da Arquitetura e o GETComp (GET Ciência da Computação) da UFJF. Tem o objetivo de criar um sistema capaz de fazer avaliações de praças.

# Instalação

O projeto é feito em javascript, utilizando react para o frontend e node para o backend. Para rodar o projeto é necessário ter o npm para a instalação das dependências
https://www.npmjs.com/get-npm

Ao finalizar a instalação cheque se o npm foi instalado corretamente com o comando

    npm -v

## Frontend

O front-end está localizado na pasta `site-pracas`.

Inicialmente use o seu gerenciador de pacotes preferido para instalar as dependências do projeto.

```bash
npm install
pnpm install
yarn install
bun install
```

### Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento rode o script `dev`.

```bash
npm run dev
pnpm dev
yarn dev
bun dev
```

### Buildando e Deploying

Antes de iniciar o hosteamento é necessário fazer uma build otimizada do projeto com o script `build`.

```
npm run build
pnpm build
yarn build
bun run build
```

Em seguido inicie o servidor com o script `start`.

```
npm run start
pnpm start
yarn start
bun start
```

## Backend

Primeiramente é necessario ter um servidor do [PostgreSQL](https://www.postgresql.org/) configurado no computador com um banco de dados. \
para inicializar o servidor, na pasta _/api_:

    yarn dev

Para configurar o banco de dados:

    npx sequelize db:migrate
