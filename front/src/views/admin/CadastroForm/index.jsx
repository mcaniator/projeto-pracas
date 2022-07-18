import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import axios from "axios";
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, IconButton, ListItem, ListItemText, List, ListItemIcon, Button } from "@material-ui/core";
import { Add, ExpandMore } from "@material-ui/icons";

export default class FormBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [], // categoria com suas perguntas [{category, FormFields: []}]
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

    render() {
        return (
            <GridContainer>
                <GridItem xs={12}><h2>Criar Formulario</h2></GridItem>
                <GridItem xs={12} md={6} style={{ backgroundColor: '#aa0000' }}>
                    {this.state.data.map(category => (
                        <ExpansionPanel key={category.id}>
                            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                                <Typography>{category.name}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <List style={{ width: '100%', padding: 0 }}>
                                    <ListItem>
                                        <Button>Adcionar todas dessa categoria</Button>
                                    </ListItem>

                                    {category.FormsFields.map(field => (
                                        <ListItem key={field.id}>
                                            <ListItemText primary={field.name}></ListItemText>
                                            <ListItemIcon><IconButton><Add /></IconButton></ListItemIcon>
                                        </ListItem>
                                    ))}
                                </List>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    )
                    )}
                </GridItem>
                <GridItem xs={12} md={6} style={{ backgroundColor: '#00aa00' }}>
                    tchau
                </GridItem>
            </GridContainer>);
    }
}