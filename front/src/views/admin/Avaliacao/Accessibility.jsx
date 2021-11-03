import React from "react";
import { useState, useEffect } from "react";

import { Icon, Select, MenuItem, InputLabel, Checkbox, Grid } from "@material-ui/core";


export default function AccessibilityForm() {
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
            borderBottom: '1px dashed #CDCDCD',
        },
        checkbox: {
            textAlign: 'center',
            borderBottom: '1px dashed #CDCDCD',
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
                        <h4><b>Acessibilidade das calçadas e travessias do entorno da praça</b></h4>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Calçada do Entorno Faixa livre &gt; 1,20 m
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Calçada do Entorno Faixa de serviço &gt; 0,70 m
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Altura livre mínima de 2,10 m
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Travessia de pedestre com rebaixamento e piso tátil conforme NBR 9050
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Ausência de obstáculos (buracos, caixas de inspeção desniveladas, grelhas desniveladas com espaçamento maior que 15mm…)
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Inclinação Transversal com máximo de 3%
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Inclinação Longitudinal acompanhando as vias lindeiras
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Sinalização Tátil em locais definidos pela NBR 9050
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Revestimento de piso regular, firme, estável, não trepidante e antiderrapante definidos pela NBR 9050
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>


                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Vaga para pessoa com deficiência
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
                    </Grid>

                    <Grid item xs={10} style={style.item}>
                        <InputLabel style={style.text}>
                            Vaga para idosos
                        </InputLabel>
                    </Grid>
                    <Grid item xs={2} style={style.checkbox}>
                        <Checkbox></Checkbox>
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