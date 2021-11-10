import React from "react";
import { useState, useEffect } from "react";

import { Icon, Select, MenuItem, InputLabel, Checkbox, Grid, TextField } from "@material-ui/core";
import InputAdornment from '@material-ui/core/InputAdornment';

export default function NoiseForm() {
    const [tipo, setTipo] = useState('');

    function selectChange(event) {
        setTipo(event.target.value)
    }

    const style = {
        header: {
            // borderTop: '1px solid red',
            borderBottom: '1px solid gray',
        },

        item: {
            display: 'block',
            borderRight: '1px solid gray',
            borderBottom: '1px solid #CDCDCD',
            paddingTop: '20px',
            paddingBottom: '20px',
            //borderBottom: '1px dashed #CDCDCD',
        },
        checkbox: {
            textAlign: 'center',
            borderBottom: '1px solid #CDCDCD',
        },
        textField: {
            textAlign: 'center',
            justifyContent: "center",
            borderBottom: '1px solid #CDCDCD',
            width: '70%'
        },
        texto: {
            width: '60%'
        },
        text: {
            padding: '8px',
        }
    }

    return (
        <div>
            <form onSubmit={(e) => { e.preventDefault() }}>
                {/* <Grid container={true} spacing={4}>
                    <GridItem xs={6} style={{backgroundColor: '#ff0022', border: '1px solid black'}}>
                        <p>Lorem impsus</p>
                    </GridItem>
                    <GridItem xs={2} style={{backgroundColor: '#004f22'}}>
                        <Checkbox ></Checkbox>
                    </GridItem>
                </Grid> */}

                <Grid container alignContent="center" spacing={2} style={{padding: '10px'}}>
                    <Grid item xs={12} style={style.header}>
                        <h4><b>Ruído no Centro da Praça</b></h4>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Ruído em Dias de Semana (dB)
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.textField}>
                        <TextField style={style.texto}
                            InputProps={{
                                endAdornment: <InputAdornment position="end"> dB</InputAdornment>,
                              }}
                        ></TextField>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Ruído nos Finais de Semana (dB)
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.textField}>
                        <TextField style={style.texto}
                            InputProps={{
                                endAdornment: <InputAdornment position="end"> dB</InputAdornment>,
                              }}
                        ></TextField>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Ruído Limite (dB)
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.textField}>
                        <TextField style={style.texto}
                            InputProps={{
                                endAdornment: <InputAdornment position="end"> dB</InputAdornment>,
                              }} ></TextField>
                    </Grid>
                    {/* <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            -
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid> */}
                </Grid>


                {/* <h4><Icon><AccessibleIcon /></Icon> Acessibilidade</h4> */}
                {/* <InputLabel>Tipo</InputLabel> */}
                {/* <Select
                    label="Tipo"
                    value={tipo}
                    onChange={selectChange}
                    style={{ width: "80%", maxWidth: "360px" }}
                >
                    <MenuItem value='' />
                    <MenuItem value={1}>Entorno</MenuItem>
                    <MenuItem value={2}>Exterior</MenuItem>
                </Select> */}

                {/* <br /><br /> */}
                {/* <Button variant="contained" color="primary" onClick={() => {
                    postAvaliacao({
                        "name": "fulano",
                        "type": 1,
                        "email": "fulano@email.com",
                        "password": "pswd123",
                    });
                }} >Enviar</Button> */}
            </form>
        </div>
    );
}
