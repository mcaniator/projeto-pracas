import { Box, Card, CardHeader, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Add, Delete } from "@material-ui/icons";
import RegularButton from "components/CustomButtons/Button";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";

export default class FormPicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            addedCategories: [],
            addedFields: [],
        };

        this.addCategory = this.addCategory.bind(this);
        this.addField = this.addField.bind(this);
        this.createForm = this.createForm.bind(this);
    }

    addCategory(category, fields) {
        let idx = this.state.addedCategories.indexOf(category);

        if (idx === -1) {
            this.setState({
                addedCategories: [...this.state.addedCategories, category],
                addedFields: [...this.state.addedFields, fields]
            })
        }
        else {
            let addedFields = this.state.addedFields;
            let addedField = addedFields[idx];

            for (const field of fields) {
                if (!addedField.includes(field)) {
                    addedField.push(field);
                }
            }

            this.setState({ addedFields })
        }
    }

    addField(category, field) {
        let idx = this.state.addedCategories.indexOf(category);

        if (idx === -1) {
            idx = this.state.addedCategories.length;

            this.setState({
                addedCategories: [...this.state.addedCategories, category],
                addedFields: [...this.state.addedFields, [field]]
            })
        }
        else {
            let addedFields = this.state.addedFields;
            let addedField = addedFields[idx];

            if (addedField.indexOf(field) === -1) {
                addedField.push(field);
                this.setState({ addedFields })
            }
        }
    }

    removeCategory(category) {
        let idx = this.state.addedCategories.indexOf(category);

        let addedFields = this.state.addedFields;
        let addedField = addedFields[idx];

        let categoryFields = this.props.fields;

        if (idx !== -1) {
            this.state.addedCategories.splice(idx);

            for (const field of categoryFields) {
                if (addedField.includes(field)) {
                    this.state.addedFields.splice(idx);;
                }
            }

            this.setState({
                addedCategories: [...this.state.addedCategories],
                addedFields: [...this.state.addedFields]
            })
        }
    }

    removeField(category, field) {
        let idx = this.state.addedCategories.indexOf(category);

        if (idx === -1) {
            idx = this.state.addedCategories.length;

            this.setState({
                addedCategories: [...this.state.addedCategories],
                addedFields: [...this.state.addedFields]
            })
        }
        else {
            let addedFields = this.state.addedFields;
            let addedField = addedFields[idx];

            if (addedField.indexOf(field) !== -1) {
                addedField.splice(addedField.indexOf(field));
                this.setState({ addedFields })
            }
        }
    }

    async createForm() {
        if (this.state.addedFields.length === 0)
            return;

        // Array 2d para 1d
        let merged = [].concat.apply([], this.state.addedFields)
        merged = merged.map(e => ({ id: e.id }));

        try {
            let res = await this.props.axios.post('http://localhost:3333/forms', { fields: merged })
            console.log(res);

            if (res.status === 200)
                this.setState({
                    addedCategories: [],
                    addedFields: []
                })
        }
        catch (e) {
            console.error(e);
        }
    }

    render() {
        return (<>
            <GridContainer>
                <GridItem xs={12}>
                    <List disablePadding>
                        {this.props.categories.map(category => {
                            const categoryFields = this.props.fields
                                .filter(field => field.category_id === category.id);

                            return (
                                <div key={category.id}>
                                    <ListItem style={{ padding: 0 }}>
                                        <ListItemText primary={<b>{category.name.toUpperCase()}
                                            <IconButton onClick={() => { this.addCategory(category, categoryFields) }}><Add /></IconButton></b>} />
                                    </ListItem>

                                    <List style={{ width: 'fit-content', padding: 0 }}>
                                        {categoryFields.map(field => {
                                            return (
                                                <ListItem key={field.id} sx={{ pl: 4 }}>
                                                    <ListItemIcon><IconButton onClick={() => { this.addField(category, field) }} ><Add /></IconButton></ListItemIcon>
                                                    <ListItemText primary={field.name}></ListItemText>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                    <Divider />
                                </div>
                            );
                        })}
                    </List>
                </GridItem>

                <GridItem xs={12}>
                    <h3><b>Formulario:</b></h3>
                    <List>
                        {this.state.addedCategories.map((category, idx) => {
                            return (
                                <div key={category.id}>
                                    <ListItem style={{ padding: 0 }}>
                                        <ListItemText primary={<b>{category.name.toUpperCase()}
                                            <IconButton onClick={() => { this.removeCategory(category) }}><Delete /></IconButton></b>} />
                                    </ListItem>

                                    <List style={{ width: 'fit-content', padding: 0 }}>
                                        {this.state.addedFields[idx].map(field => {
                                            return (
                                                <ListItem key={field.id} sx={{ pl: 4 }}>
                                                    <ListItemIcon><IconButton onClick={() => { this.removeField(category, field) }}><Delete /></IconButton></ListItemIcon>
                                                    <ListItemText primary={field.name}></ListItemText>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                    <Divider />
                                </div>
                            );
                        })}
                    </List>
                </GridItem>
                <GridItem xs={12} md={4}>
                    <RegularButton color="info" onClick={this.createForm}>salvar</RegularButton>
                </GridItem>
            </GridContainer>
        </>
        )
    }
}