import {
  IconCalendarCheck,
  IconCalendarClock,
  IconListCheck,
  IconMapPin,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";

import { fetchRecentlyCompletedAssessments } from "../../../serverActions/assessmentUtil";
import { fetchRecentlyCompletedTallys } from "../../../serverActions/tallyUtil";

const Activity = async () => {
  const assessments = await fetchRecentlyCompletedAssessments();
  const tallys = await fetchRecentlyCompletedTallys();
  return (
    <div className={"flex h-full flex-col"}>
      <h2 className="p-2 text-2xl font-semibold">Atividade recente</h2>
      <div className="flex flex-col gap-5 overflow-auto xl:flex-row">
        <div className="basis-1/2 overflow-auto rounded-lg bg-gray-400/30 p-2 shadow-inner">
          <h3 className="text-2xl font-semibold">Últimas avaliações</h3>
          <div className="flex flex-col">
            {assessments.statusCode === 200 ?
              assessments.assessments.map((assessment, index) => {
                return (
                  <Link
                    key={assessment.id}
                    href={`/admin/parks/${assessment.location.id}/responses/${assessment.form.id}/${assessment.id}`}
                    className={`${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} p-2 hover:bg-transparent/10 hover:underline`}
                  >
                    <p className="text-xl font-semibold">
                      <IconMapPin className="mb-2 mr-1 inline" />
                      {assessment.location.name}
                    </p>
                    <p className="text-xl font-semibold">
                      <IconListCheck className="mb-2 mr-1 inline" />
                      {assessment.form.name}
                    </p>
                    <p className="text-xl font-semibold">
                      <IconCalendarCheck className="mb-2 mr-1 inline" />
                      {assessment.endDate?.toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                    <p className="text-cl font-semibold">
                      <IconUser className="mb-2 mr-1 inline" />
                      {assessment.user.username}
                    </p>
                  </Link>
                );
              })
            : <p className="text-xl font-semibold">Erro!</p>}
          </div>
        </div>
        <div className="basis-1/2 overflow-auto rounded-lg bg-gray-400/30 p-2 shadow-inner">
          <h3 className="text-2xl font-semibold">Últimas contagens</h3>
          <div className="flex flex-col">
            {tallys.statusCode === 200 ?
              tallys.tallys.map((tally, index) => {
                return (
                  <Link
                    key={tally.id}
                    href={`/admin/parks/${tally.location.id}/tallys/dataVisualization/${tally.id}`}
                    className={`${index % 2 === 0 ? "bg-gray-400/70" : "bg-gray-400/50"} p-2 hover:bg-transparent/10 hover:underline`}
                  >
                    <p className="text-xl font-semibold">
                      <IconMapPin className="mb-2 mr-1 inline" />
                      {tally.location.name}
                    </p>

                    <p className="text-xl font-semibold">
                      <IconCalendarClock className="mb-2 mr-1 inline" />
                      {tally.startDate.toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                    <p className="text-xl font-semibold">
                      <IconCalendarCheck className="mb-2 mr-1 inline" />
                      {tally.endDate?.toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                    <p className="text-cl font-semibold">
                      <IconUser className="mb-2 mr-1 inline" />
                      {tally.user.username}
                    </p>
                  </Link>
                );
              })
            : <p className="text-xl font-semibold">Erro!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
