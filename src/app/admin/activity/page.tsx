"use client";

import Client from "@/app/admin/activity/client";
import LoadingIcon from "@/components/LoadingIcon";
import CAdminHeader from "@/components/ui/cAdminHeader";
import { useFetchRecentActivity } from "@/lib/serverFunctions/apiCalls/activity";
import type { FetchRecentActivityResponse } from "@/lib/serverFunctions/apiCalls/activity";
import { IconList } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const Activity = () => {
  const [fetchRecentActivity, isLoading] = useFetchRecentActivity();
  const [activity, setActivity] = useState<FetchRecentActivityResponse | null>(
    null,
  );

  useEffect(() => {
    const loadActivity = async () => {
      const response = await fetchRecentActivity({});
      setActivity(response.data ?? null);
    };

    void loadActivity();
  }, [fetchRecentActivity]);

  return (
    <div className="flex h-full flex-col bg-white p-2 text-black">
      <CAdminHeader titleIcon={<IconList />} title="Atividade recente" />
      {isLoading || !activity ?
        <div className="flex h-full items-center justify-center">
          <LoadingIcon size={128} />
        </div>
      : <Client assessments={activity.assessments} tallys={activity.tallys} />}
    </div>
  );
};

export default Activity;
