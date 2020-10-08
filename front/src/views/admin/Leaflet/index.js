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
} from 'react-leaflet'
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import SimpleModal from "components/SimpleModal/SimpleModal.js"


import './style.css'

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
  }

  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Map center={position} zoom={this.state.zoom} style={{ height: '100vh', width: '100%' }}>

          <LayersControl position="topright">
              <BaseLayer checked name="OpenStreetMap.Mapnik">
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <BaseLayer name="OpenStreetMap.BlackAndWhite">
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
                />
              </BaseLayer>
              <Overlay /*checked */ name="Layer group with circles">
                <LayerGroup>
                  <Circle center={center} fillColor="blue" radius={200} />
                  <Circle
                    center={center}
                    fillColor="red"
                    radius={100}
                    stroke={false}
                  />
                  <LayerGroup>
                    <Circle
                      center={[51.51, -0.08]}
                      color="green"
                      fillColor="green"
                      radius={100}
                    />
                  </LayerGroup>
                </LayerGroup>
              </Overlay>
              <Overlay name="Feature group">
                <FeatureGroup color="purple">
                  <Popup>Popup in FeatureGroup</Popup>
                  <Circle center={center} radius={200} />
                  <Rectangle bounds={rectangle} />
                </FeatureGroup>
              </Overlay>
            </LayersControl>
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
          </Map>

        </GridItem>
      </GridContainer>
    )
  }
}
