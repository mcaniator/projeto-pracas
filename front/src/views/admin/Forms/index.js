import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button.js";

//import Form from '@rjsf/material-ui';
import { withTheme } from '@rjsf/core';
import { Theme as MaterialUITheme } from '@rjsf/material-ui';
import avatar from "assets/img/faces/marc.jpg";
// const Form = withTheme(MaterialUITheme);
import Form from "@rjsf/material-ui";
console.log(Form);


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

export default function Forms() {
  /**
   * const formSchema = {
    "type": "object",
    "title": "Avaliação da praça X",
    "properties": {
      "number": {
        "title": "Number",
        "type": "number"
      },
      "integer": {
        "title": "Integer",
        "type": "integer"
      },
      "numberEnum": {
        "type": "number",
        "title": "Number enum",
        "enum": [
          1,
          2,
          3
        ]
      },
      "nivelPixacao": {
        "type": "number",
        "title": "Nível de Pixação",
        "enum": [
          1,
          2,
          3
        ]
      },
      "nivelAbandono": {
        "type": "number",
        "title": "Nível de Abandono",
        "enum": [
          1,
          2,
          3
        ]
      },
      "integerRange": {
        "title": "Integer range",
        "type": "integer",
        "minimum": 42,
        "maximum": 100
      },
      "integerRangeSteps": {
        "title": "Integer range (by 10)",
        "type": "integer",
        "minimum": 50,
        "maximum": 100,
        "multipleOf": 10
      }
    }
  }; **/
  const formSchema = {
    "title": "Avaliação da Praça X",
    "type": "object",
    "properties": {
      "depredacao": {
        "type": "object",
        "title": "Depredação",
        "properties": {
          "nivelPixacao": {
            "type": "number",
            "title": "Nível de Pixação",
            "enum": [
              1,
              2,
              3
            ]
          },
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
      },
      "acessibilidade": {
        "type": "object",
        "title": "Acessibilidade",
        "properties": {
          "calcada120": {
            "title": "Calçada do Entorno Faixa livre > 1,20m",
            "type": "boolean"
          },
          "calcada070": {
            "title": "Calçada do Entorno Faixa de serviço > 0,70m",
            "type": "boolean"
          },
          "alturaLivre": {
            "title": "Altura livre mínima de 2,10m",
            "type": "boolean"
          },
          "travessiaPedestre": {
            "title": "Travessia de pedestre com rebaixamento e piso tatil conforme NBR 9050",
            "type": "boolean"
          },
          "inclinacaoLongitudinal": {
            "title": "Ausencia de obstaculos (buracos..)",
            "type": "boolean"
          },
          "InclinacaoTransversal": {
            "title": "Inclinação Transversal com máximo de 3%",
            "type": "boolean"
          },
          "sinalizacaoTatil": {
            "title": "Calçada do Entorno Faixa de serviço > 0,70m",
            "type": "boolean"
          },
        }
      },
      "acessoEEntorno": {
        "type": "object",
        "title": "Acesso e Entorno",
        "properties": {
          "placaComNome": {
            "title": "Placa com Nome",
            "type": "integer"
          },
          "pontoDeTransporte": {
            "title": "Ponto de Transporte",
            "type": "integer"
          },
          "pontoDeTaxi": {
            "title": "Pontos de Taxi no entorno (número de vagas)",
            "type": "integer"
          },
          "estacionamentoVeiculos": {
            "title": "Estacionamento de Veículos (número de vagas)",
            "type": "integer"
          },
          "estacionamentoMotos": {
            "title": "Estacionamento de Moto (número de vagas)",
            "type": "integer"
          },
        }
      },
    }
  };
  const uiSchema = {
    "integer": {
      "ui:widget": "updown"
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
    }
  }
  const formData = {}
  return (
    <div>
      <Form schema={formSchema} uiSchema={uiSchema} formData={formData}/>
    </div>
  );
}
