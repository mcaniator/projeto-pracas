"use server";

import { point } from "leaflet";
//import { geoJSON } from "leaflet";
//import shpjs from "shpjs";
import shp from "shpjs";

const getPolygonFromShp = async (formData: FormData) => {
  const file = formData.get("shpFile");
  const arrayBuffer = await file.arrayBuffer();
  const geoJSON = await shp(arrayBuffer);
  console.log(geoJSON.features);

  geoJSON.features.forEach((feature) => {
    if (feature.geometry.type == "Polygon") {
      feature.geometry.coordinates.forEach((pointsArray) => {
        pointsArray.forEach((point) => {
          console.log(point);
        });
      });
    }
  });

  geoJSON.features[0].geometry.coordinates.forEach((pointsArray) => {
    pointsArray.forEach((point) => {
      //console.log(point);
    });
  });

  /*geoJSON.features[0].geometry.coordinates[0].forEach((point) => {
    //console.log(point);
  });*/

  //console.log(file);
  //const shapefile = require("shapefile");
  //const geo = shapefile.shp2json
};

export { getPolygonFromShp };
