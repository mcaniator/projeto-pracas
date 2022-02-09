import React from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput";
import { Select, MenuItem } from "@material-ui/core";
import RegularButton from "components/CustomButtons/Button";
import Snackbar from "components/Snackbar/Snackbar";

const selectStyle = {
    display: 'block',
    margin: 'auto',
    width: '100%',
    marginTop: '2.6em',
}


export default class Question extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 0,
            showSuccess: false,
            showError: false
        }

        this.handleChange = this.handleChange.bind(this)
        this.closeMessage = this.closeMessage.bind(this)
        this.inserQuestion = this.inserQuestion.bind(this)
    }

    handleChange(event) {
        this.setState(() => {
            return {
                value: event.target.value,
            }
        })
    }

    inserQuestion() {
        let question = document.getElementById('question').value.trim();
        let category = this.state.value;

        if (question.length > 0 && category != 0) {
            let index = this.props.data.findIndex(e => e.nome === category)

            this.props.insertQuestion(index, question)

            document.getElementById('question').value = ''
            this.setState({
                value: 0,
                showSuccess: true,
                showError: false
            })
        }
        else {
            this.setState({
                showError: true,
                showSuccess: false
            })
        }
    }

    closeMessage(message) {
        if (message == 'success') {
            this.setState({ showSuccess: false })
        }
        else if (message == 'error') {
            this.setState({ showError: false })
        }
    }

    render() {
        return (
            <GridContainer style={{}}>
                <GridItem xs={12} md={8}>
                    <CustomInput
                        labelText="Pergunta"
                        id="question"
                        formControlProps={{
                            fullWidth: true,
                        }}

                        inputProps={{
                            type: "text",
                        }}
                    ></CustomInput>
                </GridItem>
                <GridItem xs={12} md={4}>
                    <Select
                        id="select"
                        value={this.state.value ? this.state.value : 0}
                        style={selectStyle}
                        renderValue={(selected) => {
                            console.log(this.state)
                            if (selected === 0) {
                                return <span style={{ color: '#AAAAB2' }}>Categoria</span>;
                            }

                            return selected;
                        }}
                        onChange={this.handleChange}
                    >
                        <MenuItem value={0} disabled>Categoria</MenuItem>

                        {/* Por que react? Por que eu nao posso usar um map e resolver em uma linha? */}
                        {/* {this.state.props.map(e => (<MenuItem key={e.nome}>{e.nome}</MenuItem>))} */}
                        {
                            (() => {
                                let arr = []

                                for (let i = 0; i < this.props.data.length; i++) {
                                    arr.push(<MenuItem value={this.props.data[i].nome}>{this.props.data[i].nome}</MenuItem>)
                                }

                                return arr
                            })()
                        }
                    </Select>
                </GridItem>
                <GridItem>
                    <RegularButton color="primary" onClick={this.inserQuestion}>Adcionar</RegularButton>
                    <Snackbar
                        place={"tc"}
                        color="success"
                        message="Nova pergunta inserida"
                        open={this.state.showSuccess}
                        closeNotification={() => { this.closeMessage('success') }}
                        close
                    ></Snackbar>

                    <Snackbar
                        place={"tc"}
                        color="warning"
                        message="Preencha todos os campos!"
                        open={this.state.showError}
                        closeNotification={() => { this.closeMessage('error') }}
                        close
                    ></Snackbar>
                </GridItem>
            </GridContainer>
        );
    }
}