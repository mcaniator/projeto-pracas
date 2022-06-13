import { Box, Card, CardHeader, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Add, Delete } from "@material-ui/icons";
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
    }

    addCategory(category, fields) {
        let idx = this.state.addedCategories.indexOf(category);

        if (idx === - 1) {
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

            // let merge = [].concat.apply([], this.state.addedFields)
            // console.log(merge);
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

                <GridItem>
                    <h3><b>Formulario:</b></h3>
                    <List>
                        {this.state.addedCategories.map((category, idx) => {
                            return (
                                <div key={category.id}>
                                    <ListItem style={{ padding: 0 }}>
                                        <ListItemText primary={<b>{category.name.toUpperCase()}
                                            <IconButton><Delete /></IconButton></b>} />
                                    </ListItem>

                                    <List style={{ width: 'fit-content', padding: 0 }}>
                                        {this.state.addedFields[idx].map(field => {
                                            return (
                                                <ListItem key={field.id} sx={{ pl: 4 }}>
                                                    <ListItemIcon><IconButton><Delete /></IconButton></ListItemIcon>
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
            </GridContainer>
        </>
        )
    }
}