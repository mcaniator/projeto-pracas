import React from "react";
import { useState, useEffect } from "react";

import axios from "axios";

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
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Icon, Select, InputLabel, MenuItem, Tooltip, Modal, Button } from "@material-ui/core";
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
  },
  modal: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    p: 4,
  }
};

// const useStyles = makeStyles(styles);

export default function TableList() {
  // const classes = useStyles();
  // console.log(classes);
  const [modalData, setModalData] = useState({});
  const [open, setOpen] = useState(false);

  const handleOpen = (evaluation) => {
    setModalData(evaluation);
    setOpen(true)
  };
  const handleClose = () => setOpen(false);


  const [avaliacaoes, setAvaliacaoes] = useState([]);
  const [tipo, setTipo] = useState('');

  const api = axios.create({
    baseURL: `http://localhost:3333`,
    method: "no-cors",
  });


  const getAvaliacoes = async () => {
    try {
      await api.get('/evaluation').then(res => {
        setAvaliacaoes(res.data);
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  const postAvaliacao = async (avaliacao) => {
    try {
      console.log('post', avaliacao)

      await api.post('/evaluation', avaliacao)
        .then(res => {
          console.log('postado')
        });
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getAvaliacoes();
  }, [tipo, avaliacaoes.length]);

  function items(evaluations) {
    console.log(evaluations)
    return evaluations.map(value => {
      return (
        <ListItem key={value.id} button onClick={() => { handleOpen(value) }}>
          <ListItemAvatar>
            <Avatar
              alt={`Avatar n°${value.name}`}
            />
          </ListItemAvatar>
          <ListItemText id={value} primary={`${value.name}`} secondary={'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Null... '} />
        </ListItem>
      );
    }).reverse();
  }

  function selectChange(event) {
    setTipo(event.target.value)
  }


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
          {items(avaliacaoes)}
          <ListItem button>
            <Icon> <Add /> </Icon>
            <ListItemText primary={`Ver Mais`} />
          </ListItem>
        </List>
        <hr></hr>
      </GridItem>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card style={styles.modal}>
          <CardHeader color="success">
            <h3>Avaliação de {modalData.name}</h3>
          </CardHeader>
          <CardBody>
            <p>Lorem</p>
          </CardBody>
        </Card>
      </Modal>

      <GridItem xs={12}>
        <Card style={{ width: "100%" }}>
          <form onSubmit={(e) => { e.preventDefault() }}>
            <CardHeader color="success">
              <h3>Fazer uma avaliação</h3>
            </CardHeader>
            <CardBody style={{ width: "100%" }}>
              <h4><Icon><AccessibleIcon /></Icon> Acessibilidade</h4>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={tipo}
                onChange={selectChange}
                style={{ width: "80%", maxWidth: "360px" }}
              >
                <MenuItem value='' />
                <MenuItem value={1}>Entorno</MenuItem>
                <MenuItem value={2}>Exterior</MenuItem>
              </Select>

              <br /><br />
              <Button variant="contained" color="primary" onClick={() => {
                postAvaliacao({
                  "name": "fulano",
                  "type": 1,
                  "email": "fulano@email.com",
                  "password": "pswd123",
                });
              }} >Enviar</Button>
            </CardBody>
          </form>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
