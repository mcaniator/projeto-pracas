import {
  Activity,
  AgeGroup,
  CategoriasEspacoLivre,
  Estados,
  Maintenance,
  OptionTypes,
  QuestionTypes,
  Sex,
  TiposLocal,
  TiposUsuario,
  Upkeep,
  Visibility,
} from "@prisma/client";
import { z } from "zod";

// #region Fomulários
//  ------------------------------------------------------------------------------------------------------------
//  Formulários
//  ------------------------------------------------------------------------------------------------------------

const categorySchema = z.object({
  name: z.string().trim().min(1).max(255),
  optional: z.boolean().optional(),
  active: z.boolean().optional(),
});

const questionSchema = z.object({
  name: z.string().trim().min(1).max(255),
  optional: z.boolean().optional(),
  active: z.boolean().optional(),
  type: z.nativeEnum(QuestionTypes),
  categoryId: z.coerce.number().int().finite().nonnegative(),
});

const textQuestionSchema = z.object({
  charLimit: z.coerce.number().int().finite().nonnegative().optional(),
});

const numericQuestionSchema = z
  .object({
    min: z.coerce.number().finite().optional(),
    max: z.coerce.number().finite().optional(),
  })
  .refine((value) => {
    if (value.min == undefined || value.max == undefined) return true;
    return value.min < value.max;
  });

const optionsQuestionSchema = z
  .object({
    optionType: z.nativeEnum(OptionTypes),
    maximumSelections: z.coerce.number().int().finite().nonnegative().optional(),
  })
  .refine((value) => {
    if (value.optionType == "CHECKBOX" && value.maximumSelections == undefined) return false;
    if (value.optionType != "CHECKBOX" && value.maximumSelections != undefined) return false;
    return true;
  });

const optionSchema = z
  .object({
    text: z.string().trim().min(1).max(255),
  })
  .array()
  .nonempty();

const formSchema = z.object({
  nome: z.string().trim().min(1).max(255),
});

type categoryType = z.infer<typeof categorySchema>;
type questionType = z.infer<typeof questionSchema>;
type textQuestionType = z.infer<typeof textQuestionSchema>;
type numericQuestionType = z.infer<typeof numericQuestionSchema>;
type optionsQuestionType = z.infer<typeof optionsQuestionSchema>;
type formType = z.infer<typeof formSchema>;

export { categorySchema, formSchema, numericQuestionSchema, optionSchema, optionsQuestionSchema, questionSchema, textQuestionSchema };
export type { categoryType, formType, numericQuestionType, optionsQuestionType, questionType, textQuestionType };
// #endregion

// #region Informações da Praça
//  ------------------------------------------------------------------------------------------------------------
//  Informações da Praça
//  ------------------------------------------------------------------------------------------------------------

const localSchema = z
  .object({
    nome: z.string().trim().min(1).max(255),
    ePraca: z.boolean().optional(),
    observacoes: z.string().trim().min(1).optional(),
    anoCriacao: z.coerce.date().optional(),
    anoReforma: z.coerce.date().optional(),
    prefeitoCriacao: z.string().trim().min(1).max(255).optional(),
    legislacao: z.string().trim().min(1).max(255).optional(),
    areaUtil: z.coerce.number().finite().nonnegative().optional(),
    areaPrefeitura: z.coerce.number().finite().nonnegative().optional(),
    inclinacao: z.coerce.number().finite().nonnegative().optional(),
    regiaoUrbana: z.string().trim().min(1).max(255).optional(),
    inativoNaoLocalizado: z.boolean().optional(),
    poligonoArea: z.coerce.number().finite().nonnegative().optional(),
    delimitacaoAdministrativaMenosAmpla: z.string().trim().min(1).max(255).optional(),
    delimitacaoAdministrativaMaisAmpla: z.string().trim().min(1).max(255).optional(),
    tipo: z.nativeEnum(TiposLocal).optional(),
    categoriaEspacoLivre: z.nativeEnum(CategoriasEspacoLivre).optional(),
  })
  .refine((value) => {
    if (value.anoCriacao != undefined && value.anoReforma != undefined) return value.anoReforma >= value.anoCriacao;
    return true;
  });

const enderecoSchema = z.object({
  bairro: z.string().trim().min(1).max(255),
  rua: z.string().trim().min(1).max(255),
  cep: z.string().trim().min(1).max(255),
  numero: z.coerce.number().int().finite().nonnegative(),
  localId: z.coerce.number().int().finite().nonnegative(),
  cidadeId: z.coerce.number().int().finite().nonnegative(),
  estado: z.nativeEnum(Estados),
});

const cidadeSchema = z.object({
  nome: z.string().min(1).max(255),
});

const regiaoSchema = z.object({
  regiao: z.string().trim().min(1).max(255),
});

type localType = z.infer<typeof localSchema>;
type enderecoType = z.infer<typeof enderecoSchema>;
type cidadeType = z.infer<typeof cidadeSchema>;
type regiaoType = z.infer<typeof regiaoSchema>;

export { cidadeSchema, enderecoSchema, localSchema, regiaoSchema };
export type { cidadeType, enderecoType, localType, regiaoType };
// #endregion

// #region Informações das Avaliações
//  ------------------------------------------------------------------------------------------------------------
//  Informações das Avaliações
//  ------------------------------------------------------------------------------------------------------------

const avaliacaoSchema = z
  .object({
    dataInicio: z.date(),
    dataFim: z.date(),
    alteracaoLimites: z.boolean().optional(),
    wifi: z.boolean(),

    calcadaPavimentada: z.boolean(),
    quantidadeLixeira: z.coerce.number().int().finite().nonnegative(),
    quantidadeBanheiro: z.coerce.number().int().finite().nonnegative(),
    quantidadeTelefonePublico: z.coerce.number().int().finite().nonnegative(),
    quantidadeBebedouro: z.coerce.number().int().finite().nonnegative(),
    quantidadeObraArte: z.coerce.number().int().finite().nonnegative(),
    quantidadePaisagismoPlanejado: z.coerce.number().int().finite().nonnegative(),
    quantidadeCadeiraMovel: z.coerce.number().int().finite().nonnegative(),

    conservacaoCalcada: z.nativeEnum(Maintenance),
    conservacaoLixeira: z.nativeEnum(Maintenance),
    conservacaoBanheiro: z.nativeEnum(Maintenance),
    conservacaoTelefonePublico: z.nativeEnum(Maintenance),
    conservacaoBebedouro: z.nativeEnum(Maintenance),
    conservacaoObraArte: z.nativeEnum(Maintenance),
    conservacaoPaisagismoPlanejado: z.nativeEnum(Maintenance),
    conservacaoCadeiraMovel: z.nativeEnum(Maintenance),
  })
  .refine((value) => value.dataFim >= value.dataInicio);

const usuarioSchema = z.object({
  nome: z.string().trim().min(1).max(255),
  tipo: z.nativeEnum(TiposUsuario),
  email: z.string().trim().email(),
  senha: z.string().trim().min(1).max(255),
});

type avaliacaoType = z.infer<typeof avaliacaoSchema>;
type usuarioType = z.infer<typeof usuarioSchema>;

export { avaliacaoSchema, usuarioSchema };
export type { avaliacaoType, usuarioType };
// #endregion

// #region Campos das Avaliações
//  ------------------------------------------------------------------------------------------------------------
//  Campos das Avaliações
//  ------------------------------------------------------------------------------------------------------------

const acessibilidadeSchema = z.object({
  calcadaEntornoFaixaLivre: z.boolean(),
  calcadaEntornoFaixaServico: z.boolean(),
  alturaLivre: z.boolean(),
  travessiaRebaixamento: z.boolean(),
  ausenciaObstaculos: z.boolean(),
  inclinacaoMax: z.boolean(),
  inclinacaoLongitudinal: z.boolean(),
  sinalizacaoTatil: z.boolean(),
  revestimentoPiso: z.boolean(),
  vagasPcd: z.coerce.number().int().finite().nonnegative(),
  vagasIdosos: z.coerce.number().int().finite().nonnegative(),
  rotaAcessivel: z.boolean(),
  equipamentoAdaptado: z.boolean(),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const acessoEntornoSchema = z.object({
  cercaHorarioFuncionamento: z.boolean(),
  placaIdentificacao: z.boolean(),
  baiasOnibus: z.coerce.number().int().finite().nonnegative(),
  vagasTaxi: z.coerce.number().int().finite().nonnegative(),
  vagasCarro: z.coerce.number().int().finite().nonnegative(),
  vagasMoto: z.coerce.number().int().finite().nonnegative(),
  ciclovia: z.boolean(),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const areaAtividadesSchema = z.object({
  categoria: z.coerce.number().int().finite().nonnegative(),
  sombraMinima: z.boolean(),
  iluminacao: z.boolean(),
  cercado: z.boolean(),
  bancos: z.boolean(),
  conservacao: z.nativeEnum(Maintenance),
  descriacao: z.string().trim().min(1).optional(),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const depredacaoSchema = z.object({
  nivelPichacao: z.nativeEnum(Upkeep),
  nivelAbandono: z.nativeEnum(Upkeep),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const elementosPaisagisticosSchema = z.object({
  categoria: z.coerce.number().int().finite().nonnegative(),
  sombraMinima: z.boolean(),
  iluminacao: z.boolean(),
  cercado: z.boolean(),
  bancos: z.boolean(),
  conservacao: z.boolean(),
  descricao: z.string().trim().min(1).optional(),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const espacosAssentoSchema = z.object({
  categoria: z.coerce.number().int().finite().nonnegative(),
  sombraMinima: z.boolean(),
  iluminacao: z.boolean(),
  cercado: z.boolean(),
  bancos: z.boolean(),
  conservacao: z.boolean(),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const eventoSchema = z.object({
  frequenciaUltimoAno: z.coerce.number().int().finite().nonnegative(),
  categoria: z.coerce.number().int().finite().nonnegative(),
  nomeResponsavel: z.string().trim().min(1).max(255),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const segurancaViariaSchema = z.object({
  faixaPedestre: z.boolean(),
  semaforo: z.boolean(),
  placasVelocidade: z.boolean(),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const usoDensidadeEntornoSchema = z.object({
  usoEdificacoes: z.string().trim().min(1),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

const vigilanciaSchema = z.object({
  camera: z.boolean(),
  postoPolicial: z.boolean(),
  nivelVisibilidade: z.nativeEnum(Visibility),
  avaliacaoId: z.coerce.number().int().finite().nonnegative(),
});

type acessibilidadeType = z.infer<typeof acessibilidadeSchema>;
type acessoEntornoType = z.infer<typeof acessoEntornoSchema>;
type areaAtividadesType = z.infer<typeof areaAtividadesSchema>;
type depredacaoType = z.infer<typeof depredacaoSchema>;
type elementosPaisagisticosType = z.infer<typeof elementosPaisagisticosSchema>;
type espacosAssentoType = z.infer<typeof espacosAssentoSchema>;
type eventoType = z.infer<typeof eventoSchema>;
type segurancaViariaType = z.infer<typeof segurancaViariaSchema>;
type usoDensidadeEntornoType = z.infer<typeof usoDensidadeEntornoSchema>;
type vigilanciaType = z.infer<typeof vigilanciaSchema>;

export {
  acessibilidadeSchema,
  acessoEntornoSchema,
  areaAtividadesSchema,
  depredacaoSchema,
  elementosPaisagisticosSchema,
  espacosAssentoSchema,
  eventoSchema,
  segurancaViariaSchema,
  usoDensidadeEntornoSchema,
  vigilanciaSchema,
};
export type {
  acessibilidadeType,
  acessoEntornoType,
  areaAtividadesType,
  depredacaoType,
  elementosPaisagisticosType,
  espacosAssentoType,
  eventoType,
  segurancaViariaType,
  usoDensidadeEntornoType,
  vigilanciaType,
};
// #endregion

// #region Campos das Avaliações Não Relacionados à Avaliação Física
//  ------------------------------------------------------------------------------------------------------------
//  Campos das Avaliações Não Relacionadas à Avaliação Física
//  ------------------------------------------------------------------------------------------------------------

const contagemSchema = z.object({
  data: z.coerce.date().optional(),
  inicio: z.coerce.date().optional(),
  fim: z.coerce.date().optional(),
  quantidadeAnimais: z.coerce.number().int().finite().nonnegative().optional(),
  temperatura: z.coerce.number().finite().optional(),
  condicaoCeu: z.string().trim().min(1).max(255),
  localId: z.coerce.number().int().finite().nonnegative(),
});

const pessoaNoLocalSchema = z.object({
  classificacaoEtaria: z.nativeEnum(AgeGroup),
  sexo: z.nativeEnum(Sex),
  atividadeFisica: z.nativeEnum(Activity),
  passando: z.boolean(),
  pessoaDeficiente: z.boolean(),
  atividadeIlicita: z.boolean(),
  situacaoRua: z.boolean(),
  contagemId: z.coerce.number().int().finite().nonnegative(),
});

const ruidoSchema = z.object({
  nivelDb: z.coerce.number().finite().nonnegative(),
  categoria: z.string().trim().min(1).max(255),
  localId: z.coerce.number().int().finite().nonnegative(),
});

type contagemType = z.infer<typeof contagemSchema>;
type pessoaNoLocalType = z.infer<typeof pessoaNoLocalSchema>;
type ruidoType = z.infer<typeof ruidoSchema>;

export { contagemSchema, pessoaNoLocalSchema, ruidoSchema };
export type { contagemType, pessoaNoLocalType, ruidoType };
// #endregion
