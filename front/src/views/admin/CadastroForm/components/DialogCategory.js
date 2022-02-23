import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@material-ui/core";

export default class DialogCategory extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            category: ''
        }

        this.change = this.change.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleOk = this.handleOk.bind(this);
    }

    change(event) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    handleCancel() {
        this.props.close()
        this.setState({ category: '' })
    }

    handleOk() {
        this.props.close(this.state.category);
        this.setState({ category: '' })
    }


    render() {
        return (
            <Dialog
                sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                maxWidth="xs"
                open={this.props.open}
            >
                <DialogTitle>Nome categoria</DialogTitle>
                <DialogContent>
                    <TextField name="category" label="Categoria" value={this.state.category} onChange={this.change} variant="filled" type="text" fullWidth></TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleOk}>Ok</Button>
                    <Button autoFocus onClick={this.handleCancel}>
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}