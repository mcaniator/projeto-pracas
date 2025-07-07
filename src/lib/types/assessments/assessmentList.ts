type AssessmentDataFetchedToAssessmentList = {
  id: number;
  startDate: Date;
  user: {
    username: string | null;
    id: string;
  };
};

export { type AssessmentDataFetchedToAssessmentList };
