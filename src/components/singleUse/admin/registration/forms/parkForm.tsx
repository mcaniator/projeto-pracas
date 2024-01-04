"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidate, searchLocals } from "@/lib/serverActions/localUtil";
import { Form } from "@prisma/client";
import { Dispatch, SetStateAction, Suspense, createContext, use, useDeferredValue, useEffect, useState } from "react";

import { LocalComponent } from "../../parks/localComponent";

const initialState = {
  message: "",
};

const ChangedContext = createContext<{
  changedContext: number;
  setChangedContext: Dispatch<SetStateAction<number>>;
}>({ changedContext: 0, setChangedContext: () => 0 });

const LocalList = ({ localsPromise }: { localsPromise?: Promise<Form[]> }) => {
  if (localsPromise === undefined) return null;
  const locals = use(localsPromise);
  return (
    <div className="w-full text-black">
      {locals.length > 0 && locals.map((local) => <LocalComponent key={local.id} id={local.id} nome={local.nome} />)}
    </div>
  );
};

const ParkForm = () => {
  const [changed, setChanged] = useState(0);
  const [targetLocal, setTargetLocal] = useState("");
  const [foundLocals, setFoundLocals] = useState<Promise<Form[]>>();
  useEffect(() => {
    setFoundLocals(searchLocals(targetLocal));
  }, [targetLocal, changed]);
  const deferredFoundLocals = useDeferredValue(foundLocals);
  //   const isStale = foundLocals !== deferredFoundLocals;

  // TODO: add error handling
  return (
    <>
      <div className={"flex flex-col gap-2"}>
        <label htmlFor={"name"}>Buscar pelo nome:</label>
        <Input
          type="text"
          name="name"
          required
          id={"name"}
          autoComplete={"none"}
          value={targetLocal}
          onChange={(e) => setTargetLocal(e.target.value)}
        />
      </div>
      <Button variant={"admin"} type="submit" className={"w-min"} onClick={() => revalidate()}>
        <span className={"-mb-1"}>Revalidar</span>
      </Button>
      <Suspense>
        <ChangedContext.Provider value={{ changedContext: changed, setChangedContext: setChanged }}>
          <LocalList localsPromise={deferredFoundLocals} />
        </ChangedContext.Provider>
      </Suspense>
    </>
  );
};

export { ParkForm, LocalList, ChangedContext };
