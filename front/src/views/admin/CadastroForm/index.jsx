import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Tabs from "components/CustomTabs/CustomTabs.js";
import Question from "./components/Question.jsx";

import axios from "axios";

export default class FormBuilder extends React.Component {
    constructor(props) {
        super(props);

        let database = require('./database.json');
        let database2 = require('./database2.json');

        this.state = {
            categories: [],
            data: database,
            data2: database2
        };

        this.insertQuestion = this.insertQuestion.bind(this);
        this.insertCategory = this.insertCategory.bind(this);
        this.insertCategory2 = this.insertCategory2.bind(this);
        this.init = this.init.bind(this);

        this.init();
    }

    async init() {
        try {
            let res = await axios.get('http://localhost:3333/category');


            if (res.status === 200) {
                this.setState({
                    categories: res.data
                })
            }
        } catch (e) {

        }
    }

    insertQuestion(index, question) {
        let copy = [...this.state.data];
        copy[index].perguntas.push(question);

        this.setState({
            data: copy
        });
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

    insertCategory2(name) {
        let newCategory = {
            category: name,
            questions: []
        }

        this.setState({
            data2: [...this.state.data2, newCategory]
        })
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
                                    tabContent: <Question data={this.state.data2} categories={this.state.categories} insertQuestion={this.insertQuestion} insertCategory={this.insertCategory} />
                                },
                                {
                                    tabName: "2",
                                    tabContent: (<h1>2</h1>)
                                },
                                {
                                    tabName: "3",
                                    tabContent: (<h1>3</h1>)
                                }
                            ]}
                        />
                    </GridItem>
                </GridContainer>
            </div>
        );
    }
}