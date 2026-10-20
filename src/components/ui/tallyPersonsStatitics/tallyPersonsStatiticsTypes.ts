export type TallyPersonsStatiticsObservation = {
  quantity: number;
  characteristics: { personCharacteristicId: number }[];
};

export type TallyPersonsStatiticsStructure = {
  tallyTemplateGroups: {
    id: number;
    personCharacteristicGroup: { title: string; isTagGroup: boolean };
    characteristics: {
      personCharacteristic: {
        id: number;
        name: string;
        color: string;
      };
    }[];
  }[];
};

export type TallyPersonsStatiticsProps = {
  modularTallyTemplateStructure: TallyPersonsStatiticsStructure;
  personObservations: TallyPersonsStatiticsObservation[];
};
