import { searchLocationsById } from "@/serverActions/locationUtil";

import { SurveyQuestions } from "./surveyQuestions";

const Evaluation = async ({ params }: { params: { locationId: string } }) => {
  const location = await searchLocationsById(parseInt(params.locationId));

  // TODO: add error handling
  return location == null ?
      <div>Localização não encontrada</div>
    : <SurveyQuestions location={location} />;
};
export default Evaluation;
