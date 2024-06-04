"use client";

import { Button } from "@/components/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioButton } from "@/components/ui/radioButton";
import { useState } from "react";

const OngoingTallyPage = ({ tally }) => {
  const [tallyMap, setTallyMap] = useState<Map<string, number>>(new Map());
  const [animalsAmount, setAnimalsAmout] = useState(0);
  const [groups, setGroups] = useState(0);
  const [commercialActivities, setCommercialActivities] = useState(0);
  let gender = "male";
  let ageGroup = "child";
  let activity = "sedentary";
  let isTraversing = false;
  let isPersonWithImpairment = false;
  let isInApparentIllicitActivity = false;
  let isPersonWithoutHousing = false;
  const handlePersonAdd = () => {
    const key = `${gender}-${ageGroup}-${activity}-${isTraversing}-${isPersonWithImpairment}-${isInApparentIllicitActivity}-${isPersonWithoutHousing}`;
    setTallyMap((prev) => prev.set(key, prev.get(key) + 1));
    console.log(tallyMap);
  };
  return (
    <div className="flex max-h-[calc(100vh-5.5rem)] min-h-0 w-fit gap-5 p-5">
      <div className="flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">
          Contagem em {tally?.location.name}
        </h3>

        <div className="flex flex-col gap-3">
          <div>
            <h4 className="text-2xl font-semibold">Pessoas</h4>
            <h4 className="text-xl font-semibold">Sexo</h4>
            <div className="flex flex-row gap-1">
              <label htmlFor="male">Masculino</label>
              <RadioButton
                id="male"
                value={"male"}
                variant={"default"}
                name="gender"
                onChange={(e) => (gender = e.target.value)}
                defaultChecked
              ></RadioButton>
              <label htmlFor="female">Feminino</label>
              <RadioButton
                id="female"
                value={"female"}
                variant={"default"}
                name="gender"
                onChange={(e) => (gender = e.target.value)}
              ></RadioButton>
            </div>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Faixa etária</h4>
            <div className="flex flex-row gap-1">
              <label htmlFor="child">Criança</label>
              <RadioButton
                id="child"
                value={"child"}
                variant={"default"}
                name="age-group"
                onChange={(e) => (ageGroup = e.target.value)}
                defaultChecked
              ></RadioButton>
              <label htmlFor="child">Jovem</label>
              <RadioButton
                id="teen"
                value={"teen"}
                variant={"default"}
                name="age-group"
                onChange={(e) => (ageGroup = e.target.value)}
              ></RadioButton>
              <label htmlFor="teen">Adulto</label>
              <RadioButton
                id="adult"
                value={"adult"}
                variant={"default"}
                name="age-group"
                onChange={(e) => (ageGroup = e.target.value)}
              ></RadioButton>
              <label htmlFor="child">Idoso</label>
              <RadioButton
                id="elderly"
                value={"elderly"}
                variant={"default"}
                name="age-group"
                onChange={(e) => (ageGroup = e.target.value)}
              ></RadioButton>
            </div>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Atividade física</h4>
            <div className="flex flex-row gap-1">
              <label htmlFor="child">Sedentário</label>
              <RadioButton
                id="sedentary"
                value={"sedentary"}
                variant={"default"}
                name="activity"
                onChange={(e) => (activity = e.target.value)}
                defaultChecked
              ></RadioButton>
              <label htmlFor="child">Caminhando</label>
              <RadioButton
                id="walking"
                value={"walking"}
                variant={"default"}
                name="activity"
                onChange={(e) => (activity = e.target.value)}
              ></RadioButton>
              <label htmlFor="teen">Vigoroso</label>
              <RadioButton
                id="strenuous"
                value={"strenuous"}
                variant={"default"}
                name="activity"
                onChange={(e) => (activity = e.target.value)}
              ></RadioButton>
            </div>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Características</h4>
            <div className="flex flex-row gap-1">
              <label htmlFor="is-traversing">Passando</label>
              <Checkbox
                id="is-traversing"
                value={"is-traversing"}
                onChange={(e) => (isTraversing = e.target.checked)}
              />
              <label htmlFor="is-person-with-impairment">
                Pessoa com deficiência
              </label>
              <Checkbox
                id="is-person-with-impairment"
                value={"is-person-with-impairment"}
                onChange={(e) => (isPersonWithImpairment = e.target.checked)}
              />
              <label htmlFor="is-in-apparent-illicitActivity">
                Em aparente atividade ilícita
              </label>
              <Checkbox
                id="is-in-apparent-illicitActivity"
                value={"is-in-apparent-illicitActivity"}
                onChange={(e) =>
                  (isInApparentIllicitActivity = e.target.checked)
                }
              />
              <label htmlFor="is-in-apparent-illicitActivity">
                Em situação de rua
              </label>
              <Checkbox
                id="is-person-without-housing"
                value={"is-person-without-housing"}
                onChange={(e) => (isPersonWithoutHousing = e.target.checked)}
              />
            </div>
          </div>
          <div>
            <Button onPress={handlePersonAdd}>Registrar pessoa</Button>
          </div>
          <h4 className="text-2xl font-semibold">Dados complementares</h4>
          <div className="flex flex-row gap-1">
            <Button onPress={() => setAnimalsAmout((prev) => prev++)}>
              Registrar pet
            </Button>
            <Button onPress={() => setGroups((prev) => prev++)}>
              Registrar grupo
            </Button>
          </div>

          <h4 className="text-xl font-semibold">
            Atividades comerciais itinerantes
          </h4>
          <div className="flex flex-row gap-1">
            <div>
              <select
                name="commercial-activities"
                id="commercial-activities"
                className="text-black"
              >
                <option value="food">Alimentos</option>
                <option value="products">Produtos</option>
                <option value="trampoline">Pula-pula</option>
                <option value="bar-tables">Mesas de bares</option>
                <option value="other">Outros</option>
              </select>
            </div>

            <Button onPress={() => setCommercialActivities((prev) => prev++)}>
              Registrar atividade
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">Acopanhamento</h3>
      </div>
    </div>
  );
};

export { OngoingTallyPage };
