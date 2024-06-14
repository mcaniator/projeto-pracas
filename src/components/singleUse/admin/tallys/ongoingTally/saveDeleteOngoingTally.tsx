"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { saveOngoingTallyData } from "@/serverActions/tallyUtil";
import { WeatherConditions } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface WeatherStats {
  temperature: number | null;
  weather: WeatherConditions;
}
interface CommercialActivitiesObject {
  [key: string]: number;
}
interface ComplementaryDataObject {
  animalsAmount: number;
  groupsAmount: number;
}
interface SubmittingObj {
  submitting: boolean;
  finishing: boolean;
}
const SaveDeleteOngoingTally = ({
  locationId,
  tallyId,
  tallyMap,
  weatherStats,
  commercialActivities,
  complementaryData,
  submittingObj,
  setSubmittingObj,
}: {
  locationId: number;
  tallyId: number;
  tallyMap: Map<string, number>;
  weatherStats: WeatherStats;
  commercialActivities: CommercialActivitiesObject;
  complementaryData: ComplementaryDataObject;
  submittingObj: SubmittingObj;
  setSubmittingObj: React.Dispatch<
    React.SetStateAction<{ submitting: boolean; finishing: boolean }>
  >;
}) => {
  const endDate = useRef<Date | null>(null);
  const router = useRouter();
  const [validEndDate, setValidEndDate] = useState(true);
  const handleDataSubmit = async (endTally: boolean) => {
    if (endTally) {
      if (!endDate.current || isNaN(endDate.current.getTime())) {
        setValidEndDate(false);
        return;
      } else {
        setValidEndDate(true);
      }
      setSubmittingObj({ submitting: true, finishing: true });
    } else {
      setSubmittingObj({ submitting: true, finishing: false });
    }

    await saveOngoingTallyData(
      tallyId,
      weatherStats,
      tallyMap,
      commercialActivities,
      complementaryData,
      endTally ? endDate.current : null,
    );
    if (endTally) {
      router.push(`/admin/parks/${locationId}/tallys`);
    } else {
      setSubmittingObj({ submitting: false, finishing: false });
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="inline-flex">
        <Input
          className={
            validEndDate ?
              "w-auto outline-none"
            : "w-auto outline outline-red-500"
          }
          onChange={(e) => {
            endDate.current = new Date(e.target.value);
          }}
          id="end-date"
          type="datetime-local"
        ></Input>
      </div>
      <div className="flex flex-row gap-1">
        <Button
          className="w-24"
          isDisabled={submittingObj.submitting}
          onPress={() => {
            handleDataSubmit(false).catch(() => ({ statusCode: 0 }));
          }}
          variant={"secondary"}
        >
          {submittingObj.submitting && !submittingObj.finishing ?
            "Salvando..."
          : "Salvar"}
        </Button>
        <Button
          isDisabled={submittingObj.submitting}
          variant={"constructive"}
          onPress={() => {
            handleDataSubmit(true).catch(() => ({ statusCode: 0 }));
          }}
        >
          {submittingObj.finishing ? "Salvando..." : "Salvar e finalizar"}
        </Button>
      </div>
    </div>
  );
};

export { SaveDeleteOngoingTally };
