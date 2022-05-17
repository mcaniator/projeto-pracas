import React from 'react';
import database from "../database.json";
import form from "../form.json";
import { useState } from "react";
import { Divider } from '@material-ui/core';
import Button from "@material-ui/core/Button";
import Category from "../category.json";
import form_field from "../form_field.json";
import form_test from "../form_test.json";

import axios from "axios";

const FieldInCategory = (category, field) =>
{
    if(category == field)
        return true;
    else 
        return false;
};

const AddQuestionToForm = (id) =>
{
    var check = 0;
    if(form_test[0].question.includes(id)) {
        check = 1;
    }
    if(check == 0){
        form_test[0].question.push(id);    
    }    
};

const AddCategoryToForm = (id) =>
{
    var check = 0;
    if(form_test[0].category.includes(id)) {
        check = 1;
    }
    if(check == 0){
        form_test[0].category.push(id);
        for(var i in form_field){
            if(FieldInCategory(id, form_field[i].category_id)){
                AddQuestionToForm(form_field[i].id);
            }
        }  
    }
};

const AuxLoadCategory = (id) => {
    if(form_test[0].category.includes(id)){
        for(var i in Category){
        if(Category[i].id == id)
            return Category[i].name;
        }
    }    
};

const AuxLoadQuestion = (id) => {
    if(form_test[0].question.includes(id)){
        for(var i in form_field){
        if(form_field[i].id == id)
            return form_field[i].name;
        }
    }    
};

const LoadCategory = () => {
    const array = []
    var check = 0;

    for(var i in form_test[0].category){
        array.push(AuxLoadCategory(form_test[0].category[i]));
        for(var k in form_test[0].question){
            array.push(AuxLoadQuestion(form_test[0].question[k]))
        }
    }
    console.log(array);
    return array;
};

export function FormTest(){
    return (
        <div>
            <div style={{fontWeight: "bold", fontSize:"20px"}}>
                Gerador de Formulários
            </div>
            &nbsp;
            {Category.map(e=>(
                <div>
                    <div style={{fontSize:"26px"}}>
                        <Button onClick={() => AddCategoryToForm(e.id)} style={{marginRight: "25px"}} > ADD </Button>
                        {e.name}
                    </div>
                    <Divider variant="middle" />
                    {form_field.map(f =>(
                        FieldInCategory(e.id, f.category_id) ?(
                            <div>
                                <Button onClick={() => AddQuestionToForm(f.id)} style={{marginRight: "25px", marginLeft: "25px"}} > ADD </Button>
                                {f.name}
                            </div>
                        ) : (<></>)
                    ))}
                    &nbsp;
                </div>
            ))}

            <Divider variant="middle" />
            
            <div>
                {LoadCategory()}
            </div>

        </div>
    );
}
