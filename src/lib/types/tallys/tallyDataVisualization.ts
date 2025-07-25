type CommercialActivitiesObject = {
  [key: string]: number;
};
type TallyInfo = {
  observer: string;
  startDate: string;
};
type TallyInfoAndCommercialActivitiesObject = {
  tallyInfo: TallyInfo;
  commercialActivities: CommercialActivitiesObject;
};

export { type TallyInfoAndCommercialActivitiesObject };
