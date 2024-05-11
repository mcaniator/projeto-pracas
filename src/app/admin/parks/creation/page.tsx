import { Button } from "@/components/button";
import { createLocation } from "@/serverActions/locationCRUD";
import { addPersonToTally, createTally } from "@/serverActions/tallyCRUD";

const Page = ({ params }: { params: { locationId: string } }) => {
  return (
    <div>
      <button onClick={void createLocation({ name: "Praca3" }, {}, 1)}>
        Cadastrar local
      </button>
      <button onClick={void createTally({ locationId: 24 })}>
        Criar contagem
      </button>
      <button
        onClick={
          void addPersonToTally(1, 1, {
            ageGroup: "ADULT",
            gender: "MALE",
            activity: "SEDENTARY",
            isTraversing: false,
            isInApparentIllicitActivity: false,
            isPersonWithImpairment: false,
            isPersonWithoutHousing: false,
          })
        }
      >
        Adicionar pessoa
      </button>
    </div>
  );
};

export default Page;
