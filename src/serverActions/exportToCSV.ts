"use server";

import { prisma } from "@/lib/prisma";
import { personType } from "@/lib/zodValidators";

const exportToCSV = async () => {
  const locations = await prisma.location.findMany();

  const locationsString = locations
    .slice()
    .map((cont) => {
      return Object.values(cont).join(";");
    })
    .join("\n");

  //console.log(locationsString);
};

const exportTallyToCSV = async (tallysIds: number[]) => {
  let CSVstring =
    "Identificador;Nome da Praça;Observador;Dia;Data;Início;Duração;Temperatura;Com sol/Nublado;HA-SED;HA-CAM;HA-VIG;TOT-HA;HI-SED;HI-CAM;HI-VIG;TOT-HI;HC-SED;HC-CAM;HC-VIG;TOT-HC;HJ-SED;HJ-CAM;HJ-VIG;TOT-HJ;TOT-HOMENS;MA-SED;MA-CAM;MA-VIG;TOT-MA;MI-SED;MI-CAM;MI-VIG;TOT-MI;MC-SED;MC-CAM;MC-VIG;TOT-MC;MJ-SED;MJ-CAM;MJ-VIG;TOT-MJ;TOT-M;TOTAL H&M;%HOMENS;%MULHERES;%ADULTO;%IDOSO;%CRIANÇA;%JOVEM;%SEDENTÁRIO;%CAMINHANDO;%VIGOROSO;PCD;Grupos;Pets;Passando;Qtde Atvividades comerciais intinerantes;Atividades Ilícitas;%Ativ Ilic;Pessoas em situação de rua;% Pessoas em situação de rua\n";
  let tallys = await prisma.tally.findMany({
    where: {
      id: {
        in: tallysIds,
      },
    },
    include: {
      location: {
        select: {
          name: true,
        },
      },
      tallyPerson: {
        select: {
          person: {
            select: {
              ageGroup: true,
              gender: true,
              activity: true,
              isTraversing: true,
              isPersonWithImpairment: true,
              isInApparentIllicitActivity: true,
              isPersonWithoutHousing: true,
            },
          },
          quantity: true,
        },
      },
    },
  });

  tallys = tallys.sort((a, b) =>
    a.location.name.localeCompare(b.location.name),
  );
  CSVstring += tallys
    .map((tally) => {
      const weatherConditionMap = new Map();
      weatherConditionMap.set("SUNNY", "Com sol");
      weatherConditionMap.set("CLOUDY", "Nublado");
      const tallyMap = new Map();
      const genders = ["MALE", "FEMALE"];
      const ageGroups = ["ADULT", "ELDERLY", "CHILD", "TEEN"];
      const acitvities = ["SEDENTARY", "WALKING", "STRENUOUS"];
      const booleanPersonProperties: (keyof personType)[] = [
        "isPersonWithImpairment",
        "isTraversing",
        "isInApparentIllicitActivity",
        "isPersonWithoutHousing",
      ];

      for (const gender of genders) {
        for (const ageGroup of ageGroups) {
          for (const activity of acitvities) {
            tallyMap.set(`${gender}-${ageGroup}-${activity}`, 0);
          }
          tallyMap.set(`Tot-${gender}-${ageGroup}`, 0);
        }
        tallyMap.set(`Tot-${gender}`, 0);
      }
      tallyMap.set("Tot-H&M", 0);
      tallyMap.set("%MALE", 0);
      tallyMap.set("%FEMALE", 0);
      for (const ageGroup of ageGroups) {
        tallyMap.set(`%${ageGroup}`, 0);
      }
      for (const activity of acitvities) {
        tallyMap.set(`%${activity}`, 0);
      }
      tallyMap.set("isPersonWithImpairment", 0);
      tallyMap.set("Groups", 0); //?? o que é isso?
      tallyMap.set("Pets", tally.animalsAmount);
      tallyMap.set("isTraversing", 0);
      tallyMap.set("Itinerant commercial activities", 0);
      tallyMap.set("isInApparentIllicitActivity", 0);
      tallyMap.set("%IllicitActivities", 0);
      tallyMap.set("isPersonWithoutHousing", 0);
      tallyMap.set("%isPersonWithoutHousing", 0);

      tally.tallyPerson.map((tallyPerson) => {
        const key = `${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}-${tallyPerson.person.activity}`;
        tallyMap.set(key, tallyMap.get(key) + tallyPerson.quantity);
        tallyMap.set(
          `Tot-${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}`,
          tallyMap.get(
            `Tot-${tallyPerson.person.gender}-${tallyPerson.person.ageGroup}`,
          ) + tallyPerson.quantity,
        );
        tallyMap.set(
          `Tot-${tallyPerson.person.gender}`,
          tallyMap.get(`Tot-${tallyPerson.person.gender}`) +
            tallyPerson.quantity,
        );
        tallyMap.set("Tot-H&M", tallyMap.get("Tot-H&M") + tallyPerson.quantity);
        booleanPersonProperties.map((property) => {
          if (tallyPerson.person[property]) {
            tallyMap.set(
              property,
              tallyMap.get(property) + tallyPerson.quantity,
            );
          }
        });
      });
      for (const gender of genders) {
        if (tallyMap.get("Tot-H&M") != 0) {
          tallyMap.set(
            `%${gender}`,
            (tallyMap.get(`Tot-${gender}`) / tallyMap.get("Tot-H&M")) * 100 +
              "%",
          );
        }
      }
      for (const ageGroup of ageGroups) {
        if (tallyMap.get("Tot-H&M") != 0) {
          let totalAgeGroup = 0;
          for (const gender of genders) {
            for (const activity of acitvities) {
              totalAgeGroup += tallyMap.get(
                `${gender}-${ageGroup}-${activity}`,
              );
            }
          }
          tallyMap.set(
            `%${ageGroup}`,
            (totalAgeGroup / tallyMap.get("Tot-H&M")) * 100 + "%",
          );
        } else {
          tallyMap.set(`%${ageGroup}`, 0);
        }
      }
      for (const activity of acitvities) {
        if (tallyMap.get("Tot-H&M") != 0) {
          let activityTotal = 0;
          for (const gender of genders) {
            for (const ageGroup of ageGroups) {
              activityTotal += tallyMap.get(
                `${gender}-${ageGroup}-${activity}`,
              );
            }
          }
          tallyMap.set(
            `%${activity}`,
            (activityTotal / tallyMap.get(`Tot-H&M`)) * 100 + "%",
          );
        }
      }
      let startDateTime;
      let date;
      let duration;
      const hourFormatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        weekday: "short",
      });
      if (tally.endDate && tally.startDate) {
        startDateTime = hourFormatter.format(tally.startDate);
        date = dateFormatter.format(tally.startDate);
        const durationTimestampMs =
          tally.endDate.getTime() - tally.startDate.getTime();
        const durationHrs = Math.floor(durationTimestampMs / (1000 * 60 * 60));
        const durationMin = Math.floor(
          (durationTimestampMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        duration = `${String(durationHrs).padStart(2, "0")}:${String(durationMin).padStart(2, "0")}`;
      }
      return `${tally.id};${tally.location.name};${tally.observer};${date};${startDateTime};${duration};${tally.temperature};${weatherConditionMap.get(tally.weatherCondition)};${[...tallyMap.values()].join(";")}`;
    })
    .join("\n");
  console.log(CSVstring);
};

export { exportToCSV, exportTallyToCSV };
