import React from 'react';
import {FormlyConfig} from 'react-formly'



export default class Evaluation extends React.Component{
  constructor(props){
    super(props)
    let pracaId = this.props.location.state //recebe id da praça a se avaliar
  }

  render(){
    return <span>{this.props.location.state}</span>
  }
}
