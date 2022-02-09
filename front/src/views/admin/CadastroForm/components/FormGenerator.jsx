import React from 'react';
import database from "../database.json";
import form from "../form.json";
import { useState } from "react";
import { Divider } from '@material-ui/core';

function FormGenerator() {
  
  const addType = (id) => { // Controle de adição de tipos
    var count = Object.keys(form).length;
    
    var add = {
      "id" : count,
      "nome": database[id].nome,
      "perguntas": [database[id].perguntas]
    };
    
    form.push(add);
  }

  return (
    <div>

       {database.map(e => (
        <div>
          <button onClick={() => {addType(e.id)}} style={{marginRight: "25px"}} > ADD </button>
          {e.nome}
        </div>          
       ))}

       <Divider variant="middle" />

       {form.map(e => (
        <div>

          <h1 style={{fontSize: "22px"}}>
            {e.nome}
            <Divider />
          </h1>
          
          {e.perguntas.map( str => (
            <h2 style={{fontSize: "15px"}}>
            {str}
            </h2>
          ))}  

        </div>          
       ))}
    </div>
  );
}

export default FormGenerator;
