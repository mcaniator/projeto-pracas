type TallyDataFetchedToTallyList = {
  id: number;
  startDate: Date;
  endDate: Date | null;
  user: {
    username: string | null;
    id: string;
  };
};

export { type TallyDataFetchedToTallyList };
