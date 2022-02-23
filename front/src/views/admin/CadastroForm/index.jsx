import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Tabs from "components/CustomTabs/CustomTabs.js";
import Question from "./components/Question.jsx";

export default class FormBuilder extends React.Component {
    constructor(props) {
        super(props);

        let database = require('./database.json');
        let database2 = require('./database2.json');

        console.log(database2)

        this.state = {
            data: database,
            data2: database2
        };

        this.insertQuestion = this.insertQuestion.bind(this);
        this.insertCategory = this.insertCategory.bind(this);
        this.insertCategory2 = this.insertCategory2.bind(this);
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
                                    tabContent: <Question data={this.state.data2} insertQuestion={this.insertQuestion} insertCategory={this.insertCategory2}/>
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