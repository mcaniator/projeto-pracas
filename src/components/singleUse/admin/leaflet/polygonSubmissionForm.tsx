"use client";

import { PolygonContext } from "@/components/singleUse/admin/leaflet/createPolygon";
import { brazillianStates, parkCategories, parkTypes } from "@/components/singleUse/admin/leaflet/data";
import { DrawingContext } from "@/components/singleUse/admin/leaflet/leafletProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { josefin_sans } from "@/lib/fonts";
import { mapSubmission } from "@/lib/serverActions/parkSubmit";
import { IconSquareRoundedPlus, IconTrashX } from "@tabler/icons-react";
import { useContext, useRef, useState } from "react";
import { useFormState } from "react-dom";

const PolygonSubmissionForm = () => {
  const { setDrawingContext } = useContext(DrawingContext);
  const { polygonContext, setPolygonContext } = useContext(PolygonContext);
  const [addressAmount, setAddressAmount] = useState([true]);
  const formRef = useRef<HTMLFormElement>(null);

  const initialState = {
    message: "",
  };
  const [state, formAction] = useFormState<{ message: string }, FormData>(mapSubmission, initialState);

  const submitHandler = () => {
    // for some reason this timeout is needed otherwise the inputs are cleared before they're sent to the server
    setTimeout(() => {
      formRef.current?.reset();
    }, 1);
    setPolygonContext(null);
    setDrawingContext(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild aria-disabled={polygonContext?.length == undefined || polygonContext?.length <= 2}>
        <Button
          variant={"admin"}
          className={josefin_sans.className + " text-white"}
          onClick={() => {
            setAddressAmount([true]);
          }}
        >
          <span className={"-mb-1"}>Salvar Polígono</span>
        </Button>
      </DialogTrigger>

      <DialogContent className={"max-w-none"}>
        <DialogHeader>
          <DialogTitle>Adicionar Praça</DialogTitle>
          <DialogDescription>
            <form action={formAction} onSubmit={() => submitHandler()} ref={formRef}>
              <label htmlFor={"name"}>Nome</label>
              <Input type={"text"} name={"name"} required />

              <label htmlFor={"commonName"}>Nome popular</label>
              <Input type={"text"} name={"commonName"} />

              <label htmlFor={"comments"}>Comentários</label>
              <Input type={"text"} name={"comments"} />

              <Select name={"parkTypes"}>
                {parkTypes.map((value, index) => (
                  <option key={index} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </Select>

              <Select name={"parkCategories"}>
                {parkCategories.map((value, index) => (
                  <option key={index} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </Select>

              <Input type={"hidden"} value={polygonContext?.length} name={"pointsAmount"} />
              {polygonContext?.map((value, index) => (
                <div key={index}>
                  <Input value={value.lat} name={`points[${index}][lat]`} type={"hidden"} />
                  <Input value={value.lng} name={`points[${index}][lng]`} type={"hidden"} />
                </div>
              ))}

              {/* Não acho que isso seja o melhor jeito de renderizar um elemento n número de vezes, muito
                            menos remover ele
                            TODO: procurar um jeito melhor de fazer isso*/}

              {addressAmount.map((value, index) => {
                if (value) {
                  return (
                    <div key={index} className={"flex"}>
                      <div>
                        <label htmlFor={`addresses[${index}][street]`}>Rua</label>
                        <Input name={`addresses[${index}][street]`} className={"w-72"} required />
                      </div>
                      <div>
                        <label htmlFor={`addresses[${index}][number]`}>Número</label>
                        <Input type={"number"} name={`addresses[${index}][number]`} className={"w-72"} required />
                      </div>
                      <div>
                        <label htmlFor={`addresses[${index}][city]`}>Cidade</label>

                        <Input name={`addresses[${index}][city]`} className={"w-72"} required />
                      </div>
                      <div>
                        <label htmlFor={`addresses[${index}][neighborhood]`}>Bairro</label>
                        <Input name={`addresses[${index}][neighborhood]`} className={"w-72"} required />
                      </div>
                      <div>
                        <label htmlFor={`addresses[${index}][state]`}>Estado</label>
                        <Select name={`addresses[${index}][state]`}>
                          {brazillianStates.map((value, index) => (
                            <option value={value} key={index}>
                              {value}
                            </option>
                          ))}
                        </Select>
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
              <Input type={"hidden"} value={addressAmount.length} name={"addressAmount"} />

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

export { PolygonSubmissionForm };
