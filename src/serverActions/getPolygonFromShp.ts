"use server";

const getPolygonFromShp = async (formData: FormData) => {
  const file = formData.get("shpFile") as File;
  const arrayBuffer = await file.arrayBuffer();
  console.log(file);
  //const shapefile = require("shapefile");
  //const geo = shapefile.shp2json
};

export { getPolygonFromShp };
