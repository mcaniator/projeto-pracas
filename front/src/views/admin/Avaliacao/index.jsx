import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

// image
import image from "assets/img/bgPracas2.jpg"
import Create from "@material-ui/icons/Create";
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Icon, Select, InputLabel, MenuItem, Tooltip } from "@material-ui/core";
// import ListItemButton from "@material-ui/core/ListItem"
import AccessibleIcon from '@material-ui/icons/Accessible';
import CustomInput from "components/CustomInput/CustomInput";
import { Add } from "@material-ui/icons";

const styles = {
  bg: {
    backgroundImage: `url(${image})`,
    backgroundColor: "#ff0",
    height: "33vh",
    width: "100%",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% auto",
    backgroundPosition: "center",
    position: "relative",
  },
  squareName: {
    bottom: "0",
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0, 0.5)",
    width: "fit-content",
    padding: "7px",
    fontSize: "1.5em",
    position: "absolute",
    bottom: "0",
    backdropFilter: "blur(2px)",
    listStyle: "none",
  },
  editBtn: {
    position: "absolute",
    right: "0",
    padding: "5px",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    cursor: "pointer",
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    width: '100%',
    overflow: 'auto',
  },
  listItem: {
    width: '30%'
  }
};

// const useStyles = makeStyles(styles);

function items() {
  return [1, 2, 3, 4, 5].map(value => {
    return (
      <ListItem key={value} button>
        <ListItemAvatar>
          <Avatar
            alt={`Avatar n°${value + 1}`}
          />
        </ListItemAvatar>
        <ListItemText id={value} primary={`Pessoa ${value}`} secondary={'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Null... '} />
      </ListItem>
    );
  });
}

export default function TableList() {
  // const classes = useStyles();
  // console.log(classes);
  return (
    <GridContainer>
      <GridItem style={styles.bg} xs={12}>
        <Tooltip title="Mudar foto" style={styles.editBtn}>
          <IconButton>
            <Create></Create>
          </IconButton>
        </Tooltip>
        <ul style={styles.squareName}>
          <li>Nome de Praça</li>
        </ul>
      </GridItem>
      <GridItem xs={12}>
        <h3>Últimas Avaliações</h3>
        <hr></hr>
        <List style={styles.list}>
          {items()}
          <ListItem button>
            <Icon> <Add /> </Icon>
            <ListItemText primary={`Ver Mais`} />
          </ListItem>
        </List>
        <hr></hr>
      </GridItem>
      <GridItem xs={12}>
        <Card style={{ width: "100%" }}>
          <form>
            <CardHeader color="success">
              <h3>Fazer uma avaliação</h3>
            </CardHeader>
            <CardBody style={{ width: "100%" }}>
              <h4><Icon><AccessibleIcon /></Icon> Acessibilidade</h4>
              <InputLabel>Calçada</InputLabel>
              <Select label="Tipo" style={{ width: "80%", maxWidth: "360px" }}>
                <MenuItem value={1}>Entorno</MenuItem>
                <MenuItem value={2}>Exterior</MenuItem>
              </Select>
            </CardBody>
          </form>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
