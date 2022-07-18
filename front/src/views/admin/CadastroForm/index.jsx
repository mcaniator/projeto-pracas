import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import axios from "axios";
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, IconButton, ListItem, ListItemText, List, ListItemIcon, Button } from "@material-ui/core";
import { Add, ExpandMore } from "@material-ui/icons";

import Form from "@rjsf/material-ui";

const formData = {};
export default class FormBuilder extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            data: [], // categoria com suas perguntas [{category, FormFields: []}]
            formSchema: {
                title: "Criar Fom",
                type: "object",
                properties: {},
            },
            uiSchema: {}
        }

        this.init = this.init.bind(this);

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

    render() {
        return (
            <GridContainer>
                <GridItem xs={12}><h2>Criar Formulario</h2></GridItem>
                <GridItem xs={12} md={6} style={{ backgroundColor: '#aa0000' }}>
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
                <GridItem xs={12} md={6} style={{ backgroundColor: '#00aa00' }}>
                    < Form schema={this.state.formSchema} uiSchema={this.state.uiSchema} formData={formData} />
                </GridItem>
            </GridContainer>);
    }
}