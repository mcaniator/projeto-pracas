import { Box, Card, CardHeader, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";

export default class FormPicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.onAddCategory = this.onAddCategory.bind(this);
    }

    onAddCategory(btn) {
        console.log(btn.value);
    }

    render() {
        return (<>
            <GridContainer>
                <GridItem xs={12}>
                    <List disablePadding>
                        {this.props.categories.map(category => {
                            return (
                                <div key={category.id}>
                                    <ListItem style={{ padding: 0 }}>
                                        {/* <ListItemIcon ><IconButton><Add /></IconButton></ListItemIcon> */}
                                        <ListItemText primary={<b>{category.name.toUpperCase()}
                                            <IconButton><Add /></IconButton></b>} />
                                    </ListItem>

                                    <List style={{ width: 'fit-content', padding: 0 }}>
                                        {this.props.fields
                                            .filter(field => field.category_id === category.id)
                                            .map(field => {
                                                return (
                                                    <ListItem key={field.id} sx={{ pl: 4 }}>
                                                        <ListItemIcon><IconButton><Add /></IconButton></ListItemIcon>
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

{/* <List key={(category.id + 'list')} component="div"> */ }
{/* {this.props.fields
                                            .filter(field => field.category_id === category.id)
                                            .map(field => {
                                                // console.log(field.id)
                                                let k = field.id + 1000;
                                                return (
                                                    <ListItem key={k}>
                                                        <ListItemIcon><IconButton><Add /></IconButton></ListItemIcon>
                                                        <ListItemText primary={field.name}></ListItemText>
                                                    </ListItem>
                                                );
                                            })} */}
{/* </List> */ }