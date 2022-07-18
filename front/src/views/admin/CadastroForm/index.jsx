import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import axios from "axios";
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, IconButton, ListItem, ListItemText, List, ListItemIcon, Button, Paper, Modal } from "@material-ui/core";
import { Add, ExpandMore } from "@material-ui/icons";
import Question from "./components/Question2";

import RegularButton from "components/CustomButtons/Button";

import Form from "@rjsf/material-ui";
import DialogCategory from "./components/DialogCategory";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    bgcolor: 'background.paper',
    // border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const formData = {};
export default class FormBuilder extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            data: [], // categoria com suas perguntas [{category, FormFields: []}]
            formSchema: {
                title: "Pré-Visualização Formulário",
                type: "object",
                properties: {},
            },
            uiSchema: {},
            openQuestion: false,
            openNewCategory: false,
        }

        this.init = this.init.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);

        this.init();
    }

    async init() {
        let response = await axios.get('http://localhost:3333/form_field/category');

        this.setState({
            data: response.data,
        });
    }

    addCategory(idx, fields = {}) {
        let category = this.state.data[idx];

        if (category) {
            this.setState({
                formSchema: {
                    ...this.state.formSchema,
                    properties: {
                        ...this.state.formSchema.properties,
                        [category.name]: {
                            type: 'object',
                            properties: fields,
                        }
                    }
                }
            })
        }
    }

    addAllFields(idx) {
        let category = this.state.data[idx];

        if (category) {
            const fields = {}
            for (let field of category.FormsFields) {
                fields[field.name] = {
                    type: 'string'
                }
            }
            this.addCategory(idx, fields);
        }
    }

    addField(catIdx, fieIdx) {
        let category = this.state.data[catIdx];
        let field = category.FormsFields[fieIdx];

        if (!this.state.formSchema.properties[category.name]) {


            this.addCategory(catIdx, {
                [field.name]: {
                    type: 'string'
                }
            });
        }
        else {
            let stateCategory = this.state.formSchema.properties[category.name];

            stateCategory.properties[field.name] = {
                type: 'string'
            }
            console.log(stateCategory)

            this.setState({
                formSchema: {
                    ...this.state.formSchema,
                    properties: {
                        ...this.state.formSchema.properties,
                        [category.name]: stateCategory
                    }
                }
            })
        }
    }

    openModal(opt) {
        opt = opt === 1 ? 'openQuestion' : 'openNewCategory';

        this.setState({
            [opt]: true
        })
    }

    closeModal(opt) {
        opt = opt === 1 ? 'openQuestion' : 'openNewCategory';

        this.setState({
            [opt]: false
        })
    }

    render() {
        return (
            <GridContainer>
                <GridItem xs={12}><h2>Criar Formulário</h2></GridItem>

                <GridItem xs={12} style={{ marginBottom: '0.5em' }}>
                    <Paper style={{ padding: '0.2em' }}>
                        <RegularButton color="primary" onClick={() => { this.openModal(1) }}>Nova Pergunta</RegularButton>
                        <RegularButton color="primary" onClick={() => { this.openModal(2) }}>Nova Categoria</RegularButton>
                    </Paper>
                </GridItem>

                <GridItem xs={12} md={6}>
                    {this.state.data.map((category, catIdx) => (
                        <ExpansionPanel key={category.id}>
                            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                                <Typography>{category.name}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <List style={{ width: '100%', padding: 0 }}>
                                    <ListItem>
                                        <Button onClick={() => { this.addAllFields(catIdx) }}>Adcionar todas dessa categoria</Button>
                                    </ListItem>

                                    {category.FormsFields.map((field, fieIdx) => (
                                        <ListItem key={field.id}>
                                            <ListItemText primary={field.name}></ListItemText>
                                            <ListItemIcon><IconButton onClick={() => { this.addField(catIdx, fieIdx) }}><Add /></IconButton></ListItemIcon>
                                        </ListItem>
                                    ))}
                                </List>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    )
                    )}
                </GridItem>
                <GridItem xs={12} md={6}>
                    <Paper style={{ padding: '1em' }}>
                        < Form schema={this.state.formSchema} uiSchema={this.state.uiSchema} formData={formData} />
                    </Paper>
                </GridItem>

                {/* Modal adcionar pergunta */}
                <Modal open={this.state.openQuestion} onClose={() => { this.closeModal(1) }}>
                    <Paper style={modalStyle}>
                        <Question categories={this.state.data}></Question>
                    </Paper>
                </Modal>

                <DialogCategory open={this.state.openNewCategory} close={() => { this.closeModal(2) }}></DialogCategory>
            </GridContainer>);
    }
}
