import React from "react";

// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";

import UserEditCard from "./Components/CardUserInfo"


export default function UserCreate() {
  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <UserEditCard />
        </GridItem>
      </GridContainer>
    </div>
  );
}
