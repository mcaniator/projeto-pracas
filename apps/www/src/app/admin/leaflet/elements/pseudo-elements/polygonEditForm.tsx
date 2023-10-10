import { mapEdit } from "@/actions/submition";
import {
  brazillianStates,
  parkCategories,
  parkTypes,
} from "@/app/admin/leaflet/elements/pseudo-elements/data";
import { josefin_sans } from "@/app/fonts";
import { addressResponse, localsResponse } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IconSquareRoundedPlus, IconTrashX } from "@tabler/icons-react";
import { useRef, useState } from "react";
// @ts-expect-error
import { experimental_useFormState as useFormState } from "react-dom";

const PolygonEditForm = ({
  polygonID,
  parkData,
  addressData,
}: {
  polygonID: number;
  parkData: localsResponse;
  addressData: addressResponse[];
}) => {
  const initialState = {
    message: null,
  };
  const [state, formAction] = useFormState(mapEdit, initialState);

  const formRef = useRef<HTMLFormElement>(null);

  let tempAddressAmount: boolean[] | undefined = undefined;
  let curMapData = addressData.map((value) => {
    if (value.locals_id == polygonID) {
      if (tempAddressAmount == undefined) tempAddressAmount = [true];
      else tempAddressAmount = [...tempAddressAmount, true];
      return value;
    }
  });

  const [addressAmount, setAddressAmount] = useState<boolean[]>([false]);

  curMapData = curMapData.filter((value) => value != undefined);

  console.log(curMapData);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={josefin_sans.className}
          onClick={() =>
            setAddressAmount(
              tempAddressAmount == undefined ? [true] : tempAddressAmount,
            )
          }
        >
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className={"max-w-none"}>
        <DialogHeader>
          <DialogTitle>Adicionar Praça</DialogTitle>
          <DialogDescription>
            <form
              action={formAction}
              onSubmit={() => {
                setTimeout(() => {
                  formRef.current?.reset();
                }, 1);
              }}
              ref={formRef}
            >
              <label htmlFor={"name"}>Nome</label>
              <Input
                type={"text"}
                name={"name"}
                defaultValue={parkData.name}
                required
              />

              <label htmlFor={"commonName"}>Nome popular</label>
              <Input
                type={"text"}
                name={"commonName"}
                defaultValue={
                  parkData.common_name ? parkData.common_name : undefined
                }
              />

              <label htmlFor={"comments"}>Comentários</label>
              <Input
                type={"text"}
                name={"comments"}
                defaultValue={parkData.comments ? parkData.comments : undefined}
              />

              <select
                name={"parkTypes"}
                className={
                  "h-10 w-full appearance-none rounded-lg pl-3 bg-gray-400/30 pt-1"
                }
                defaultValue={parkData.type}
                required
              >
                {parkTypes.map((value, index) => (
                  <option key={index} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </select>

              <select
                name={"parkCategories"}
                className={
                  "h-10 w-full appearance-none rounded-lg pl-3 bg-gray-400/30 pt-1"
                }
                defaultValue={parkData.free_space_category}
                required
              >
                {parkCategories.map((value, index) => (
                  <option key={index} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </select>

              {/* Não acho que isso seja o melhor jeito de renderizar um elemento n número de vezes, muito
                  menos remover ele
                  TODO: procurar um jeito melhor de fazer isso*/}
              {addressAmount.map((value, index) => {
                if (value) {
                  return (
                    <div key={index} className={"flex"}>
                      <div>
                        <label htmlFor={`addresses[${index}][street]`}>
                          Rua
                        </label>
                        <Input
                          name={`addresses[${index}][street]`}
                          className={"w-72"}
                          defaultValue={curMapData[index]?.street}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`addresses[${index}][number]`}>
                          Número
                        </label>
                        <Input
                          type={"number"}
                          name={`addresses[${index}][number]`}
                          className={"w-72"}
                          defaultValue={curMapData[index]?.number}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`addresses[${index}][city]`}>
                          Cidade
                        </label>
                        <Input
                          name={`addresses[${index}][city]`}
                          className={"w-72"}
                          defaultValue={curMapData[index]?.city}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`addresses[${index}][neighborhood]`}>
                          Bairro
                        </label>
                        <Input
                          name={`addresses[${index}][neighborhood]`}
                          className={"w-72"}
                          defaultValue={curMapData[index]?.neighborhood}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`addresses[${index}][state]`}>
                          Estado
                        </label>
                        <select
                          name={`addresses[${index}][state]`}
                          className={
                            "h-10 w-full appearance-none rounded-lg pl-3 bg-gray-400/30 pt-1"
                          }
                          defaultValue={curMapData[index]?.UF}
                          required
                        >
                          {brazillianStates.map((value, index) => (
                            <option value={value} key={index}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                      {index == 0 ? (
                        <Button
                          onClick={() => {
                            setAddressAmount([...addressAmount, true]);
                          }}
                          variant={"ghost"}
                          type={"button"}
                        >
                          <IconSquareRoundedPlus />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            const newAddressAmount = addressAmount.slice();
                            newAddressAmount[index] = false;
                            setAddressAmount(newAddressAmount);
                          }}
                          variant={"ghost"}
                          type={"button"}
                        >
                          <IconTrashX />
                        </Button>
                      )}
                    </div>
                  );
                }
              })}
              <Input
                type={"hidden"}
                value={addressAmount.length}
                name={"addressAmount"}
              />

              <DialogTrigger>
                <Button>Enviar</Button>
              </DialogTrigger>
              <p>{state?.message}</p>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export { PolygonEditForm };
