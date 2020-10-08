import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from "../../components/website/CustomButtons/Button.js";
import CustomInput from "../../components/website/CustomInput/CustomInput.js";
import Grid from '@material-ui/core/Grid';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '100vh',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function SimpleModal() {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title">Cadastrar Praça</h2>

      <CustomInput
                labelText="Input exemplo 1"
                id="float"
                formControlProps={{
                  fullWidth: true
                }}
      />

      <CustomInput
                      labelText="Input exemplo 2"
                      id="float"
                      formControlProps={{
                        fullWidth: true
                      }}
            />

      <CustomInput
                      labelText="Input exemplo 3"
                      id="float"
                      formControlProps={{
                        fullWidth: true
                      }}
            />

      <CustomInput
                      labelText="Input exemplo 4"
                      id="float"
                      formControlProps={{
                        fullWidth: true
                      }}
            />

        <Grid container justify="flex-end">
          <Button type="button" onClick={handleClose} color="primary" col>
            Salvar
          </Button>
          <Button color="primary" onClick={handleClose} simple>
                Cancelar
          </Button>
        </Grid>
    </div>
  );

  return (
    <div>
      <Button type="button" onClick={handleOpen} color="primary" size="sm" col>
        Cadastrar praça
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}
