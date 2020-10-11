import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import PictureUpload from "components/CustomUpload/PictureUpload";
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

export default function UserEditCard() {
  const classes = useStyles();
  return (
    <div>
        <Card>
        <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>Criar Usuário</h4>
            <p className={classes.cardCategoryWhite}>Informe seus dados abaixo</p>
        </CardHeader>
        <CardBody>
        <GridContainer>
            <GridItem xs={12} sm={12} md={5}>
                <CustomInput
                labelText="First Name"
                id="first-name"
                formControlProps={{
                    fullWidth: true
                }}
                />
            </GridItem>
            <GridItem xs={12} sm={12} md={7}>
                <CustomInput
                labelText="Last Name"
                id="last-name"
                formControlProps={{
                    fullWidth: true
                }}
                />
            </GridItem>
            </GridContainer>
            <GridContainer>
            <GridItem xs={12} sm={12} md={5}>
                <CustomInput
                labelText="Matrícula (disabled)"
                id="company-disabled"
                formControlProps={{
                    fullWidth: true
                }}
                inputProps={{
                    disabled: true
                }}
                />
            </GridItem>

            <GridItem xs={12} sm={12} md={7}>
                <CustomInput
                labelText="Email address"
                id="email-address"
                formControlProps={{
                    fullWidth: true
                }}
                />
            </GridItem>
            </GridContainer>
            
            <GridContainer>
            <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                labelText="Senha"
                id="city"
                formControlProps={{
                    fullWidth: true
                }}
                />
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                labelText="Repita a senha"
                id="country"
                formControlProps={{
                    fullWidth: true
                }}
                />
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
                <CustomInput
                labelText="Tipo de usuário"
                id="postal-code"
                formControlProps={{
                    fullWidth: true
                }}
                />
            </GridItem>
            </GridContainer>
            <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
            <GridItem xs={12} sm={4}></GridItem>
                <PictureUpload id="picture-upload" />
            </GridItem>
            </GridContainer>
        </CardBody>
        <CardFooter>
            <Button color="primary">Criar Usuário</Button>
        </CardFooter>
        </Card>
    </div>
  );
}
