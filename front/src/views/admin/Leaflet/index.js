import React, { Component } from 'react'
import {
  Circle,
  FeatureGroup,
  LayerGroup,
  LayersControl,
  Map,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
  Polygon
} from 'react-leaflet'
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import SimpleModal from "components/SimpleModal/SimpleModal.js"

const { BaseLayer, Overlay } = LayersControl

type State = {
  lat: number,
  lng: number,
  zoom: number,
}

const center = [-21.7642, -43.3496]
const rectangle = [
  [-21.7642, -43.3496],
  [-21.73, -43.32],
]

export default class Leaflet extends Component<{}, State> {
  state = {
    lat: -21.7642,
    lng: -43.3496,
    zoom: 13,
    currentPos: 0,
    positions: []
  }
  //state.positions.concat([newPos])

  handleClick(e){
    const newPos = [e.latlng.lat, e.latlng.lng];
  this.setState((state) => {
  return {positions: state.positions.concat([newPos])}
  });
}

  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Map center={position} zoom={this.state.zoom} style={{ height: '100vh', width: '100%' }} onClick={this.handleClick.bind(this)}>

                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center}>
                  <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                    <SimpleModal/>
                  </Popup>
                </Marker>

                <TileLayer
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                />

                <Polygon positions={this.state.positions} color="blue" />
          </Map>

        </GridItem>
      </GridContainer>
    )
  }
}
