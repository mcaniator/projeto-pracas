import React from 'react';
import {FormlyConfig} from 'react-formly'
import axios from "axios";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import { Select, MenuItem, ListItem, IconButton, ListItemText, List, Paper, InputLabel, FormControlLabel, FormLabel, Radio, RadioGroup, FormControl} from "@material-ui/core";

const api = axios.create({
  baseURL: `http://localhost:3333`,
  method: "no-cors",
});

const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};

export default class Evaluation extends React.Component{
  constructor(props){
    super(props)
    let pracaId = this.props.location.state //recebe id da praça a se avaliar
  }

  state = {}

  componentWillMount(){
    const getForms = async() => {
        try {
            await api.get('/form_field').then(res => {
                this.setState(res['data']['0'])
                console.log(this.state)
            });
        } catch (err) {
            console.error(err.message);
        }
    }
    getForms()

  }

  render(){
    return <div>
      <span>{this.props.location.state}</span>
      <Card>
        <CardHeader color="primary">
            <h4 className={styles.cardTitleWhite}>Realizar Avaliação</h4>
        </CardHeader>
        <CardBody>
            <GridContainer>
            <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">{this.state['name']}</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name={this.state['name']}
              >
                <FormControlLabel value="1'" control={<Radio />} label="Opção 1" />
                <FormControlLabel value="2" control={<Radio />} label="Opção 2" />
              </RadioGroup>
            </FormControl>
            </GridContainer>
          </CardBody>
      </Card>
    </div>
  }
}
