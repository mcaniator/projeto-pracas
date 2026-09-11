# Editor de templates de contagem

Estas regras se aplicam exclusivamente ao front-end que cria ou edita templates
de contagem. Antes de alterar essa feature, ler este arquivo integralmente.

- O template em edição é um rascunho local. Alterações em campos, grupos,
  características ou posições não devem fazer requisições individuais.
- A ação de salvar envia o objeto completo do template em uma única requisição.
- A ordem de grupos e características deve ser representada explicitamente por
  `position`; não depender da ordem do array recebido da API.
