type AssessmentCreationFormType = {
  statusCode: number;
  locationId: string;
  userId: string;
  formId: string;
  startDate: string;
  errors: {
    startDate: boolean;
  };
};

export { type AssessmentCreationFormType };
