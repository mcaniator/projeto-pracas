import React, { Component } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button.js";
import axios from "axios";

//import Form from '@rjsf/material-ui';
import { withTheme } from '@rjsf/core';
import { Theme as MaterialUITheme } from '@rjsf/material-ui';
import avatar from "assets/img/faces/marc.jpg";
// const Form = withTheme(MaterialUITheme);
import Form from "@rjsf/material-ui";
import { Category } from "@material-ui/icons";

// import {Opcao, CampoOpcoes, CampoNumerico, CampoTexto, Categoria, CampoFormulario, EstruturaFormulario, getSchema} from "./FormStructure.js";

class Opcao{
    constructor(nome){
        // this.limiteOpcoes = limiteOpcoes;
        // this.totalOpcoes = totalOpcoes;
        // this.visualPreferencia = visualPreferencia;
        this.nome = nome;
    }
}
class CampoOpcoes{
    constructor(limiteOpcoes, totalOpcoes, visualPreferencia, opcoes){
        this.limiteOpcoes = limiteOpcoes;
        this.totalOpcoes = totalOpcoes;
        this.visualPreferencia = visualPreferencia;
        this.opcoes = opcoes;
    }
}
class CampoNumerico{
    constructor(min, max){
        this.min = min;
        this.max = max;
    }
}
class CampoTexto{
    constructor(limiteCaracteres){
        this.limiteCaracteres = limiteCaracteres;
    }
}
class Categoria{
    constructor(opcional, ativo, nome, campos){
        this.opcional = opcional;
        this.ativo = ativo;
        this.campos = campos;
        this.nome = nome;
    }
}
class CampoFormulario{
    constructor(nome, opcional, ativo, campo){
        this.nome = nome;
        this.opcional = opcional;
        this.ativo = ativo;
        this.campo = campo
    }
}
class EstruturaFormulario{
    constructor(categorias){
        this.categorias = categorias;
    }
}
const getSchema = (estruturaFormulario) => {
    let sqm = {
        "title": "Avaliação da Praça X",
        "type": "object",
        "properties": []
    }
    for (const categoria of estruturaFormulario.categorias){
        let prop = {
            "type": "object",
            "title": categoria.nome,
            "properties": [],
        }
        for(let campo of categoria.campos){
            if(campo.campo instanceof CampoTexto){
                let cmp = {
                    type: "string",
                    title: campo.nome,
                }
                prop.properties.push(cmp);
            } else if( campo.campo instanceof CampoOpcoes){
                if(campo.campo.opcoes.length == 1){
                    prop.properties.push({
                        type: "boolean", 
                        title: campo.nome,
                    })
                }
                else{
                    let options =[]
                    for(let item of campo.campo.opcoes){
                        options.push(item.nome)
                    }
                    prop.properties.push({
                        type: "array",
                        title: campo.nome,
                        items: {
                            type: "string",
                            enum: options,
                                  "uniqueItems": true

                        }
                    })

                }

            } else if( campo.campo instanceof CampoNumerico){
                prop.properties.push({
                            "type": "integer",
                            "title": campo.nome,
                            "minimum": campo.campo.min,
                            "maximum": campo.campo.max,
                })

            }
        }
        sqm.properties.push(prop);
    }
    return sqm;
}
/*
const [pracas, setPracas] = useState([]);

const api = axios.create({
baseURL: `http://localhost:3333`,
method: "no-cors",
});

const getFormStructures = async () => {
    let forms;
    try {
        await api.get('/form_structure').then(res => {
            //setPracas(res.data);
           forms =  res.data;
            for(form_field_id of forms.id_forms_fields){
            }
            

        });
    } catch (err) {
        console.error(err.message);
    }
}

useEffect(() => {
    getPracas();
}, [pracas.length]);
}
*/

let camposPixacao = []
camposPixacao.push(new CampoFormulario(
                "Nível de Pixacão", 
                false, 
                true, 
                new CampoNumerico(0, 10)
            )
);
camposPixacao.push(new CampoFormulario(
                "Nível de Abandono", 
                false, 
                true, 
                new CampoNumerico(0, 3)
            )
);
camposPixacao.push(new CampoFormulario(
                "Tipos de Pixacao", 
                false, 
                true, 
                new CampoOpcoes(1, 1, "teste", [new Opcao("Escrita"),new Opcao("Desenho"),new Opcao("Outra Coisa")])
            )
);
/*
class Opcao{
    constructor(nome){
        // this.limiteOpcoes = limiteOpcoes;
        // this.totalOpcoes = totalOpcoes;
        // this.visualPreferencia = visualPreferencia;
        this.nome = nome;
    }
}
class CampoOpcoes{
    constructor(limiteOpcoes, totalOpcoes, visualPreferencia, opcoes){
        this.limiteOpcoes = limiteOpcoes;
        this.totalOpcoes = totalOpcoes;
        this.visualPreferencia = visualPreferencia;
        this.opcoes = opcoes;
    }
}
*/
const pixacao = new Categoria(false, true, "Pixação", camposPixacao);
let camposAcessibilidade = []
camposAcessibilidade.push(new CampoFormulario(
                "Altura Livre", 
                false, 
                true, 
                new CampoOpcoes(1, 1, "teste", [new Opcao("")])
            )
);
camposAcessibilidade.push(new CampoFormulario(
                "Travessia para Pedestres", 
                false, 
                true, 
                // new CampoNumerico(0, 0)
                new CampoOpcoes(1, 1, "teste", [new Opcao("")])
            )
);
camposAcessibilidade.push(new CampoFormulario(
                "Sinalizacão tátil", 
                false, 
                true, 
                // new CampoNumerico(0, 0)
                new CampoOpcoes(1, 1, "teste", [new Opcao("")])
            )
);
camposAcessibilidade.push(new CampoFormulario(
                "Calçada 1,20m", 
                false, 
                true, 
                new CampoNumerico(0, 0)
            )
);
camposAcessibilidade.push(new CampoFormulario(
                "Calçada 70cm", 
                false, 
                true, 
                new CampoNumerico(0, 0)
            )
);
const acessibilidade = new Categoria(false, true, "Acessibilidade", camposAcessibilidade);
let categorias = [];
categorias.push(acessibilidade);
categorias.push(pixacao);
const estruturaFormulario = new EstruturaFormulario(categorias);

export default class Forms extends Component{
    constructor(){
        super()
        this.state = {}
    }
    // api = axios.create({
    //     baseURL: `http://localhost:3333`,
    //     method: "no-cors",
    // }); 
    getFormSchema = () => {
        console.log(this.state.categoria)
        console.log("h")
        let sqm = {
            "title": "Avaliação da Praça X",
            "type": "object",
            "properties": []
        }
        for (let categoria of estruturaFormulario.categorias){
            let prop ={ 
                    "type": "object",
                    "title": categoria.nome,
                    "properties": []
            }
            for(let campo of categoria.campos){
                let tipo = "integer";
                let min = undefined;
                let max = undefined;
                if(campo.campo.min == campo.campo.max){
                    tipo = "boolean"
                }
                else{
                    min = campo.campo.min;
                    max = campo.campo.max;
                }
                prop.properties.push({
                            "type": tipo,
                            "title": campo.nome,
                            "minimum": min,
                            "maximum": max,
                })
            }
                console.log(prop)
            sqm.properties.push(prop);
            /*
            sqm.properties.push(
                {
                    "type": "object",
                    "title": categoria.nome,
                    "properties": [
                        "nivelPixacao": {
                            "type": "number",
                            "title": "Nível de Pixação",
                            "enum": [
                                1,
                                2,
                                3
                            ]
                        ],
                        "nivelAbandono": {
                            "type": "number",
                            "title": "Nível de Abandono",
                            "enum": [
                                1,
                                2,
                                3
                            ]
                        },
                    }
                })
            */
            // sqm.properties.push(categoria);
        }

        const schema = sqm 
        // {
        //     "title": "Avaliação da Praça X",
        //     "type": "object",
        //     "properties": {
        //         "depredacao": {
        //             "type": "object",
        //             "title": "" + this.state.categoria,
        //             "properties": {
        //                 "nivelPixacao": {
        //                     "type": "number",
        //                     "title": "Nível de Pixação",
        //                     "enum": [
        //                         1,
        //                         2,
        //                         3
        //                     ]
        //                 },
        //                 "nivelAbandono": {
        //                     "type": "number",
        //                     "title": "Nível de Abandono",
        //                     "enum": [
        //                         1,
        //                         2,
        //                         3
        //                     ]
        //                 },
        //             }
        //         },
        //         "acessibilidade": {
        //             "type": "object",
        //             "title": "Acessibilidade",
        //             "properties": {
        //                 "calcada120": {
        //                     "title": "Calçada do Entorno Faixa livre > 1,20m",
        //                     "type": "boolean"
        //                 },
        //                 "calcada070": {
        //                     "title": "Calçada do Entorno Faixa de serviço > 0,70m",
        //                     "type": "boolean"
        //                 },
        //                 "alturaLivre": {
        //                     "title": "Altura livre mínima de 2,10m",
        //                     "type": "boolean"
        //                 },
        //                 "travessiaPedestre": {
        //                     "title": "Travessia de pedestre com rebaixamento e piso tatil conforme NBR 9050",
        //                     "type": "boolean"
        //                 },
        //                 "inclinacaoLongitudinal": {
        //                     "title": "Ausencia de obstaculos (buracos..)",
        //                     "type": "boolean"
        //                 },
        //                 "InclinacaoTransversal": {
        //                     "title": "Inclinação Transversal com máximo de 3%",
        //                     "type": "boolean"
        //                 },
        //                 "sinalizacaoTatil": {
        //                     "title": "Calçada do Entorno Faixa de serviço > 0,70m",
        //                     "type": "boolean"
        //                 },
        //             }
        //         },
        //         "acessoEEntorno": {
        //             "type": "object",
        //             "title": "Acesso e Entorno",
        //             "properties": {
        //                 "placaComNome": {
        //                     "title": "Placa com Nome",
        //                     "type": "integer"
        //                 },
        //                 "pontoDeTransporte": {
        //                     "title": "Ponto de Transporte",
        //                     "type": "integer"
        //                 },
        //                 "pontoDeTaxi": {
        //                     "title": "Pontos de Taxi no entorno (número de vagas)",
        //                     "type": "integer"
        //                 },
        //                 "estacionamentoVeiculos": {
        //                     "title": "Estacionamento de Veículos (número de vagas)",
        //                     "type": "integer"
        //                 },
        //                 "estacionamentoMotos": {
        //                     "title": "Estacionamento de Moto (número de vagas)",
        //                     "type": "integer"
        //                 },
        //             }
        //         },
        //     }
        // }
        return schema;
    }
    uiSchema = {
        "integer": {
            "ui:widget": "range"
        },
        "depredacao":{
            "nivelAbandono": {
                "ui:widget": "radio",
                "ui:options": {
                    "inline": true
                }
            },
            "nivelPixacao": {
                "ui:widget": "radio",
                "ui:options": {
                    "inline": true
                }
            },
        },
        "acessoEEntorno": {
            "estacionamentoMotos": {
                "ui:widget": "updown"
            },
            "estacionamentoVeiculos": {
                "ui:widget": "updown"
            },
            "placaComNome": {
                "ui:widget": "updown"
            },
            "pontoDeTaxi": {
                "ui:widget": "updown"
            },
            "pontoDeTransporte": {
                "ui:widget": "updown"
            }
        },
         "multipleChoicesList": {
    "ui:widget": "checkboxes"
  },
    }
    formData = {}
    render(){
        return (
            <div>
            <Form schema={getSchema(estruturaFormulario)} uiSchema={this.uiSchema} formData={this.formData}/>
            </div>
        );
    }
}
/*
export default function Dashboard() {
  //const [pracas, setPracas] = useState([]);
    // this.state = { categorias: [{name: "teste"}]}
    let categorias = [{name:"teste"}]

  const api = axios.create({
    baseURL: `http://localhost:3333`,
    method: "no-cors",
  });

  // categorias = getCategories()
  return (
    <div>
      <Form schema={formSchema} uiSchema={uiSchema} formData={formData}/>
    </div>
  );
}

    /*
  useEffect(() => {
    getPracas();
  }, [pracas.length]);

  function transformaTipo(tipo)
  {
    switch (tipo.value) {
      case 1:
        tipo.value = "Canteiros centrais e laterais de porte";
        break;
      case 2:
        tipo.value = "Cantos de quadra";
        break;
      case 3:
        tipo.value = "Jardim";
        break;
      case 4:
        tipo.value = "Largo";
        break;
      case 5:
        tipo.value = "Mirante";
        break;
      case 6:
        tipo.value = "Praça";
        break;
      case 7:
        tipo.value = "Praça (cercada)";
        break;
      case 8:
        tipo.value = "Terreno não ocupado";
        break;
      case 9:
        tipo.value = "Terrenos remanescentes de sistema viário e parcelamento do solo";
        break;
      case 10:
        tipo.value = "Rotatória";
        break;
      case 11:
        tipo.value = "Trevo";
        break;
      default:
        tipo.value = -1;
        break;
    }
    return tipo.value;
  }

  function transformaCategoria(categoria)
  {
    switch (categoria.value) {
      case 1:
        categoria.value = "de práticas sociais";
        break;
      case 2:
        categoria.value = "espaços livres privados de uso coletivo";
        break;
      default:
        categoria.value = -1;
        break;
    }
    return categoria.value;
  }

  return (
    <div className="ag-theme-alpine" style={{ height: 900, width: "100%" }}>
      <AgGridReact rowData={pracas}>
        <AgGridColumn
          field="name"
          headerName="Nome"
          flex={1}
          sortable={true}
          filter={true}
          floatingFilter={true}
        />
        <AgGridColumn
          field="common_name"
          headerName="Nome Popular"
          flex={1}
          sortable={true}
          filter={true}
          floatingFilter={true}
        />
        <AgGridColumn
          field="type"
          headerName="Tipo"
          flex={2}
          sortable={true}
          filter={true}
          floatingFilter={true}
          valueFormatter={transformaTipo}
        />
        <AgGridColumn
          field="free_space_category"
          headerName="Categoria"
          flex={1}
          sortable={true}
          filter={true}
          floatingFilter={true}
          valueFormatter={transformaCategoria}
        />
        <AgGridColumn
          field="comments"
          headerName="Comentários"
          flex={1}
          sortable={true}
          filter={true}
          floatingFilter={true}
        />
      </AgGridReact>
    </div>
  );
}
*/

const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};

const useStyles = makeStyles(styles);

