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
