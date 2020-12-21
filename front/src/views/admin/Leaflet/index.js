import React, { Component } from 'react'
import {
  LayersControl,
  Map,
  Marker,
  Popup,
  TileLayer,
  Polygon
} from 'react-leaflet'
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "../../../components/website/CustomButtons/Button.js";
import Control from 'react-leaflet-control';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { JsonForms } from '@jsonforms/react';
import {
  materialRenderers,
  materialCells
} from '@jsonforms/material-renderers';
//import json que cria os forms
import schema from '../../../forms/example/schema.json';
import uischema from '../../../forms/example/uischema.json';

const { BaseLayer, Overlay } = LayersControl

type State = {
  lat: number,
  lng: number,
  zoom: number,
}

const center = [-21.7642, -43.3496]

export default class Leaflet extends Component<{}, State> {

  state = {
    lat: -21.7642,
    lng: -43.3496,
    zoom: 13,
    currentPolygon: [],
    polygonList: [{id : 0, 
                   coordinates : [[-21.784528085620426, -43.35050582885743],
                                  [-21.751368561385405, -43.33505630493164],
                                  [-21.740845188197625, -43.38140487670899],
                                  [-21.773210071085067, -43.38277816772462]]
                  }],
    drawActive: false,
    register: {
      open : false
    },
  }

  handleClick(e)
  {
    if (this.state.drawActive)
    {
      const newPos = [e.latlng.lat, e.latlng.lng];
      this.setState((state) => {
        return {currentPolygon: state.currentPolygon.concat([newPos])}
      });
    }
  }

  startDraw()
  {
    this.setState({drawActive: true})
  }

  addPolygon()
  {
    this.setState({drawActive: false})


    if(this.state.currentPolygon.length > 2)
    {
      this.setState((state) => {
        return {
          drawActive: false,
          polygonList: state.polygonList.concat({id: state.polygonList.length,  coordinates: state.currentPolygon})
        }
      });
    }
    this.clearDraw();
  }

  clearDraw()
  {
    this.setState({currentPolygon: []});
  }

  registerDialogOpen()
  {
    this.setState({register: {open:true}});
  }
  registerDialogClose()
  {
    this.setState({register: {open:false}});
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    
    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Map center={position} zoom={this.state.zoom} style={{ height: '100vh', width: '100%' }} onClick={this.handleClick.bind(this)}>

            <Control position="topleft" >
              <button 
                onClick={ this.startDraw.bind(this) }
                style={{color: "#f00"}}
              >
                Começar Desenho
              </button>
            </Control>

            <Control position="topleft" >
              <button 
                onClick={ this.addPolygon.bind(this) }
              >
                Adicionar Poligono
              </button>
            </Control>

            <Control position="topleft" >
              <button 
                onClick={ this.clearDraw.bind(this) }
              >
                Descartar Desenho
              </button>
            </Control>

            <Marker position={center}>
              <Popup>
                {/* <SimpleModal/> */}
                <Button type="button" onClick={this.registerDialogOpen.bind(this) } color="primary" size="sm" col>
                  Cadastrar praça
                </Button>
                <Dialog
                  fullWidth={true}
                  maxWidth={'md'}
                  open={this.state.register.open}
                  onClose={ this.registerDialogClose.bind(this) }
                  aria-labelledby="max-width-dialog-title"
                >
                  <DialogTitle>Cadastrar Praça</DialogTitle>
                  <DialogContent dividers>
                    <JsonForms
                      schema={schema}
                      uischema={uischema}
                      renderers={materialRenderers}
                      cells={materialCells}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button autoFocus onClick={this.registerDialogClose.bind(this)} color="primary">
                      Cancelar
                    </Button>
                    <Button color="primary">
                      Confirmar
                    </Button>
                  </DialogActions>

                </Dialog>
              </Popup>
            </Marker>

            <TileLayer
                url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />

            <Polygon key="drawPolygon" positions={this.state.currentPolygon} color="blue" />
            {this.state.polygonList.map(polygon => (
              <Polygon key={polygon.id} positions={polygon.coordinates} color="red" />
            ))}

            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </Map>

        </GridItem>
      </GridContainer>
    )
  }
}
