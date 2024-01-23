"use client";

import {
  brazillianStates,
  parkCategories,
  parkTypes,
} from "@/components/singleUse/admin/leaflet/data";
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
import { Select } from "@/components/ui/select";
import { josefin_sans } from "@/lib/fonts";
import { mapEdit } from "@/serverActions/parkSubmit";
import { Address, Location } from "@prisma/client";
import { IconSquareRoundedPlus, IconTrashX } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useFormState } from "react-dom";

interface localsPolygon extends Location {
  polygon: [number, number][];
}

const PolygonEditForm = ({
  parkData,
  addressData,
}: {
  parkData: localsPolygon;
  addressData: Address[];
}) => {
  const initialState = {
    message: "",
  };
  const [state, formAction] = useFormState(mapEdit, initialState);

  const formRef = useRef<HTMLFormElement>(null);

  const [addressInfo, setAddressInfo] = useState(addressData);
  const [newAddressInfo, setNewAddressInfo] =
    useState<
      {
        street?: string;
        number?: number;
        city?: string;
        neighborhood?: string;
        state?: string;
      }[]
    >();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={josefin_sans.className}>Editar</Button>
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
                defaultValue={parkData.name}
              />

              <label htmlFor={"comments"}>Comentários</label>
              <Input
                type={"text"}
                name={"comments"}
                defaultValue={parkData.notes!}
              />

              <Select name={"parkTypes"} defaultValue={parkData.type!}>
                {parkTypes.map((value, index) => (
                  <option key={index} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </Select>

              <Select name={"parkCategories"} defaultValue={parkData.category!}>
                {parkCategories.map((value, index) => (
                  <option key={index} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </Select>

              {addressInfo.map((value, index) => {
                return (
                  <div key={index} className={"flex"}>
                    <div>
                      <label htmlFor={`addresses[${index}][street]`}>Rua</label>
                      <Input
                        name={`addresses[${index}][street]`}
                        className={"w-72"}
                        defaultValue={value.street}
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
                        defaultValue={value.identifier}
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
                        defaultValue={value.cityId}
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
                        defaultValue={value.neighborhood}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`addresses[${index}][state]`}>
                        Estado
                      </label>
                      <Select
                        name={`addresses[${index}][state]`}
                        defaultValue={value.state}
                      >
                        {brazillianStates.map((value, index) => (
                          <option value={value.id} key={index}>
                            {value.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {index == 0 ?
                      <Button
                        onClick={() =>
                          setNewAddressInfo(
                            newAddressInfo != undefined ?
                              [...newAddressInfo, { state: "Acre" }]
                            : [{ state: "Acre" }],
                          )
                        }
                        variant={"ghost"}
                        type={"button"}
                      >
                        <IconSquareRoundedPlus />
                      </Button>
                    : <Button
                        onClick={() =>
                          setAddressInfo(addressInfo.splice(index, 1))
                        }
                        variant={"ghost"}
                        type={"button"}
                      >
                        <IconTrashX />
                      </Button>
                    }
                  </div>
                );
              })}
              <Input
                type={"hidden"}
                value={addressInfo.length}
                name={"addressAmount"}
              />

              {newAddressInfo?.map((value, index) => {
                return (
                  <div key={index} className={"flex"}>
                    <div>
                      <label htmlFor={`newAddresses[${index}][street]`}>
                        Rua
                      </label>
                      <Input
                        name={`newAddresses[${index}][street]`}
                        className={"w-72"}
                        value={value.street}
                        onChange={(input) =>
                          (value.street = input.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`newAddresses[${index}][number]`}>
                        Número
                      </label>
                      <Input
                        type={"number"}
                        name={`newAddresses[${index}][number]`}
                        className={"w-72"}
                        value={value.number}
                        onChange={(input) =>
                          (value.number = parseInt(input.target.value))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`newAddresses[${index}][city]`}>
                        Cidade
                      </label>
                      <Input
                        name={`newAddresses[${index}][city]`}
                        className={"w-72"}
                        value={value.city}
                        onChange={(input) => (value.city = input.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`newAddresses[${index}][neighborhood]`}>
                        Bairro
                      </label>
                      <Input
                        name={`newAddresses[${index}][neighborhood]`}
                        className={"w-72"}
                        value={value.neighborhood}
                        onChange={(input) =>
                          (value.neighborhood = input.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`newAddresses[${index}][state]`}>
                        Estado
                      </label>
                      <Select
                        name={`newAddresses[${index}][state]`}
                        value={value.state}
                        onChange={(input) => (value.state = input.target.value)}
                      >
                        {brazillianStates.map((value, index) => (
                          <option value={value.id} key={index}>
                            {value.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {addressInfo.length <= 0 && index == 0 ?
                      <Button
                        onClick={() =>
                          setNewAddressInfo([
                            ...newAddressInfo,
                            { state: "Acre" },
                          ])
                        }
                        variant={"ghost"}
                        type={"button"}
                      >
                        <IconSquareRoundedPlus />
                      </Button>
                    : <Button
                        onClick={() => {
                          if (newAddressInfo?.length == 1)
                            setNewAddressInfo(undefined);
                          else
                            setNewAddressInfo(
                              newAddressInfo?.toSpliced(index, 1),
                            );
                        }}
                        variant={"ghost"}
                        type={"button"}
                      >
                        <IconTrashX />
                      </Button>
                    }
                  </div>
                );
              })}
              <Input
                type={"hidden"}
                value={newAddressInfo?.length}
                name={"newAddressAmount"}
              />

              <Button
                type={"button"}
                onClick={() => console.log(newAddressInfo)}
              >
                imprimir
              </Button>

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
