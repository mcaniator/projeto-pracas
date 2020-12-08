/*eslint-disable*/
import React from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
// react components for routing our app without refresh
import { Link } from "react-router-dom";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Tooltip from "@material-ui/core/Tooltip";

// @material-ui/icons
import { Apps, Home, AccountBox } from "@material-ui/icons";

// core components
import CustomDropdown from "components/website/CustomDropdown/CustomDropdown.js";
import Button from "components/website/CustomButtons/Button.js";

import styles from "./headerLinksStyle.js";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const classes = useStyles();
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <Button
          href="/"
          color="transparent"
          className={classes.navLink}
        >
          <Home className={classes.icons} /> Home
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <CustomDropdown
          noLiPadding
          buttonText="Praças"
          buttonProps={{
            className: classes.navLink,
            color: "transparent"
          }}
          buttonIcon={Apps}
          dropdownList={[
            <Link to="#" className={classes.dropdownLink}>
              Visualizar praças
            </Link>,
            <Link to="#" className={classes.dropdownLink}>
              Comparar praças
            </Link>
          ]}
        />
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          href="/login-page"
          color="transparent"
          className={classes.navLink}
        >
          <AccountBox className={classes.icons} /> Quem Somos
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          href="/login-page"
          color="transparent"
          className={classes.navLink}
        >
          <AccountBox className={classes.icons} /> Contato
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          href="/login-page"
          color="transparent"
          className={classes.navLink}
        >
          <AccountBox className={classes.icons} /> Login
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-facebook"
          title="Nos siga no facebook"
          placement={window.innerWidth > 959 ? "top" : "left"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            color="transparent"
            href="#"
            target="_blank"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-facebook"} />
          </Button>
        </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-tooltip"
          title="Nos siga no instagram"
          placement={window.innerWidth > 959 ? "top" : "left"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            color="transparent"
            href="#"
            target="_blank"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-instagram"} />
          </Button>
        </Tooltip>
      </ListItem>
    </List>
  );
}
