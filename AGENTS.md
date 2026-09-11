# Padrões do projeto

## Endpoints

### Organização de arquivos

- Manter `route.ts` enxuto e responsável apenas pela camada HTTP.
- Colocar consultas em `src/lib/serverFunctions/queries`.
- Colocar alterações de dados em `src/lib/serverFunctions/mutations`.
- Colocar hooks de cliente em `src/lib/serverFunctions/apiCalls`.
- Não acessar o Prisma diretamente em `route.ts`.
- Nomear queries e mutations de acordo com a ação, por exemplo:
  - `fetchCustomDynamicIconDetails`;
  - `saveCustomDynamicIcon`;
  - `deleteCustomDynamicIcon`.

### Queries e mutations

- Declarar o schema Zod, tipos de parâmetros ou dados e tipo de resposta no
  mesmo arquivo da query ou mutation.
- Declarar o schema Zod e os tipos de cada método principal imediatamente
  acima desse método; não concentrá-los no início do arquivo.
- Queries devem receber `APIRequestParams<TParams>`.
- Mutations devem receber `APIRequestData<TData>`.
- Retornar sempre o formato compatível com `APIResponse`:

  ```ts
  {
    responseInfo: {
      statusCode: 200,
      message: "Mensagem opcional",
    },
    data: {
      // dados da resposta
    },
  }
  ```

- Usar `APIResponseInfo` para tipar `responseInfo`.
- Declarar o tipo de resposta a partir da função:

  ```ts
  export type FetchResourceResponse = Awaited<
    ReturnType<typeof fetchResource>
  >["data"];
  ```

- Erros esperados de regra de negócio devem retornar `responseInfo` com o
  código adequado, como `400`, `404` ou `409`.
- Erros inesperados de banco ou execução devem retornar `500` e uma mensagem
  apropriada.

### Parâmetros de endpoints GET

- Endpoints GET usam query params; não usar parâmetros dinâmicos como `/:id`.
- Preferir:

  ```text
  /api/admin/forms/dynamicIcons/details?iconId=123
  ```

  em vez de:

  ```text
  /api/admin/forms/dynamicIcons/details/123
  ```

- Declarar um schema específico para os parâmetros:

  ```ts
  export const fetchResourceParamsSchema = z.object({
    resourceId: z.coerce.number().int().positive(),
  });
  ```

- Campos numéricos recebidos por query params devem usar `z.coerce.number()`.
- Campos booleanos recebidos por query params devem usar `booleanFromString`.
- Em `route.ts`, sempre usar `parseQueryParams` e passar o resultado já
  parseado para a função:

  ```ts
  const params = parseQueryParams(
    fetchResourceParamsSchema,
    request.nextUrl.searchParams,
  );

  const response = await fetchResource({ params });
  ```

- Não fazer novo `safeParse` ou `parse` após `parseQueryParams`, exceto quando
  houver uma necessidade excepcional documentada.

### Corpo de requisições POST, PUT e DELETE

- Declarar schema Zod para o corpo da requisição junto da mutation.
- Hooks devem enviar dados usando `useFetchAPI`.
- Por padrão, `useFetchAPI` serializa `data` como JSON.
- Usar `FormData` somente quando a requisição realmente precisa enviar
  arquivos.
- Não alterar um hook para `FormData` se o contrato atual do endpoint usa JSON.

### route.ts

- Verificar autorização no início da rota, quando aplicável.
- Usar `NextRequest` em rotas que precisam de `nextUrl.searchParams`.
- Chamar a query ou mutation fora da rota.
- Serializar a resposta com `superjson`.
- Retornar `Content-Type: application/json`.
- Manter o tratamento de erro HTTP na rota.

Exemplo de GET:

```ts
import {
  fetchResource,
  fetchResourceParamsSchema,
} from "@/lib/serverFunctions/queries/resource";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["FORM_MANAGER"],
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const params = parseQueryParams(
      fetchResourceParamsSchema,
      request.nextUrl.searchParams,
    );
    const response = await fetchResource({ params });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response("Erro ao consultar recurso", { status: 500 });
  }
}
```

Exemplo de POST:

```ts
export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["FORM_MANAGER"],
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = saveResourceDataSchema.parse(await request.json());
    const response = await saveResource({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response("Erro ao salvar recurso", { status: 500 });
  }
}
```

### Hooks de cliente

- Hooks ficam em `src/lib/serverFunctions/apiCalls`.
- Usar `useFetchAPI` para toda chamada de endpoint no cliente.
- Declarar os tipos de resposta, parâmetros e dados da mutation no hook.
- A URL do hook deve corresponder exatamente à rota da API.
- Para GET, passar dados em `params`.
- Para POST, PUT e DELETE, passar dados em `data`.
- Não usar `fetch` diretamente em componentes quando existir um endpoint do
  projeto.

Exemplo:

```ts
const useFetchResource = (
  params?: UseFetchAPIParams<FetchResourceResponse>,
) => {
  return useFetchAPI<FetchResourceResponse, FetchResourceParams>({
    url: "/api/admin/resource/details",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
```

### Convenções gerais

- Usar `save` para operações que criam ou atualizam o mesmo recurso.
- Usar `fetch` para consultas.
- Usar `delete` para remoções.
- Usar nomes consistentes entre rota, hook, schema, tipos e função de servidor.
- Ao alterar uma rota, atualizar todas as referências: hook, tipos, chamadas e
  testes relacionados.


## Front-end

### Organização de componentes

- Páginas devem orquestrar dados, permissões e composição. Componentes de
  feature concentram a interface e o estado local.
- Criar componentes reutilizáveis em `src/components/ui` apenas quando forem
  realmente genéricos. Componentes específicos devem permanecer próximos da
  página ou feature que os utiliza.
- Usar os componentes `C*` existentes antes de criar equivalentes com MUI puro.
- Componentes controlados devem receber `value`, `onChange`, `disabled` e
  estados de erro explicitamente. Nomear callbacks por ação, como `onSave`,
  `onDelete` e `onChange`.

### Estado e dados

- Dados retornados pela API são a fonte de verdade. Não duplicá-los em estado
  local sem necessidade; preferir valores derivados por função ou memoização.
- Manter estado temporário de interface local ao componente: diálogos abertos,
  item selecionado, seções expandidas e rascunhos ainda não salvos.
- Componentes não devem chamar `fetch` diretamente. Toda comunicação com a API
  deve ocorrer por hooks em `src/lib/serverFunctions/apiCalls`.

### Operações e interface

- Toda operação assíncrona deve expor carregamento e erro. Desabilitar ações que
  não podem ser executadas novamente enquanto a requisição estiver em curso.
- Ações destrutivas exigem confirmação e devem usar o padrão de diálogo já
  existente no projeto.
- Preservar responsividade com Tailwind e MUI; evitar valores fixos que quebrem
  o layout em telas menores.
- Garantir acessibilidade básica: campos com rótulos, botões com texto ou
  `aria-label`, estado não comunicado apenas por cor e uso por teclado.
- Usar o conjunto de ícones já adotado no projeto; não introduzir SVGs ou novas
  bibliotecas quando o conjunto existente cobrir o caso.
- Escrever textos de interface e mensagens de erro em português, orientando a
  ação esperada do usuário.

### `useFetchAPI`

- Hooks de API devem encapsular `useFetchAPI<T, P, D>`, em que `T` é o dado da
  resposta, `P` são os query params e `D` é o corpo da requisição.
- `useFetchAPI` retorna `[request, isLoading]`: `request` é uma função assíncrona
  e `isLoading` é o booleano que representa a requisição em curso. O hook não
  executa a requisição automaticamente.
- Chamar `request` com `params` para GET e `data` para POST, PUT e DELETE. O
  argumento também aceita `projectOptions` e `requestOptions` quando necessário.
- A resposta de `request` tem o formato `APIResponse<T>`: `responseInfo` contém
  `statusCode` e `message`; `data` contém o dado tipado ou pode ser nulo.
- Declarar callbacks em `UseFetchAPIParams<T>` quando o componente precisar
  reagir ao resultado: `onSuccess` e `onError` cobrem qualquer origem;
  `onServerSuccess` e `onServerError` cobrem o servidor; `onOfflineSuccess` e
  `onOfflineError` cobrem o fallback offline.
- O hook já exibe notificações para respostas por padrão. Usar
  `projectOptions.silent` apenas quando a interface tratar a mensagem
  explicitamente. Usar `loadingMessage` ou `showLoadingOverlay` apenas quando
  um overlay global for apropriado.
- `useFetchAPI` serializa `data` como JSON. Usar `FormData` apenas para envio
  real de arquivos; nesse caso, o hook preserva o corpo como `FormData`.

### Regras condicionais

- Antes de criar ou alterar o front-end de um editor de templates de contagem,
  ler integralmente `.agents/tally-template-editor.md`.
