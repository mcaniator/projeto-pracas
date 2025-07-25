import { PersonCharacteristics } from "@customTypes/tallys/ongoingTally";
import "server-only";

const createTallyPersonId = (personCharacteristics: PersonCharacteristics) => {
  const gender = personCharacteristics.gender.charAt(0);
  const ageGroup = personCharacteristics.ageGroup.charAt(0);
  const activity = personCharacteristics.activity.slice(0, 2);
  const isTraversing = personCharacteristics.activity ? "t" : "f";
  const isPersonWithImpairment =
    personCharacteristics.isPersonWithImpairment ? "t" : "f";
  const isInApparentIllicitActivity =
    personCharacteristics.isInApparentIllicitActivity ? "t" : "f";
  const isPersonWithoutHousing =
    personCharacteristics.isPersonWithoutHousing ? "t" : "f";

  return `${gender}${ageGroup}${activity}${isTraversing}${isPersonWithImpairment}${isInApparentIllicitActivity}${isPersonWithoutHousing}`;
};

export { createTallyPersonId };
