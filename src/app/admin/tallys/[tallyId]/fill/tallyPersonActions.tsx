import CounterButtonGroup from "@/app/admin/tallys/[tallyId]/fill/counterButtonGroup";
import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import { ActivityType, AgeGroupType, GenderType } from "@/lib/types/tallys/person";
import { Paper } from "@mui/material";
import {
  IconChartBar,
  IconGenderFemale,
  IconGenderMale,
} from "@tabler/icons-react";
import { ReactNode, useState } from "react";

type SharedCharacteristics = {
  activity: ActivityType;
  isTraversing: boolean;
  isPersonWithImpairment: boolean;
  isInApparentIllicitActivity: boolean;
  isPersonWithoutHousing: boolean;
};

type ActivityOption = {
  value: ActivityType;
  label: ReactNode;
  tooltip: string;
};

type TallyPersonActionsProps = {
  activityOptionsMale: ActivityOption[];
  activityOptionsFemale: ActivityOption[];
  isCountingFemales: boolean;
  setIsCountingFemales: (value: boolean) => void;
  onOpenReview: () => void;
  countPeople: (
    gender: GenderType,
    ageGroup: AgeGroupType,
    characteristics: SharedCharacteristics,
  ) => number;
  onIncrement: (
    gender: GenderType,
    ageGroup: AgeGroupType,
    characteristics: SharedCharacteristics,
  ) => void;
  onDecrement: (
    gender: GenderType,
    ageGroup: AgeGroupType,
    characteristics: SharedCharacteristics,
  ) => void;
};

const TallyPersonActions = ({
  activityOptionsMale,
  activityOptionsFemale,
  isCountingFemales,
  setIsCountingFemales,
  onOpenReview,
  countPeople,
  onIncrement,
  onDecrement,
}: TallyPersonActionsProps) => {
  const [sharedCharacteristics, setSharedCharacteristics] =
    useState<SharedCharacteristics>({
      activity: "SEDENTARY",
      isTraversing: false,
      isPersonWithImpairment: false,
      isInApparentIllicitActivity: false,
      isPersonWithoutHousing: false,
    });

  const gender: GenderType = isCountingFemales ? "FEMALE" : "MALE";
  const title = isCountingFemales ? "Mulheres" : "Homens";
  const borderColor = isCountingFemales ? "red" : "blue";
  const activityOptions = isCountingFemales
    ? activityOptionsFemale
    : activityOptionsMale;
  const illicitLabel = isCountingFemales
    ? " Atividade ilícita"
    : "Atividade ilícita";
  const ageLabels = isCountingFemales
    ? { adult: "Adulta", elderly: "Idosa" }
    : { adult: "Adulto", elderly: "Idoso" };

  return (
    <Paper elevation={5} sx={{ display: "flex", borderLeft: `4px solid ${borderColor}` }}>
      <div className="flex flex-1 flex-col gap-1 rounded-md px-1 py-2">
        <div className="flex justify-between">
          <h5 className="text-xl font-semibold">{title}</h5>
          <div
            className={
              isCountingFemales ? "flex flex-row gap-1" : "flex flex-wrap gap-1"
            }
          >
            <CButton
              square
              onClick={() => {
                onOpenReview();
              }}
            >
              <IconChartBar />
            </CButton>
            <CButton
              square
              onClick={() => {
                setIsCountingFemales(!isCountingFemales);
              }}
            >
              {isCountingFemales ? <IconGenderMale /> : <IconGenderFemale />}
            </CButton>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <CToggleButtonGroup
            options={activityOptions}
            value={sharedCharacteristics.activity}
            getLabel={(o) => o.label}
            getValue={(o) => o.value}
            getTooltip={(o) => o.tooltip}
            toggleButtonColor="gray"
            toggleButtonSx={{
              padding: { xs: "8px" },
            }}
            onChange={(_, v) => {
              setSharedCharacteristics((prev) => ({
                ...prev,
                activity: v.value,
              }));
            }}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 py-1">
          <CCheckbox
            label="Passando ou esperando ônibus"
            checked={sharedCharacteristics.isTraversing}
            onChange={(e) =>
              setSharedCharacteristics((prev) => ({
                ...prev,
                isTraversing: e.target.checked,
              }))
            }
          />

          <CCheckbox
            label="Deficiente"
            checked={sharedCharacteristics.isPersonWithImpairment}
            onChange={(e) =>
              setSharedCharacteristics((prev) => ({
                ...prev,
                isPersonWithImpairment: e.target.checked,
              }))
            }
          />
          <CCheckbox
            label={illicitLabel}
            checked={sharedCharacteristics.isInApparentIllicitActivity}
            onChange={(e) =>
              setSharedCharacteristics((prev) => ({
                ...prev,
                isInApparentIllicitActivity: e.target.checked,
              }))
            }
          />
          <CCheckbox
            label="Situação de rua"
            checked={sharedCharacteristics.isPersonWithoutHousing}
            onChange={(e) =>
              setSharedCharacteristics((prev) => ({
                ...prev,
                isPersonWithoutHousing: e.target.checked,
              }))
            }
          />
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          <CounterButtonGroup
            label="Criança"
            count={countPeople(gender, "CHILD", sharedCharacteristics)}
            onIncrement={() => {
              onIncrement(gender, "CHILD", sharedCharacteristics);
            }}
            onDecrement={() => {
              onDecrement(gender, "CHILD", sharedCharacteristics);
            }}
          />

          <CounterButtonGroup
            label="Jovem"
            count={countPeople(gender, "TEEN", sharedCharacteristics)}
            onIncrement={() => {
              onIncrement(gender, "TEEN", sharedCharacteristics);
            }}
            onDecrement={() => {
              onDecrement(gender, "TEEN", sharedCharacteristics);
            }}
          />

          <CounterButtonGroup
            label={ageLabels.adult}
            count={countPeople(gender, "ADULT", sharedCharacteristics)}
            onIncrement={() => {
              onIncrement(gender, "ADULT", sharedCharacteristics);
            }}
            onDecrement={() => {
              onDecrement(gender, "ADULT", sharedCharacteristics);
            }}
          />

          <CounterButtonGroup
            label={ageLabels.elderly}
            count={countPeople(gender, "ELDERLY", sharedCharacteristics)}
            onIncrement={() => {
              onIncrement(gender, "ELDERLY", sharedCharacteristics);
            }}
            onDecrement={() => {
              onDecrement(gender, "ELDERLY", sharedCharacteristics);
            }}
          />
        </div>
      </div>
    </Paper>
  );
};

export default TallyPersonActions;
export type { ActivityOption, SharedCharacteristics };
