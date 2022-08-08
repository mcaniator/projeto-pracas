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
        this.openQuestionModal = this.openQuestionModal.bind(this);
        this.openCategoryModal = this.openCategoryModal.bind(this);
        this.closeQuestionModal = this.closeQuestionModal.bind(this);
        this.closeCategoryModal = this.closeCategoryModal.bind(this);
        this.insertQuestion = this.insertQuestion.bind(this);

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

        let config, uiConfig;

        if (field.TextField) {
            config = { type: 'string' }
        }
        else if (field.NumericField) {
            let max = field.NumericField.max, min = field.NumericField.min;
            console.log(field.NumericField)

            if (typeof max === "number" && typeof min === "number")
                uiConfig = { "ui:widget": "range" };
            else
                uiConfig = { "ui:widget": "updown" }

            config = { type: 'number', minimum: min, maximum: max }
        }
        else if (field.OptionField) {
            console.log(field);
            config = {
                type: 'array',
                title: field.name,
                items: {
                    type: "string",
                    enum: field.OptionField.Options.map(e => e.name)
                },
                uniqueItems: true
            }

            uiConfig = { "ui:widget": "checkboxes" };
        };

        this.setState({
            uiSchema: {
                ...this.state.uiSchema,
                [field.name]: uiConfig
            }
        });

        if (!this.state.formSchema.properties[category.name]) {
            this.addCategory(catIdx, {
                [field.name]: config
            });
        }
        else {
            let stateCategory = this.state.formSchema.properties[category.name];

            stateCategory.properties[field.name] = config;

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

        setTimeout(
            () => { console.log(this.state.formSchema.properties, this.state.uiSchema) },
            500
        )
    }

    openQuestionModal() { this.setState({ openQuestion: true }) }
    openCategoryModal() { this.setState({ openNewCategory: true }) }
    closeQuestionModal() { this.setState({ openQuestion: false }) }

    async closeCategoryModal(newCategory) {
        this.setState({ openNewCategory: false });

        if (typeof newCategory === 'string' && newCategory.trim().length > 0) {
            newCategory = {
                name: newCategory,
                optional: false,
                active: true
            }

            try {
                let res = await axios.post('http://localhost:3333/category', { category: [newCategory] })

                if (res.status == 200) {
                    let cat = res.data[0];
                    cat.FormsFields = [];

                    console.log(cat);

                    this.setState({
                        data: [...this.state.data, cat]
                    });
                }
            }
            catch (e) {
                console.error(e);
            }
        }
    }

    async insertQuestion(question, type, field, options) {
        try {
            let resForms = await axios.post('http://localhost:3333/form_field', { question, type, field, options })
            let formField = resForms.data.formField;

            const category = this.state.data.find(cat => cat.id === formField.category_id);

            // Desse jeito eu mudo o estado de uma maneira facil sem chamar this.setState
            // Mas devia eu fazer desse jeito? Algo me diz que nao, mas esta funcionando
            category.FormsFields.push(formField);

            this.closeQuestionModal();
        }
        catch (e) {
            console.error(e);
        }
    }

    render() {
        return (
            <GridContainer>
                <GridItem xs={12}><h2>Criar Formulário</h2></GridItem>

                <GridItem xs={12} style={{ marginBottom: '0.5em' }}>
                    <Paper style={{ padding: '0.2em' }}>
                        <RegularButton color="primary" onClick={this.openQuestionModal}>Nova Pergunta</RegularButton>
                        <RegularButton color="primary" onClick={this.openCategoryModal}>Nova Categoria</RegularButton>
                    </Paper>
                </GridItem>

                <GridItem xs={12} md={6}>
                    {this.state.data.map((category, catIdx) => (
                        <ExpansionPanel key={category.id}>
                            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                                <Typography>{category.name}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                {category.FormsFields.length === 0 &&
                                    <Typography>Sem perguntas cadastradas para essa categoria</Typography>
                                }
                                {category.FormsFields.length > 0 &&
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
                                }
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
                <Modal open={this.state.openQuestion} onClose={this.closeQuestionModal}>
                    <Paper style={modalStyle}>
                        <Question categories={this.state.data} insertQuestion={this.insertQuestion}></Question>
                    </Paper>
                </Modal>

                <DialogCategory open={this.state.openNewCategory} close={this.closeCategoryModal}></DialogCategory>
            </GridContainer>);
    }
}
