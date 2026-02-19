"use client";

import { useUserContext } from "@/components/context/UserContext";
import CIconChip from "@/components/ui/cIconChip";
import CToggleButtonGroup from "@/components/ui/cToggleButtonGroup";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { FetchRecentlyCompletedAssessmentsResponse } from "@/lib/serverFunctions/queries/assessment";
import { FetchRecentlyCompletedTallyResponse } from "@/lib/serverFunctions/queries/tally";
import { Divider } from "@mui/material";
import {
  IconCalendar,
  IconClipboard,
  IconFilePencil,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";

const Client = ({
  assessments,
  tallys,
}: {
  assessments: FetchRecentlyCompletedAssessmentsResponse["assessments"];
  tallys: FetchRecentlyCompletedTallyResponse["tallys"];
}) => {
  const userContext = useUserContext();
  const [selectedOption, setSelectedOption] = useState(0);
  const options = [
    {
      value: 0,
      label: "Avaliações",
      show: userContext.checkIfLoggedInUserHasAccess({
        requiredAnyRoleGroups: ["ASSESSMENT"],
      }),
    },
    {
      value: 1,
      label: "Contagens",
      show: userContext.checkIfLoggedInUserHasAccess({
        requiredAnyRoleGroups: ["TALLY"],
      }),
    },
  ];
  return (
    <div className="flex h-full flex-col gap-1">
      <CToggleButtonGroup
        options={options.filter((o) => o.show)}
        getLabel={(o) => o.label}
        getValue={(o) => o.value}
        value={selectedOption}
        onChange={(_, v) => {
          setSelectedOption(v.value);
        }}
      />
      <div className="flex h-full flex-col">
        {selectedOption === 0 ?
          <Virtuoso
            data={assessments}
            itemContent={(_, a) => (
              <Link key={a.id} href={`/admin/assessments/${a.id}`}>
                <div className="pb-4">
                  <div
                    key={a.id}
                    className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl hover:scale-[1.02]"
                  >
                    <div className="flex h-auto w-full flex-col gap-1">
                      <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                        <CIconChip
                          icon={<IconFilePencil />}
                          tooltip="Praça - Avaliação"
                        />
                        {`${a.location.name} - ${a.id} `}
                      </span>
                      <Divider />
                      <span className="flex items-center text-base sm:text-xl">
                        <CIconChip
                          icon={<IconClipboard />}
                          tooltip="Fomulário"
                        />
                        {a.form.name}
                      </span>
                      <Divider />
                      <span className="flex items-center text-base sm:text-xl">
                        <CIconChip
                          icon={<IconCalendar />}
                          tooltip={a.endDate ? "Início - Fim" : "Início"}
                        />
                        {`${dateTimeFormatter.format(new Date(a.startDate))} ${a.endDate ? `- ${dateTimeFormatter.format(new Date(a.endDate))}` : ""}`}
                      </span>
                      <Divider />
                      <span className="flex items-center text-base sm:text-xl">
                        <CIconChip icon={<IconUser />} tooltip="Responsável" />
                        {a.user.username}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          />
        : <Virtuoso
            data={tallys}
            itemContent={(_, a) => (
              <Link
                key={a.id}
                href={
                  a.endDate ?
                    `/admin/parks/${a.location.id}/tallys/dataVisualization/${a.id}`
                  : `/admin/tallys/${a.id}/fill`
                }
              >
                <div className="pb-4">
                  <div
                    key={a.id}
                    className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl hover:scale-[1.02]"
                  >
                    <div className="flex h-auto w-full flex-col gap-1">
                      <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                        <CIconChip
                          icon={<IconFilePencil />}
                          tooltip="Praça - Avaliação"
                        />
                        {`${a.location.name} - ${a.id} `}
                      </span>
                      <Divider />
                      <span className="flex items-center text-base sm:text-xl">
                        <CIconChip
                          icon={<IconCalendar />}
                          tooltip={a.endDate ? "Início - Fim" : "Início"}
                        />
                        {`${dateTimeFormatter.format(new Date(a.startDate))} ${a.endDate ? `- ${dateTimeFormatter.format(new Date(a.endDate))}` : ""}`}
                      </span>
                      <Divider />
                      <span className="flex items-center text-base sm:text-xl">
                        <CIconChip icon={<IconUser />} tooltip="Responsável" />
                        {a.user.username}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          />
        }
      </div>
    </div>
  );
};

export default Client;
