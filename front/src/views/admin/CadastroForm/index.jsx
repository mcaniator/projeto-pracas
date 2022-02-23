import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Tabs from "components/CustomTabs/CustomTabs.js";
import Question from "./components/Question.jsx";
import Category from "./components/Category.jsx"

export default class FormBuilder extends React.Component {
    constructor(props) {
        super(props);

        let database = require('./database.json');
        let database2 = require('./database2.json');

        this.state = {
            data: database,
            data2: database2
        };

        this.insertQuestion = this.insertQuestion.bind(this);
        this.insertCategory = this.insertCategory.bind(this);
    }

    insertQuestion(index, question) {
        let copy = [...this.state.data];
        copy[index].perguntas.push(question);

        this.setState({
            data: copy
        });
    }

    insertCategory(name) {
        let newCategory = {
            nome: name,
            perguntas: []
        }

        this.setState({
            data: [...this.state.data, newCategory]
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
                                    tabContent: <Question data={this.state.data2} insertQuestion={this.insertQuestion} />
                                },
                                {
                                    tabName: "2",
                                    tabContent: <Category insertCategory={this.insertCategory} />
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