import React from 'react';
import database from "../database.json";
import form from "../form.json";
import { useState } from "react";
import { Divider } from '@material-ui/core';
import Button from "@material-ui/core/Button";
import Category from "../category.json";
import form_field from "../form_field.json";
import form_test from "../form_test.json";

export function FormTest(props) {
    let Category = props.categories;
    let form_field = props.fields;

    const FieldInCategory = (category, field) => {
        if (category == field)
            return true;
        else
            return false;
    };

    const AddQuestionToForm = (id) => {
        var check = 0;
        if (form_test[0].question.includes(id)) {
            check = 1;
        }
        if (check == 0) {
            form_test[0].question.push(id);
        }
    };

    const AddCategoryToForm = (id) => {
        var check = 0;
        if (form_test[0].category.includes(id)) {
            check = 1;
        }
        if (check == 0) {
            form_test[0].category.push(id);
            for (var i in form_field) {
                if (FieldInCategory(id, form_field[i].category_id)) {
                    AddQuestionToForm(form_field[i].id);
                }
            }
        }
    };

    const RemoveCategoryForm = (id) => {
        form_test[0].category.splice(form_test[0].category.indexOf(id));
    };

    const RemoveQuestionForm = (id) => {
        form_test[0].question.splice(form_test[0].question.indexOf(id));
    };

    const AuxLoadCategory = (id) => {
        if (form_test[0].category.includes(id)) {
            for (var i in Category) {
                if (Category[i].id == id)
                    return Category[i].name;
            }
        }
    };

    const AuxLoadQuestion = (id) => {
        if (form_test[0].question.includes(id)) {
            for (var i in form_field) {
                if (form_field[i].id == id)
                    return form_field[i].name;
            }
        }
    };

    return (
        <div>
            <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                Gerador de Formulários
            </div>
            &nbsp;
            {Category.map(e => (
                <div>
                    <div style={{ fontSize: "26px" }}>
                        <Button onClick={() => AddCategoryToForm(e.id)} style={{ marginRight: "25px" }} > ADD </Button>
                        {e.name}
                        <Button onClick={() => RemoveCategoryForm(e.id)} style={{ marginRight: "25px", position: 'absolute', right: '0' }} > REMOVE </Button>
                    </div>
                    <Divider variant="middle" />
                    {form_field.map(f => (
                        FieldInCategory(e.id, f.category_id) ? (
                            <div>
                                <Button onClick={() => AddQuestionToForm(f.id)} style={{ marginRight: "25px", marginLeft: "25px" }} > ADD </Button>
                                {f.name}
                                <Button onClick={() => RemoveQuestionForm(f.id)} style={{ marginRight: "25px", position: 'absolute', right: '0' }} > REMOVE </Button>
                            </div>
                        ) : (<></>)
                    ))}
                    &nbsp;
                </div>
            ))}

            <Divider variant="middle" />

            {form_test[0].category.map(e => (
                <div>
                    <div style={{ fontSize: "26px" }}>
                        {AuxLoadCategory(e)}
                    </div>
                    {form_test[0].question.map(f => (
                        <div style={{ marginLeft: "15px" }}>
                            {AuxLoadQuestion(f)}
                        </div>
                    ))}
                </div>
            ))
            }
        </div>
    );
}
