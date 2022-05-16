import React from 'react';
import database from "../database.json";
import form from "../form.json";
import { useState } from "react";
import { Divider } from '@material-ui/core';
import Button from "@material-ui/core/Button";
import category from "../category.json"
import form_field from "../form_field.json"

import axios from "axios";

const FieldInCategory = (category, field) =>
{
    if(category == field)
        return true;
    else 
        return false;
};

export function FormTest(){
    return (
        <div>
            <div style={{fontWeight: "bold", fontSize:"20px"}}>
                Gerador de Formulários
            </div>
            &nbsp;
            {category.map(e=>(
                <div>
                    <div style={{fontSize:"26px"}}>
                        <Button style={{marginRight: "25px"}} > ADD </Button>
                        {e.name}
                    </div>
                    <Divider variant="middle" />
                    {form_field.map(f =>(
                        FieldInCategory(e.id, f.category_id) ?(
                            <div>
                                <Button style={{marginRight: "25px", marginLeft: "25px"}} > ADD </Button>
                                {f.name}
                            </div>
                        ) : (<></>)
                    ))}
                    &nbsp;
                </div>
            ))}

            <Divider variant="middle" />


        </div>
    );
}
