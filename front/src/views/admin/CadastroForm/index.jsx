import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Tabs from "components/CustomTabs/CustomTabs.js";
import Question from "./components/Question";


export default class FormBuilder extends React.Component {
    constructor(props) {
        super(props);

        let database = require('./database.json');

        this.state = {
            data: database,
        };

        this.handleDataChange = this.handleDataChange.bind(this);

        console.log(this.state.data)
    }

    handleDataChange(newElement) {
        this.setState({
            data: [...this.state.data, newElement]
        })
    }

    render() {
        return(
            <div>
                <GridContainer>
                    <GridItem xs={12}>
                        <Tabs 
                            // title="Construtor de Formulario:"
                            headerColor="success"
                            tabs={[
                                {
                                    tabName: "1",
                                    tabContent: <Question data={this.state.data} onDataChange={this.handleDataChange} />
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