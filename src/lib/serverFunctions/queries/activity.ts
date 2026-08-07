import { fetchRecentlyCompletedAssessments } from "./assessment";
import { fetchRecentlyCompletedTallys } from "./tally";

export type FetchRecentActivityResponse = Awaited<
  ReturnType<typeof fetchRecentActivity>
>;

export const fetchRecentActivity = async () => {
  const [assessments, tallys] = await Promise.all([
    fetchRecentlyCompletedAssessments(),
    fetchRecentlyCompletedTallys(),
  ]);

  return {
    assessments: assessments.data.assessments,
    tallys: tallys.data.tallys,
  };
};
