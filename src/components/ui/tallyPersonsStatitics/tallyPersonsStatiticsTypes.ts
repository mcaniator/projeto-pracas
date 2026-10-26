export type TallyPersonsStatiticsObservation = {
  quantity: number;
  characteristics: { personCharacteristicId: number }[];
};

export type TallyPersonsStatiticsStructure = {
  tallyProtocolGroups: {
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
  tallyProtocolStructure: TallyPersonsStatiticsStructure;
  personObservations: TallyPersonsStatiticsObservation[];
};
