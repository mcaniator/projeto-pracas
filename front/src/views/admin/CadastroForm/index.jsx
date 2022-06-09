import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Tabs from "components/CustomTabs/CustomTabs.js";
import Question from "./components/Question.jsx";
import FormGenerator from "./components/FormGenerator.jsx";
import {FormTest} from './components/FormTest.jsx';

import axios from "axios";

export default class FormBuilder extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            categories: [],
            fields: [],
        };

        this.insertQuestion = this.insertQuestion.bind(this);
        this.insertCategory = this.insertCategory.bind(this);
        this.init = this.init.bind(this);

        this.init();
    }

    async init() {
        try {
            let categories = await axios.get('http://localhost:3333/category');
            let fields = await axios.get('http://localhost:3333/form_field');

            if (categories.status === 200) {
                this.setState({
                    categories: categories.data,
                    fields: fields.data
                })
            }
        } catch (e) {
            console.error(e);
        }
    }

    async insertQuestion(question, type, field, options) {
        try {
            let resForms = await axios.post('http://localhost:3333/form_field', { question, type, field, options })
            console.log('resforms:', resForms);
            console.log('data:', resForms.data);

            this.setState({
                fields: [...this.state.fields, resForms.data.formField]
            })
        }
        catch (e) {
            console.error(e);
        }
    }

    async insertCategory(name) {
        let newCategory = {
            name,
            optional: false,
            active: true,
        }

        try {
            let res = await axios.post('http://localhost:3333/category', { category: [newCategory] })

            if (res.status == 200)
                this.setState({
                    categories: [...this.state.categories, ...res.data]
                })

        }
        catch (e) {
            console.error(e);
        }
    }

    render() {
        return (
            <div>
                <GridContainer>
                    <GridItem xs={12}>
                        <Tabs
                            // title="Construtor de Formulario:"
                            headerColor="success"
                            tabs={[
                                {
                                    tabName: "1",
                                    tabContent: <Question categories={this.state.categories} insertQuestion={this.insertQuestion} insertCategory={this.insertCategory} />
                                },
                                {
                                    tabName: "2",
                                    tabContent: <FormTest categories={this.state.categories} fields={this.state.fields} />
                                },
                                {
                                    tabName: "3",
                                    tabContent: <FormGenerator onDataChange={this.handleDataChange} />
                                }
                            ]}
                        />
                    </GridItem>
                </GridContainer>
            </div>
        );
    }
}