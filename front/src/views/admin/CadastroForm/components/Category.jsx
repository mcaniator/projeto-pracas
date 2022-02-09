import React from "react";

import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import CustomInput from "components/CustomInput/CustomInput";
import RegularButton from "components/CustomButtons/Button";
import Snackbar from "components/Snackbar/Snackbar";

export default class Category extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 0,
            showSuccess: false,
            showError: false
        }

        this.closeMessage = this.closeMessage.bind(this)
        this.insertCategory = this.insertCategory.bind(this)
    }

    insertCategory() {
        let name = document.getElementById('category').value.trim();

        if (name.length > 0) {
            this.props.insertCategory(name)
            this.setState({
                showSuccess: true,
                showError: false,
            })
            document.getElementById('category').value = ''
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
                <GridItem xs={12} md={12} center>
                    <CustomInput
                        labelText="Categoria"
                        id="category"
                        formControlProps={{
                            fullWidth: true,
                        }}

                        inputProps={{
                            type: "text",
                        }}
                    ></CustomInput>
                </GridItem>
                <GridItem>
                    <RegularButton color="primary" onClick={this.insertCategory}>Adcionar</RegularButton>
                    <Snackbar
                        place={"tc"}
                        color="success"
                        message="Nova categoria inserida"
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