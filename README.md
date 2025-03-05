# Projeto Praças

Projeto apoidado pela Pró-Reitoria de Extensão sendo realizado em parceria com a Faculdade de Arquitetura e Urbanismo e o Grupo de Educação Tutorial de Sistemas de Informação (GetSi) da Universidade Federal de Juiz de Fora. O objetivo do projeto é desenvolver um sistema capaz de cadastrar e visualizar informações referentes a praças públicas, permitindo o seu acompanhamento e avaliação pela população local e por pesquisadores da área de urbanismo.

# Pré-requisitos

O projeto é feito em TypeScript, utilizando o framework Next.js. Para executar, é necessário possuir um dos seguintes gerenciadores de pacotes: <br>
**npm**: https://www.npmjs.com/get-npm <br>
**pnpm**: https://pnpm.io/installation

É necessário acesso a um banco de dados PostgreSQL. Recomenda-se utilizar um versão igual ou superior a 16.0. Deve-se criar um arquivo `.env` na raiz do projeto, seguindo como exemplo o arquivo `.env.example`, preenchedo as variáveis de ambiente de acordo com a preferência do usuário.

### Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento, rode o script `dev`:

```
npm run dev
```

ou

```
pnpm run dev
```

### Compilando e hospedando

Antes de iniciar a hospedagem, é necessário fazer uma build otimizada do projeto com o script `build`:

```
npm run build
```

ou

```
pnpm run build
```

Em seguido inicie o servidor com o script `start`:

```
npm run start
```

ou

```
pnpm run start
```
