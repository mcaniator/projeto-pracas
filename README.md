# Projeto Praças

Projeto apoidado pela Pró-Reitoria de Extensão sendo realizado em parceria com a Faculdade de Arquitetura e Urbanismo e o Grupo de Educação Tutorial de Sistemas de Informação (GetSi) da Universidade Federal de Juiz de Fora. O objetivo do projeto é desenvolver um sistema capaz de cadastrar e visualizar informações referentes a praças públicas, permitindo o seu acompanhamento e avaliação pela população local e por pesquisadores da área de urbanismo.

# Pré-requisitos

O projeto é feito em TypeScript, utilizando o framework Next.js. Para executar, é necessário possuir um dos seguintes gerenciadores de pacotes: <br>
**npm**: https://www.npmjs.com/get-npm <br>
**pnpm**: https://pnpm.io/installation

É necessário acesso a um banco de dados PostgreSQL. Recomenda-se utilizar um versão igual ou superior a 16.0.

### Configurações iniciais

#### Configuração do Google Cloud

Caso seja utilizado o OAuth da Google para autenticar usuários e/ou a conta de e-mail utilizada pelo sistema, é necessário criar um projeto no Google Cloud.
<br>
Uma vez criado um projeto no Google Cloud, na configuração de OAuth2.0: <br>

- Em `Authorized JavaScript origins`, adicione a URL e porta do projeto. ex: `http://localhost:3000` (necessário para autenticação de usuários)
  <br>
- Em `Authorized redirect URIs`, adicione as URLs:

```
http://localhost:3000/api/auth/callback/google
```

(Necessário para autenticação de usuários)

```
https://developers.google.com/oauthplayground
```

(Necessário para a criação do Refresh token para autorizar o acesso da conta Google responsável por enviar e-mails do sistema)
<br>
Lembre-se de substituir localhost:3000 pela URL e porta onde o projeto está hospedado
<br>

#### Autenticando a conta de e-mails do sistema

O sistema utiliza uma conta da Google para enviar e-mails de convite e de recuperação de senha.
<br>
Há 2 maneiras de autenticar a conta no sistema:

##### Oauth

Uma vez criado e configurado um projeto no Google Cloud, acesse https://developers.google.com/oauthplayground/.

- Abra o menu de configurações (ícone de engrenagem) e marque a opção `Use your own OAuth credentials`.
- Preencha os campos `OAuth Client ID` e `OAuth Client secret` com os respectivos dados do projeto.
- No campo `Input your own scopes`, preencha com `https://mail.google.com`.
- Faça a autenticação com a conta de e-mails.
- Clique em `Exchange authorization code for tokens`
- Automaticamente será aberto a aba de etapa 3. Abra a etapa 2 novamente e copie o refresh token, ele será necessário para o preenchimento de variáveis de ambiente.
- Observação: Caso o público-alvo do projeto no Google Cloud esteja marcado como "externo", e o status de publicação esteja como "em teste", o refresh token será revogado dentro de alguns dias.

##### App password

- Ative a autenticação de 2 fatores na conta Google.
- Configure uma senha de app.

#### Variáveis de ambiente

Crie um arquivo .env e preencha-o de acordo com o arquivo `.env.example`

#### Configurando o banco de dados

Execute os comandos:

```
npx prisma migrate dev
```

```
npx prisma generate
```

#### Populando o banco de dados

Para criar o usuário administrador, e os usuários de teste (caso esteja configurado nas variáveis de ambiente), execute o comando

```
npx prisma db seed
```

### Dependências

Intale as dependencias utilizando:

```
npm install
```
ou
```
pnpm install
```

### Servidor de Desenvolvimento

Faça a migração do banco de dados com o comando:
```
npx prisma migrate dev
```
Gere o Prisma Client com o comando:
```
npx prisma generate
```

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
