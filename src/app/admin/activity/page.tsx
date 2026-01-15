import Client from "@/app/admin/activity/client";
import CAdminHeader from "@/components/ui/cAdminHeader";
import { fetchRecentlyCompletedAssessments } from "@queries/assessment";
import { fetchRecentlyCompletedTallys } from "@queries/tally";
import { IconList } from "@tabler/icons-react";

const Activity = async () => {
  const assessments = await fetchRecentlyCompletedAssessments();
  const tallys = await fetchRecentlyCompletedTallys();
  return (
    <div className="flex h-full flex-col bg-white p-2 text-black">
      <CAdminHeader titleIcon={<IconList />} title="Atividade recente" />
      <Client
        assessments={assessments.data.assessments}
        tallys={tallys.data.tallys}
      />
    </div>
  );
};

export default Activity;
