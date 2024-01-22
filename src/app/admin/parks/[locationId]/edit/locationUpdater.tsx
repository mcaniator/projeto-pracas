"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { updateLocation } from "@/serverActions/locationUtil";
import { Location } from "@prisma/client";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

const initialState = {
  statusCode: 0,
};
const LocationUpdater = ({ location }: { location: Location }) => {
  const [state, formAction] = useFormState(updateLocation, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    console.log(state);
  }, [state]);

  // TODO: add error handling
  return (
    <form
      ref={formRef}
      action={formAction}
      className={"flex flex-col gap-2"}
      onSubmit={() =>
        setTimeout(() => {
          formRef.current?.reset();
        }, 1)
      }
    >
      <div>
        <label htmlFor={"name"}>Nome:</label>
        <Input
          type="text"
          name="name"
          required
          id={"name"}
          className={"w-[50%]"}
          defaultValue={location?.name == undefined ? "" : location.name}
        />

        <div className="ml-auto flex ">
          <Checkbox
            name="inactiveNotFound"
            id={"inactiveNotFound"}
            defaultChecked={location?.inactiveNotFound == true}
          >
            Inativo ou não encontrado
          </Checkbox>
          <Checkbox
            name="isPark"
            id={"isPark"}
            defaultChecked={location?.isPark == true}
          >
            É Praça:
          </Checkbox>
        </div>

        <label htmlFor={"notes"}>Notas:</label>
        <Input
          type="text"
          name="notes"
          id={"notes"}
          className={"w-[50%]"}
          defaultValue={location?.notes == undefined ? "" : location.notes}
        />

        <label htmlFor={"creationYear"}>Data de Criação:</label>
        <Input
          type="date"
          name="creationYear"
          id={"creationYear"}
          className={"w-[50%]"}
          defaultValue={
            location?.creationYear == undefined ?
              ""
            : new Date(location.creationYear).toISOString().split("T")[0]
          }
        />

        <label htmlFor={"lastMaintenanceYear"}>
          Data da Última Manutenção:
        </label>
        <Input
          type="date"
          name="lastMaintenanceYear"
          id={"lastMaintenanceYear"}
          className={"w-[50%]"}
          // defaultValue={
          //   location?.creationYear == undefined ?
          //     ""
          //   : location.creationYear.toISOString()
          // }
        />

        <label htmlFor={"overseeingMayor"}>Prefeito Inaugurador:</label>
        <Input
          type="text"
          name="overseeingMayor"
          id={"overseeingMayor"}
          className={"w-[50%]"}
          defaultValue={
            location?.overseeingMayor == undefined ?
              ""
            : location.overseeingMayor
          }
        />

        <label htmlFor={"legislation"}>Legislação:</label>
        <Input
          type="text"
          name="legislation"
          id={"legislation"}
          className={"w-[50%]"}
          defaultValue={
            location?.legislation == undefined ? "" : location.legislation
          }
        />

        <label htmlFor={"incline"}>Inclinação:</label>
        <Input
          type="number"
          name="incline"
          id={"incline"}
          className={"w-[50%]"}
          defaultValue={location?.incline == undefined ? "" : location.incline}
        />

        <Input
          type="hidden"
          name="locationId"
          id={"locationId"}
          className={"hidden"}
          value={location.id.toString()}
        />
      </div>
      <Button variant={"admin"} type="submit" className={"w-min"}>
        <span className={"-mb-1"}>Enviar</span>
      </Button>
    </form>
  );
};

export default LocationUpdater;
