import React from "react";
import { useState, useEffect } from "react";

// components
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import axios from "axios";

export default function Dashboard() {
  const [pracas, setPracas] = useState([]);

  const api = axios.create({
    baseURL: `http://localhost:3333`,
    method: "no-cors",
  });

  const getPracas = async () => {
    try {
      await api.get('/locals').then(res => {
        setPracas(res.data);
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    getPracas();
  }, [pracas.length]);

  function transformaTipo(tipo)
  {
    switch (tipo.value) {
      case 1:
        tipo.value = "Canteiros centrais e laterais de porte";
        break;
      case 2:
        tipo.value = "Cantos de quadra";
        break;
      case 3:
        tipo.value = "Jardim";
        break;
      case 4:
        tipo.value = "Largo";
        break;
      case 5:
        tipo.value = "Mirante";
        break;
      case 6:
        tipo.value = "Praça";
        break;
      case 7:
        tipo.value = "Praça (cercada)";
        break;
      case 8:
        tipo.value = "Terreno não ocupado";
        break;
      case 9:
        tipo.value = "Terrenos remanescentes de sistema viário e parcelamento do solo";
        break;
      case 10:
        tipo.value = "Rotatória";
        break;
      case 11:
        tipo.value = "Trevo";
        break;
      default:
        tipo.value = -1;
        break;
    }
    return tipo.value;
  }

  function transformaCategoria(categoria)
  {
    switch (categoria.value) {
      case 1:
        categoria.value = "de práticas sociais";
        break;
      case 2:
        categoria.value = "espaços livres privados de uso coletivo";
        break;
      default:
        categoria.value = -1;
        break;
    }
    return categoria.value;
  }

  return (
    <div className="ag-theme-alpine" style={{ height: 900, width: "100%" }}>
      <AgGridReact rowData={pracas}>
        <AgGridColumn
          field="name"
          headerName="Nome"
          flex={1}
          sortable={true}
          filter={true}
          floatingFilter={true}
        />
        <AgGridColumn
          field="common_name"
          headerName="Nome Popular"
          flex={1}
          sortable={true}
          filter={true}
          floatingFilter={true}
        />
        <AgGridColumn
          field="type"
          headerName="Tipo"
          flex={2}
          sortable={true}
          filter={true}
          floatingFilter={true}
          valueFormatter={transformaTipo}
        />
        <AgGridColumn
          field="free_space_category"
          headerName="Categoria"
          flex={1}
          sortable={true}
          filter={true}
          floatingFilter={true}
          valueFormatter={transformaCategoria}
        />
        <AgGridColumn
          field="comments"
          headerName="Comentários"
          flex={1}
          sortable={true}
          filter={true}
          floatingFilter={true}
        />
      </AgGridReact>
    </div>
  );
}
