import { Divider, InputLabel, MenuItem, Select } from "@material-ui/core";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";
import Form from "@rjsf/material-ui";
import { Category } from "@material-ui/icons";

const selectStyle = {
    display: 'block',
    margin: 'auto',
    width: '100%',
}

const labelStyle = {
    marginTop: '1.69em',
}

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
        this.nome = nome;
        this.campos = campos;
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

export default class FormMount extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            headerIdx: -1,
            formsHeaders: [],
            forms: [],
            selectedForm: null
        }

        this.init = this.init.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.init()
    }

    async init() {
        try {
            let headers = await this.props.axios.get('http://localhost:3333/forms');

            if (headers.status === 200) {
                this.setState({
                    formsHeaders: headers.data,
                })
                console.log(this.state.formsHeaders)
            }
        } catch (e) {
            console.error(e);
        }
    }

    async handleChange(event) {
        let headerIdx = event.target.value;
        let headerId = this.state.formsHeaders[headerIdx].id

        this.setState({ headerIdx })

        let form = this.state.forms.find(f => f.id === headerId);

        if (form) {
            this.setState({ selectedForm: form });
            console.log(form)
                console.log("FORMSSSSS")
                console.log(this.state.forms)
        }
        else {
            try {
                let res = await this.props.axios.get(`http://localhost:3333/forms/${headerId}/complete`)

                this.setState({
                    forms: [...this.state.forms, res.data],
                    selectedForm: res.data
                })
                console.log("FORMSSSSS")
                console.log(this.state.forms)

                console.log(res.data);
            } catch (error) {
                console.error(error)
            }
        }
    }
    getFormStructure(){
        if (this.state.selectedForm){
            let camposSemTratar = this.state.selectedForm.FormsFields;
        //camposSemTratar = this.state.selectedForm.FormsFields.map(field => 
            let camposForm = []
            for(const field of camposSemTratar ){
                let campo;
                if(field.NumericField){
                    campo = new CampoNumerico(field.NumericField.min, field.NumericField.max);
                } else if(field.TextField){
                    campo = new CampoTexto(field.Textfield.char_limit)
                } else if(field.OptionField){
                    campo = new CampoOpcoes(1, 3, "", [])
                }
                let campoForm = new CampoFormulario(field.name, false, true, campo);
                camposForm.push(campoForm);
            }
            let categoria = new Categoria(false, true, "Teste", camposForm);
            return new EstruturaFormulario([categoria]);
        }
    }
    getSchema (estruturaFormulario) {
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
         }
  };
    createForm(){
        const estruturaFormulario = this.getFormStructure();
        const formSchema = this.getSchema(estruturaFormulario);
        return <Form schema={formSchema} uiSchema={this.uiSchema} formData={this.formData}/>
    }

    render() {
        return (

            <GridContainer>
                <GridItem xs={12}>
                    <InputLabel id="lbl-header" style={labelStyle}><h2>Formularios</h2></InputLabel>
                    <Select
                        labelId="lbl-header"
                        id="select-header"
                        name="header"
                        value={this.state.headerIdx}
                        style={selectStyle}
                        onChange={this.handleChange}
                    >
                        <MenuItem key={0} value={-1} disabled></MenuItem>

                        {this.state.formsHeaders.map((header, idx) => {
                            let date = new Date(header.createdAt);
                            return <MenuItem key={header.id} value={idx}>
                                {date.toLocaleDateString() + ' ' + date.toLocaleTimeString()}
                            </MenuItem>
                        })}
                    </Select>
                </GridItem>
                <GridItem xs={12}>
                    {this.state.selectedForm && <>
                        <h3><b>Formulario {this.state.selectedForm.id}</b></h3>
                        <> {this.createForm()} </>
                    </>
                    }
                </GridItem>
            </GridContainer>
        );
    }
}
