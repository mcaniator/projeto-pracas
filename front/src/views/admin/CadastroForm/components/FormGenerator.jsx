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

          <p style={{fontSize: "22px"}}>
            {e.nome}
            <Divider />
          </p>
          
          {e.perguntas.map( str => (
            <p style={{fontSize: "15px"}}>
            {str}
            </p>
          ))}  

        </div>          
       ))}
    </div>
  );
}

export default FormGenerator;
