import React from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput";
import { Select, MenuItem } from "@material-ui/core";
import RegularButton from "components/CustomButtons/Button";
import Snackbar from "components/Snackbar/Snackbar";
import { Add } from "@material-ui/icons";

import DialogCategory from "./DialogCategory.js";

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
            showError: false,
            showDialog: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleRenderValue = this.handleRenderValue.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.closeMessage = this.closeMessage.bind(this);
        this.inserQuestion = this.inserQuestion.bind(this);
        this.insertCategory = this.insertCategory.bind(this);
    }

    handleChange(event) {
        this.setState(() => {
            return {
                value: event.target.value,
            }
        })
    }

    handleRenderValue(selected) {
        console.log(selected)
        switch (selected) {
            case 0:
            case 1: {
                return <span style={{ color: '#AAAAB2' }}>Categoria</span>;
            }

            default:
                return selected;
        }

    }

    showDialog() {
        this.setState({showDialog: true});
    }

    insertCategory(category) {
        console.log(category);
        if(category?.length > 0) {
            this.props.insertCategory(category)
        }

        this.setState({showDialog: false})
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
            <GridContainer style={{paddingLeft: '2em', paddingRight: '4em'}}>
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
                        renderValue={this.handleRenderValue}
                        onChange={this.handleChange}
                    >
                        <MenuItem value={0} disabled>Categoria</MenuItem>
                        <MenuItem value={1}>
                            <RegularButton color="white" onClick={this.showDialog} style={{ width: '100%' }}>
                                    <Add/>
                                Nova Categoria
                            </RegularButton>
                        </MenuItem>

                        {/* {this.state.props.map(e => (<MenuItem key={e.nome}>{e.nome}</MenuItem>))} */}
                        {
                            (() => {
                                let arr = []

                                for (let i = 0; i < this.props.data.length; i++) {
                                    arr.push(<MenuItem key={'k' + i} value={this.props.data[i].category}>{this.props.data[i].category}</MenuItem>)
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
                <DialogCategory open={this.state.showDialog} close={this.insertCategory}></DialogCategory>
            </GridContainer>
        );
    }
}