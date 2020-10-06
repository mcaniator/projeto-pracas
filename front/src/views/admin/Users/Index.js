import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import EditIcon from "@material-ui/icons/Edit";
import ShowIcon from "@material-ui/icons/Pageview";
import CreateIcon from "@material-ui/icons/AddCircle";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";

import avatar from "assets/img/faces/marc.jpg";

const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};

const useStyles = makeStyles(styles);

const buttons = () => {
  return (
    <>
      <Button href="/admin/usuarios/mostrar" color="success">{<ShowIcon />}</Button>
      <Button href="/admin/usuarios/editar" color="info">{<EditIcon />}</Button>
      <Button href="/admin/usuarios/remove" color="danger">{<DeleteIcon />}</Button>
    </>
  );
}

export default function UserIndex() {
  const classes = useStyles();
  return (
    <div>
      <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="success">
            <h4 className={classes.cardTitleWhite}>Lista de usuários</h4>
            <p className={classes.cardCategoryWhite}>
              Usuários cadastrados no sistema
            </p>
          </CardHeader>
          <CardBody>
            <Table
              tableHeaderColor="success"
              tableHead={["Nome", "E-mail", "Contato","Tipo", ""]}
              tableData={[
                ["Dakota Rice", "mail@mail.com", "Niger", "Admin", buttons()],
                ["Minerva Hooper", "mail@mail.com", "Curaçao", "Admin", buttons()],
                ["Sage Rodriguez", "mail@mail.com", "Netherlands", "Admin", buttons()],
                ["Philip Chaney", "mail@mail.com", "Korea, South", "Admin", buttons()],
                ["Doris Greene", "mail@mail.com", "Malawi", "Admin", buttons()],
                ["Mason Porter", "mail@mail.com", "Chile", "Admin", buttons()]
              ]}
            />
          </CardBody>
        </Card>
      </GridItem>
      </GridContainer>
    </div>
  );
}
