# Projeto Praças
Projeto sendo realizado em conjunto da Arquitetura e o GETComp (GET Ciência da Computação) da UFJF. Tem o objetivo de criar um sistema capaz de fazer avaliações de praças.
# Instalação
O projeto é feito em javascript, utilizando react para o frontend e node para o backend. Para rodar o projeto é necessário ter o npm para a instalação das dependências
https://www.npmjs.com/get-npm

Ao finalizar a instalação cheque se o npm foi instalado corretamente com o comando

    npm -v

## Frontend
Para instalar as dependências entre na pasta *./front/* e rode

    npm install
Com isso todas as dependências necessárias serão instaladas. Teste a instalação rodando

    npm start
### Possíveis erros
Um erro <...> com o pacote `node-gyp`:
* instalar python2

Um erro <...> envolvendo um codigo em c/c++:
* mudar a versão do node para uma mais antiga (a versão 14 funciona (15+ não funciona))

## Backend
Primeiramente é necessario ter um servidor do [PostgreSQL](https://www.postgresql.org/) configurado no computador com um banco de dados. \
para inicializar o servidor, na pasta */api*:

    yarn dev

Para configurar o banco de dados:

    npx sequelize db:migrate




