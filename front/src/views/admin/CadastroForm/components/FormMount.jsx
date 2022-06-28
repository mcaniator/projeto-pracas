import { Divider, InputLabel, MenuItem, Select } from "@material-ui/core";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import React from "react";

const selectStyle = {
    display: 'block',
    margin: 'auto',
    width: '100%',
}

const labelStyle = {
    marginTop: '1.69em',
}

export default class FormMount extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            headerIdx: -1,
            formsHeaders: [],
            forms: [],
            selectedForm: null
        }

        this.init = this.init.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.init()
    }

    async init() {
        try {
            let headers = await this.props.axios.get('http://localhost:3333/forms');

            if (headers.status === 200) {
                this.setState({
                    formsHeaders: headers.data,
                })
            }
        } catch (e) {
            console.error(e);
        }
    }

    async handleChange(event) {
        let headerIdx = event.target.value;
        let headerId = this.state.formsHeaders[headerIdx].id

        this.setState({ headerIdx })

        let form = this.state.forms.find(f => f.id === headerId);

        if (form) {
            this.setState({ selectedForm: form });
        }
        else {
            try {
                let res = await this.props.axios.get(`http://localhost:3333/forms/${headerId}/complete`)

                this.setState({
                    forms: [...this.state.forms, res.data],
                    selectedForm: res.data
                })

                console.log(res.data);
            } catch (error) {
                console.error(error)
            }
        }
    }

    render() {
        return (
            <GridContainer>
                <GridItem xs={12}>
                    <InputLabel id="lbl-header" style={labelStyle}><h2>Formularios</h2></InputLabel>
                    <Select
                        labelId="lbl-header"
                        id="select-header"
                        name="header"
                        value={this.state.headerIdx}
                        style={selectStyle}
                        onChange={this.handleChange}
                    >
                        <MenuItem key={0} value={-1} disabled></MenuItem>

                        {this.state.formsHeaders.map((header, idx) => {
                            let date = new Date(header.createdAt);
                            return <MenuItem key={header.id} value={idx}>
                                {date.toLocaleDateString() + ' ' + date.toLocaleTimeString()}
                            </MenuItem>
                        })}
                    </Select>
                </GridItem>
                <GridItem xs={12}>
                    {this.state.selectedForm && <>
                        <h3><b>Formulario {this.state.selectedForm.id}</b></h3>

                        {this.state.selectedForm.FormsFields.map(field => {
                            return <article key={field.id}>
                                <h4><b>Pergunta:</b> {field.name}</h4>
                                <h4><b>Categoria:</b> {field.category_id}</h4>

                                {field.TextField && <>
                                    <h4><b>Tipo:</b> texto</h4>
                                    <h5><b>Char limit:</b> {field.TextField.char_limit || '-'}</h5>
                                </>}

                                {field.NumericField && <>
                                    <h4><b>Tipo:</b> numero</h4>
                                    <h5><b>Min:</b>{field.NumericField.min}</h5>
                                    <h5><b>Max:</b>{field.NumericField.max}</h5>
                                </>}

                                {field.OptionField && <>
                                    <h4><b>Tipo:</b> opcao</h4>
                                    <h5><b>Preferencia visual:</b> {field.OptionField.visual_preference}</h5>
                                    <h5><b>Opcoes:</b></h5>
                                    <ul>
                                        {field.OptionField.Options.map(e => <li key={e.id}>{e.name || 'null'}</li>)}
                                    </ul>
                                </>}

                                <Divider />
                            </article>
                        })}
                    </>
                    }
                </GridItem>
            </GridContainer>
        );
    }
}