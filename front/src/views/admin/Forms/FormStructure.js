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
getSchema = (estruturaFormulario) => {
    let sqm = {
        "title": "Avaliação da Praça X",
        "type": "object",
        "properties": []
    }
    for (const categoria of estruturaFormulario.categorias){
        let prop = {
            "type": "object",
            "title": categoria.name,
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

            } else if( campo.campo instanceof CampoNumerico){
                prop.properties.push({
                            "type": "Integer",
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
            // sqm.properties.push(categoria);
        }
*/

module.exports = {Opcao, CampoOpcoes, CampoNumerico, CampoTexto, Categoria, CampoFormulario, EstruturaFormulario, getSchema}
