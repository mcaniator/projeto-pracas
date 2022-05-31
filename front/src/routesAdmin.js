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

*/
// @material-ui/icons
import Dashboard from "@material-ui/icons/Dashboard";
import Person from "@material-ui/icons/Person";
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import BubbleChart from "@material-ui/icons/BubbleChart";
import LocationOn from "@material-ui/icons/LocationOn";
import Notifications from "@material-ui/icons/Notifications";
import AddAlert from "@material-ui/icons/AddAlert";

// core components/views for Admin layout
import DashboardPage from "views/admin/Dashboard";
import TableList from "views/admin/TableList";
import Typography from "views/admin/Typography";
import Icons from "views/admin/Icons";
import NotificationsPage from "views/admin/Notifications";
import Leaflet from "views/admin/Leaflet";
import SweetAlert from "views/admin/SweetAlert"


// project praças
import Pracas from "views/admin/Pracas";
import Users from "views/admin/Users";
import testing from 'views/admin/test'


import Home from "views/website/Home";


import CreateUser from "views/admin/Users/UserCreate";
import EditUser from "views/admin/Users/UserEdit";
import ShowUser from "views/admin/Users/UserShow";
import { Test } from "@jsonforms/core";
import { ContactSupportOutlined } from "@material-ui/icons";


const dashboardRoutes = [
  {
    path: "/pracas",
    name: "Praças",
    icon: Dashboard,
    component: Pracas,
    layout: "/admin"
  },
  {
    path: "/usuarios",
    name: "Usuários",
    icon: Person,
    component: Users,
    layout: "/admin"
  },
  {
    path: "/usuarios-criar",
    name: "Criar usuário",
    icon: Person,
    component: CreateUser,
    layout: "/admin",
    notRenderOnSidebar: true,
  },
  {
    path: "/usuarios-editar",
    name: "Editar Usuário",
    icon: Person,
    component: EditUser,
    layout: "/admin",
    notRenderOnSidebar: true,
  },
  {
    path: "/usuarios-mostrar",
    name: "Mostrar Usuário",
    icon: Person,
    component: ShowUser,
    layout: "/admin",
    notRenderOnSidebar: true,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: Dashboard,
    component: DashboardPage,
    layout: "/admin"
  },
  {
    path: "/table",
    name: "Table List",
    icon: "content_paste",
    component: TableList,
    layout: "/admin"
  },
  {
    path: "/typography",
    name: "Typography",
    icon: LibraryBooks,
    component: Typography,
    layout: "/admin"
  },
  {
    path: "/icons",
    name: "Icons",
    icon: BubbleChart,
    component: Icons,
    layout: "/admin"
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: Notifications,
    component: NotificationsPage,
    layout: "/admin"
  },
  {
    path: "/leaflet",
    name: "Leaflet",
    icon: LocationOn,
    component: Leaflet,
    layout: "/admin"
  },
  {
    path: "/sweet-alert",
    name: "Sweet Alert",
    icon: AddAlert,
    component: SweetAlert,
    layout: "/admin"
  },
  {
    path: '/testing',
    name: 'testing',
    icon: AddAlert,
    component: testing,
    layout: '/admin'
  }
];

export default dashboardRoutes;
