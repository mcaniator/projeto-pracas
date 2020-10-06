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
import Unarchive from "@material-ui/icons/Unarchive";
import Language from "@material-ui/icons/Language";

// core components/views for Admin layout
import DashboardPage from "views/admin/Dashboard/Dashboard.js";
import TableList from "views/admin/TableList/TableList.js";
import Typography from "views/admin/Typography/Typography.js";
import Icons from "views/admin/Icons/Icons.js";
import Maps from "views/admin/Maps/Maps.js";
import NotificationsPage from "views/admin/Notifications/Notifications.js";
import Leaflet from "views/admin/Leaflet";
import UpgradeToPro from "views/admin/UpgradeToPro/UpgradeToPro.js";

// project praças
import Pracas from "views/admin/Pracas";
import Users from "views/admin/Users/Index";
import CreateUser from "views/admin/Users/UserCreate";
import EditUser from "views/admin/Users/UserEdit";
import ShowUser from "views/admin/Users/UserShow";


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
    path: "/criar",
    name: "Criar usuário",
    icon: Person,
    component: CreateUser,
    layout: "/admin/usuarios",
    notView: true,
  },
  {
    path: "/editar",
    name: "Editar Usuário",
    icon: Person,
    component: EditUser,
    layout: "/admin/usuarios",
    notView: true,
  },
  {
    path: "/mostrar",
    name: "Mostrar Usuário",
    icon: Person,
    component: ShowUser,
    layout: "/admin/usuarios",
    notView: true,
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
    path: "/maps",
    name: "Maps",
    icon: LocationOn,
    component: Maps,
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
    path: "/upgrade-to-pro",
    name: "Upgrade To PRO",
    icon: Unarchive,
    component: UpgradeToPro,
    layout: "/admin"
  }
];

export default dashboardRoutes;
