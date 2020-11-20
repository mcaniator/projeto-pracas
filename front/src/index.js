/*!

=========================================================
* Material Dashboard React - v1.9.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

=========================================================

* Documentation

https://demos.creative-tim.com/material-dashboard-react/#/documentation/tutorial
https://demos.creative-tim.com/material-kit-react/#/documentation/tutorial

*/
import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import { Router, Route, Switch, Redirect } from "react-router-dom";

// core components
import Admin from "layouts/Admin.js";


// pages for this public pages
import Components from "views/website/Components";
import About from "views/website/About";
import LoginPage from "views/website/LoginPage";

import CreateUser from "views/admin/Users/UserCreate";
import EditUser from "views/admin/Users/UserEdit";
import ShowUser from "views/admin/Users/UserShow";



// pages for public pages project praças
import Home from "views/website/Home";

import "assets/css/material-dashboard-react.css?v=1.9.0";

const hist = createBrowserHistory();




ReactDOM.render(
  <Router history={hist}>
    <Switch>
      
      {/* Rotas admin */}
      <Route path="/admin" component={Admin} />


      
      <Redirect from="/logout" to="/" />
      
      {/* public routes */}
      <Route path="/quem-somos" component={About} />
      <Route path="/login-page" component={LoginPage} />
      <Route path="/components" component={Components} />
      <Route path="/" component={Home} exact />



    {/* Usuários */}
    <Route path="/admin/usuarios/editar" name="EDITAR" component={EditUser} />
    <Route path="/admin/usuarios/mostrar/" component={ShowUser} />
    <Route path="/admin/usuarios/criar/" component={CreateUser} />



    </Switch>
  </Router>,
  document.getElementById("root")
);


