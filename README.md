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

#### Dependências

Intale as dependencias utilizando:

```
npm install
```

ou

```
pnpm install
```

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

# Configuração do HTTPS para desenvolvimento (Next.js + Capacitor)

Esta seção descreve todas as etapas necessárias para que o aplicativo gerado pelo Capacitor consiga acessar as API Routes do projeto Next.js durante o desenvolvimento utilizando HTTPS.

---

# Pré-requisitos

- Celular Android conectado à mesma rede Wi-Fi do computador

---

# 1. Instalar o Chocolatey (opcional)

Precisamos instalar o **mkcert**, e uma das maneiras é através do Chocolatey.
Abra o PowerShell como **Administrador** e execute:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Verifique a instalação:

```powershell
choco --version
```

---

# 2. Instalar o mkcert

```powershell
choco install mkcert -y
```

---

# 3. Instalar a Autoridade Certificadora local

Execute:

```powershell
mkcert -install
```

Deverá aparecer uma mensagem semelhante a:

```text
The local CA is already installed in the system trust store! 👍
```

---

# 4. Descobrir o IP da máquina

No Windows, execute:

```powershell
ipconfig
```

Exemplo:

```text
IPv4 Address . . . . . : 192.168.2.101
```

Esse IP será utilizado pelo aplicativo Android.

---

# 5. Gerar o certificado HTTPS

Inclua todos os endereços que poderão ser utilizados para acessar o servidor.

Exemplo:

```powershell
mkcert localhost 127.0.0.1 ::1 192.168.2.101
```

Esse comando gera arquivos semelhantes a:

```text
localhost+3.pem
localhost+3-key.pem
```

> O número (`+3`) depende da quantidade de nomes/IPs incluídos no certificado.

---

# 6. Iniciar o Next.js utilizando o certificado

Exemplo:

```powershell
pnpm next dev ^
  --experimental-https ^
  --experimental-https-cert .\localhost+3.pem ^
  --experimental-https-key .\localhost+3-key.pem ^
  -H 0.0.0.0
```

ou configure um script no `package.json`.

O parâmetro

```text
-H 0.0.0.0
```

faz o servidor escutar em todas as interfaces de rede, permitindo conexões vindas do celular.

---

# 7. Descobrir onde está a CA criada pelo mkcert

Execute:

```powershell
mkcert -CAROOT
```

Exemplo:

```text
C:\Users\<usuario>\AppData\Local\mkcert
```

Nessa pasta existem dois arquivos importantes:

```text
rootCA.pem
rootCA-key.pem
```

## IMPORTANTE

Compartilhe apenas:

```text
rootCA.pem
```

Nunca compartilhe:

```text
rootCA-key.pem
```

Essa é a chave privada da Autoridade Certificadora.

---

# 8. Instalar a CA no Android

Copie o arquivo

```text
rootCA.pem
```

para o celular.

Depois acesse aproximadamente:

```text
Configurações
→ Segurança
→ Criptografia e credenciais
→ Instalar certificado
→ Certificado de CA
```

Selecione o arquivo `rootCA.pem`.

Após isso, o Android passará a confiar nos certificados emitidos pelo mkcert.

---

**As seções 9 e 10 já estão configuradas no projeto, mas se mantém no README para referência futura**

# 9. Network Security Config

No projeto, há o arquivo:

```text
android/app/src/main/res/xml/network_security_config.xml
```

Com o conteúdo:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>

    <debug-overrides>
        <trust-anchors>
            <certificates src="user"/>
        </trust-anchors>
    </debug-overrides>

</network-security-config>
```

Essa configuração faz com que, **apenas em builds Debug**, o aplicativo também confie nas Autoridades Certificadoras instaladas pelo usuário (como a CA criada pelo mkcert).

---

# 10. Configuração de Security Config no AndroidManifest

No arquivo:

```text
android/app/src/main/AndroidManifest.xml
```

Na tag `<application>` há:

```xml
android:networkSecurityConfig="@xml/network_security_config"
```

```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:networkSecurityConfig="@xml/network_security_config"
    android:theme="@style/AppTheme">

</application>
```

---

# 11. Configuração de ambiente

Certifique-se que no .env as chaves **BASE_URL** e **NEXT_PUBLIC_BASE_URL** estejam configuradas para usar seu ip local pelo protolo https, como por exemplo:

```
BASE_URL="https://192.168.2.101:3000"
NEXT_PUBLIC_BASE_URL="https://192.168.2.101:3000"
```

# 12. Sincronizar o projeto Capacitor

```bash
npx cap sync android
```

---

# 13. Executar o aplicativo

Abra o projeto Android:

```bash
npx cap open android
```

Execute uma **Build Debug**.

> O `debug-overrides` é aplicado automaticamente apenas em builds Debug.

---

# Observações

Esta configuração destina-se **exclusivamente ao ambiente de desenvolvimento**.

Em produção, deve-se utilizar um certificado emitido por uma Autoridade Certificadora pública, e não a CA criada pelo `mkcert`.
