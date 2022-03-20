import React from 'react';
import database from "../database.json";
import form from "../form.json";
import { useState } from "react";
import { Divider } from '@material-ui/core';
import Button from "@material-ui/core/Button";

function FormGenerator() {
  
  const addType = (id) => { // Controle de adição de tipos
    /*var count = Object.keys(form).length; Usado antes para expandir o formulário*/
    var check = 0;
    
    var add = {
      "id" : id,
      "nome": database[id].nome,
      "perguntas": [database[id].perguntas]
    };

    for(var k in form)
    {/*Procura no formulário se a pergunta já existe*/
      if(form[k].id == id) {
        check = 1;
        console.log("i");
        break;
      }
    };

    if(check == 0)/*Caso não exista no form, a categoria é adicionada */
      form.push(add);
  }

  const deleteCategory = (id) => {//Remove a categoria específica

    for(var index in form){
      if(form[index].id == id){
          form.splice(index,1); // Remove a categoria de id igual
          break; // força a parada do loop
      }
    };

  }

  const submitForm = () => {
    //precisa da API
  }

  const [name,setName]=useState(null);
  function getName(val){
    setName(val.target.value);
    console.log(name);
  }

  return (
    <div>

       {database.map(e => (
        <div>
          <Button onClick={() => {addType(e.id)}} style={{marginRight: "25px"}} > ADD </Button>
          {e.nome}
        </div>          
       ))}

       <Divider variant="middle" />

       {form.map(e => (
        <div>

          <h1 style={{fontSize: "22px"}}>
            {e.nome}
            <Button onClick={() => {deleteCategory(e.id)}} style={{marginLeft: "25px"}} > REMOVE </Button>
            <Divider />
          </h1>

          {e.perguntas.map( (str, index) => (// arrumar mapeamento
            <h2 style={{fontSize: "15px"}}>
            {(index ? "\n" : "") + str}
            </h2>
          ))} 
        </div>          
       ))}
      <Divider variant="middle" />
      <input type="text" onChange={getName} />
      <Button onClick = {() => {submitForm()}} style={{marginLeft: "25px", marginTop: "25px"}} > SUBMIT </Button>
    </div>
  );
}

export default FormGenerator;
