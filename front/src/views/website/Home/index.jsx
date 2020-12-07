import React from "react";

// nodejs library that concatenates classes
import classNames from "classnames";

// react components for routing our app without refresh
import { Link } from "react-router-dom";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

// @material-ui/icons
// core components
import Header from "components/website/Header/Header.js";
import Footer from "components/website/Footer/Footer.js";
import GridContainer from "components/website/Grid/GridContainer.js";
import GridItem from "components/website/Grid/GridItem.js";
import Button from "components/website/CustomButtons/Button.js";
import Parallax from "components/website/Parallax/Parallax.js";

import Badge from "components/website/Badge/Badge.js";
import Card from "components/website/Card/Card.js";
import Clearfix from "components/website/Clearfix/Clearfix.js";
import CustomButtons from "components/website/CustomButtons/Button.js";
import CustomDropdownJs from "components/website/CustomDropdown/CustomDropdown.js";
import CustomDropdownJsx from "components/website/CustomDropdown/CustomDropdown.jsx";
import CustomInput from "components/website/CustomInput/CustomInput.js";
import CustomLinearProgress from "components/website/CustomLinearProgress/CustomLinearProgress.js";
import CustomTabs from "components/website/CustomTabs/CustomTabs.js";
import InfoArea from "components/website/InfoArea/InfoArea.js";
import NavPills from "components/website/NavPills/NavPills.js";
import Pagination from "components/website/Pagination/Pagination.js";
import Typography from "components/website/Typography/Primary.js";


// sections for this page
import HeaderLinks from "components/website/Header/HeaderLinks.js";

import styles from "assets/jss/material-kit-react/views/components.js";

import { bgImage } from "variables/general";

const useStyles = makeStyles(styles);


function Random(props) {
  var maxNumber = 3;
  var randomNumber = Math.floor((Math.random() * maxNumber) + 1);
  return <div>{randomNumber}</div>;
}


export default function Home(props) {
  const classes = useStyles();
  const { ...rest } = props;

  console.log(bgImage);

  return (
    <div>
      <Header
        brand="Projeto Praças"
        rightLinks={<HeaderLinks />}
        fixed
        // color="transparent"
        href="/"
        changeColorOnScroll={{
          height: 400,
          color: "white"
        }}
        {...rest}
      />
      <Parallax image={require('assets/img/bg-pracas-jf-1.jpg')}>
        <div className={classes.container}>
          <GridContainer>
            <GridItem>
                <div className={classes.brand}>
                <h1 className={classes.title}>Projeto Praças.</h1>
                <h3 className={classes.subtitle}>
                  Um Projeto............
                </h3>
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>

      <div className={classNames(classes.main, classes.mainRaised)}>
        <Badge />
        <GridItem md={12} className={classes.textCenter}>
          <Link to={"/login-page"} className={classes.link}>
            <Button color="primary" size="lg" simple>
              View Login Page
            </Button>
            <Random />
          </Link>
        </GridItem>
      </div>
      <Footer />
    </div>
  );
}
