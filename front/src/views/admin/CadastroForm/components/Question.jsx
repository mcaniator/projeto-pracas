import React from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput";
import { Select, MenuItem, ListItem, IconButton, ListItemText, List, Paper, InputLabel } from "@material-ui/core";
import RegularButton from "components/CustomButtons/Button";
import Snackbar from "components/Snackbar/Snackbar";
import { Add, Delete } from "@material-ui/icons";

import DialogCategory from "./DialogCategory.js";

const selectStyle = {
    display: 'block',
    margin: 'auto',
    width: '100%',
    // marginTop: '1.8em',
}

const labelStyle = {
    marginTop: '1.69em',
}


export default class Question extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            category: 0,
            type: 0,
            style: 0,
            options: [],
            showSuccess: false,
            showError: false,
            showDialog: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.closeMessage = this.closeMessage.bind(this);
        this.inserQuestion = this.inserQuestion.bind(this);
        this.insertCategory = this.insertCategory.bind(this);
        this.addOption = this.addOption.bind(this);
        this.rmOption = this.rmOption.bind(this);
    }

    handleChange(event) {
        let name = event.target.name;
        this.setState({
            [name]: event.target.value,
        })
    }

    showDialog() {
        this.setState({ showDialog: true });
    }

    insertCategory(category) {
        if (category?.length > 0) {
            this.props.insertCategory(category)
        }

        this.setState({ showDialog: false })
    }

    inserQuestion() {
        let name = document.getElementById('question').value.trim();
        let category_id = this.state.category;
        let type = this.state.type;

        const types = {
            'Texto': 'text',
            'Numérico': 'numeric',
            'Opções': 'option',
        }

        if (name.length > 0 && category_id != 0 && type != 0) {
            let field, options = null;

            switch (types[type]) {
                case 'numeric':
                    let min = parseFloat(document.getElementById('min-number').value().trim()) || null;
                    let max = parseFloat(document.getElementById('min-number').value().trim()) || null;

                    field = {
                        id_field: -1, // nao lembro o porque de setar essa valor que eh invalido aqui xD
                        min,
                        max
                    }
                    break;
                case 'text':
                    let char_limit = parseInt(document.getElementById('limit').value.trim()) || null;

                    field = { char_limit }
                    break;
                case 'option':
                    let visual_preference;

                    switch (this.state.style) {
                        case 'Caixa de Seleção':
                            visual_preference = 0;
                            break;
                        case 'Botões Radio':
                            visual_preference = 1;
                            break;
                        case 'Caixa de checagem':
                            visual_preference = 2;
                            break;
                        default:
                            visual_preference = 0;
                    }

                    field = {
                        option_limit: this.state.options.length,
                        total_options: this.state.options.length,
                        visual_preference
                    }
                    options = this.state.options;
                    break;
            }

            let question = {
                name,
                category_id,
                active: true,
                optional: false,
            }

            this.props.insertQuestion(question, types[type], field, options);

            this.setState({
                category: 0,
                type: 0,
                options: [],
                showSuccess: true,
                showError: false
            })

            document.getElementById('question').value = ''
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

    addOption() {
        let opt = document.getElementById('option');
        let text = opt.value.trim()

        if (text.length > 0) {
            let newItem = (
                <ListItem key={text}>
                    <ListItemText
                        primary={text}
                    />
                    <IconButton edge="end" aria-label="deletar" onClick={() => { this.rmOption(text) }}>
                        <Delete />
                    </IconButton>
                </ListItem>)

            this.setState({
                options: [...this.state.options, newItem]
            })

            opt.value = ''
        }
    }

    rmOption(key) {
        this.setState({
            options: this.state.options.filter(e => { console.log(e); return e.key != key })
        })
    }

    render() {
        return (
            <>
                <GridContainer style={{ paddingLeft: '2em', paddingRight: '4em' }}>
                    <GridItem xs={12} md={6}>
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
                    <GridItem xs={12} md={2}>
                        <InputLabel id="lbl-type" style={labelStyle}>Tipo</InputLabel>
                        <Select
                            labelId="lbl-type"
                            id="select-type"
                            name="type"
                            value={this.state.type ? this.state.type : 0}
                            style={selectStyle}
                            label="Tipo"
                            onChange={this.handleChange}
                        >
                            <MenuItem value={'Texto'}>Texto</MenuItem>
                            <MenuItem value={'Numérico'}>Numérico</MenuItem>
                            <MenuItem value={'Opções'}>Opções</MenuItem>

                        </Select>
                    </GridItem>
                    <GridItem xs={12} md={4}>
                        <InputLabel id="lbl-category" style={labelStyle}>Categoria</InputLabel>
                        <Select
                            labelId="lbl-catogory"
                            id="select-category"
                            name="category"
                            value={this.state.category ? this.state.category : 0}
                            style={selectStyle}
                            renderValue={(selected) => {
                                if (selected === 0)
                                    return ''
                                return this.props.categories.find(e => e.id == selected).name;
                            }}
                            onChange={this.handleChange}
                        >
                            <MenuItem value={0}>
                                <RegularButton color="info" onClick={this.showDialog} style={{ width: '100%' }}>
                                    <Add />
                                    Nova Categoria
                                </RegularButton>
                            </MenuItem>
                            {this.props.categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                        </Select>
                    </GridItem>

                    {this.state.type == 'Texto' &&
                        <GridItem xs={12} md={4}>
                            <CustomInput
                                labelText="Limite de character"
                                id="limit"
                                formControlProps={{
                                    fullWidth: true,
                                }}

                                inputProps={{
                                    type: "number",
                                    inputProps: {
                                        min: 1,
                                    },
                                }}
                            ></CustomInput>
                        </GridItem>
                    }

                    {this.state.type == 'Numérico' &&
                        <>
                            <GridItem xs={12} md={4}>
                                <CustomInput
                                    labelText="Valor Mínimo"
                                    id="min-number"
                                    formControlProps={{
                                        fullWidth: true,
                                    }}

                                    inputProps={{
                                        type: "number",
                                        inputProps: {
                                            step: 0.1,
                                        },
                                    }}
                                ></CustomInput>
                            </GridItem>

                            <GridItem xs={12} md={4}>
                                <CustomInput
                                    labelText="Valor Máximo"
                                    id="max-number"
                                    formControlProps={{
                                        fullWidth: true,
                                    }}

                                    inputProps={{
                                        type: "number",
                                        inputProps: {
                                            step: 0.1,
                                        },
                                    }}
                                ></CustomInput>
                            </GridItem>
                        </>
                    }

                    {this.state.type == 'Opções' &&
                        <>
                            <GridItem xs={12} md={2}>
                                <InputLabel id="lbl-option" style={labelStyle}>Estilo Visual</InputLabel>
                                <Select
                                    labelId="lbl-option"
                                    id="style-option"
                                    name="style"
                                    value={this.state.style ? this.state.style : 0}
                                    style={selectStyle}
                                    label="Estilo Visual"
                                    onChange={this.handleChange}
                                >
                                    <MenuItem value={'Caixa de Seleção'}>Caixa de Seleção</MenuItem>
                                    <MenuItem value={'Botões Radio'}>Botões Radio</MenuItem>
                                    <MenuItem value={'Caixa de checagem'}>Caixa de Checagem</MenuItem>

                                </Select>
                            </GridItem>

                            <GridItem xs={12} md={6}>
                                <CustomInput
                                    labelText="Nova opcao"
                                    id="option"
                                    formControlProps={{
                                        fullWidth: true,
                                    }}

                                    inputProps={{
                                        type: "text",
                                    }}
                                ></CustomInput>
                            </GridItem>

                            <GridItem xs={12} md={4}>
                                <RegularButton style={labelStyle} color="info" onClick={this.addOption}>Adcionar</RegularButton>
                            </GridItem>

                            <GridItem xs={12} md={12}>
                                <Paper>
                                    <List sx={{
                                        width: '100%',
                                        maxWidth: 360,
                                        bgcolor: 'background.paper',
                                        position: 'relative',
                                        overflow: 'auto',
                                        maxHeight: 50,
                                        '& ul': { padding: 0 },
                                    }}>
                                        {this.state.options.length == 0 &&
                                            <ListItem>
                                                <ListItemText key={0} primary={"Adcione opções"} />
                                            </ListItem>}
                                        {this.state.options}
                                    </List>
                                </Paper>
                            </GridItem>
                        </>
                    }

                </GridContainer>
                <GridContainer style={{ paddingLeft: '2em', paddingRight: '4em' }}>
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
            </>
        );
    }
}