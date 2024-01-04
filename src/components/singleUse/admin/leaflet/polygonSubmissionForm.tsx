"use client";

import { PolygonContext } from "@/components/singleUse/admin/leaflet/createPolygon";
import { DrawingContext } from "@/components/singleUse/admin/leaflet/leafletProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { josefin_sans, titillium_web } from "@/lib/fonts";
import { mapSubmission } from "@/lib/serverActions/parkSubmit";
import { IconX } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

const PolygonSubmissionForm = () => {
  const { polygonContext, setPolygonContext } = useContext(PolygonContext);
  const [isDirty, setIsDirty] = useState(true);
  const [open, setOpen] = useState<boolean | undefined>(undefined);
  const { setDrawingContext } = useContext(DrawingContext);

  // used for shallow routing and tab selection
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <Dialog open={open}>
      <Button
        aria-disabled={polygonContext.length <= 2}
        variant={"admin"}
        className={josefin_sans.className + " text-white"}
        onClick={() => {
          setOpen(true);
        }}
      >
        <span className={"-mb-1"}>Salvar Polígono</span>
      </Button>

      <DialogContent disabledClose={true} className={"gap-2 bg-white"}>
        <DialogHeader>
          <div className="flex items-center">
            <DialogTitle className={"flex gap-2"}>
              <span
                className={
                  titillium_web.className +
                  " cursor-pointer text-4xl opacity-50 transition-all hover:opacity-80 aria-disabled:pointer-events-none aria-disabled:opacity-100 aria-disabled:hover:cursor-none"
                }
                onClick={() => {
                  if (!isDirty || window.confirm("Os dados não foram enviados.\nGostaria de sair mesmo assim?")) {
                    setIsDirty(false);
                    router.replace(pathname + "?" + createQueryString("tab", "basic"));
                  }
                }}
                aria-disabled={currentTab == "basic" || currentTab == undefined}
              >
                Básico
              </span>
              <span
                className={
                  titillium_web.className +
                  " cursor-pointer text-4xl opacity-50 transition-all hover:opacity-80 aria-disabled:pointer-events-none aria-disabled:opacity-100 aria-disabled:hover:cursor-none"
                }
                onClick={() => {
                  if (!isDirty || window.confirm("Os dados não foram enviados.\nGostaria de sair mesmo assim?")) {
                    setIsDirty(false);
                    router.replace(pathname + "?" + createQueryString("tab", "extra"));
                  }
                }}
                aria-disabled={currentTab == "extra"}
              >
                Extra
              </span>
            </DialogTitle>
            <div className="ml-auto">
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => {
                  if (!isDirty || window.confirm("Os dados não foram enviados.\nGostaria de fechar mesmo assim?")) {
                    setIsDirty(false);
                    setOpen(false);
                    if (polygonContext.length === 0) setTimeout(() => setDrawingContext(false), 100);
                  }
                }}
              >
                <IconX />
              </Button>
            </div>
          </div>
          <DialogDescription className={"m-0"}>
            {currentTab == "basic" || currentTab == undefined ?
              "Conteúdo mínimo necessário para a criação de uma praça"
            : "Informações adicionais que podem ser adicionados à uma praça"}
          </DialogDescription>
        </DialogHeader>

        {currentTab == "basic" || currentTab == undefined ?
          <BasicForm polygonContext={polygonContext} setPolygonContext={setPolygonContext} setIsDirty={setIsDirty} />
        : <ExtraForm setIsDirty={setIsDirty} />}
      </DialogContent>
    </Dialog>
  );
};

const SubmitButton = (props: {
  form: string;
  state: {
    statusCode: number;
  };
}) => {
  const [submitButtonState, setSubmitButtonState] = useState<"admin" | "constructive" | "destructive">("admin");
  const { pending } = useFormStatus();
  const hasSent = useRef(false);
  const { statusCode } = props.state;
  useEffect(() => {
    if (pending && !hasSent.current) hasSent.current = true;

    if (!pending && hasSent.current) {
      if (statusCode === 0) setSubmitButtonState("constructive");
      else setSubmitButtonState("destructive");
    }

    setTimeout(() => setSubmitButtonState("admin"), 1000);
  }, [pending, statusCode]);

  return (
    <Button variant={submitButtonState} className={"text-white"} form={props.form} aria-disabled={pending}>
      <span className={"-mb-1"}>Enviar</span>
    </Button>
  );
};

const BasicForm = (props: {
  polygonContext: {
    lat: number;
    lng: number;
  }[];
  setPolygonContext: Dispatch<
    SetStateAction<
      {
        lat: number;
        lng: number;
      }[]
    >
  >;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState(mapSubmission, { statusCode: 0 });

  const { setIsDirty } = props;
  const [formState, setFormState] = useState({
    name: "",
    firstStreet: "",
    secondStreet: "",
  });
  const isDirtyReferenceValue = useRef({ name: "", firstStreet: "", secondStreet: "" });
  useEffect(() => {
    setIsDirty(!(JSON.stringify(isDirtyReferenceValue.current) === JSON.stringify(formState)));
  }, [formState, setIsDirty]);

  return (
    <form
      id={"basicForm"}
      action={formAction}
      ref={formRef}
      onSubmit={() => {
        setTimeout(() => {
          formRef.current?.reset();
          props.setPolygonContext([]);

          setIsDirty(false);
          isDirtyReferenceValue.current = formState;
        }, 1);
      }}
      className={"flex flex-col gap-2"}
    >
      <div>
        <div>
          <div className={"translate-y-1"}>
            <label htmlFor={"name"} className={""}>
              Nome
            </label>
          </div>
          <Input
            type={"text"}
            name={"name"}
            id={"name"}
            autoComplete={"off"}
            variant={"white"}
            onChange={(event) => setFormState({ ...formState, name: event.target.value })}
            value={formState.name}
            required
          />
        </div>

        <div className={"flex flex-col"}>
          <div className={"translate-y-1"}>
            <label htmlFor={"firstStreet"}>Primeira Rua</label>{" "}
          </div>
          <Input
            type={"text"}
            name={"firstStreet"}
            id={"firstStreet"}
            variant={"white"}
            onChange={(event) => setFormState({ ...formState, firstStreet: event.target.value })}
            value={formState.firstStreet}
            required
          />
        </div>

        <div>
          <div className={"translate-y-1"}>
            <label htmlFor={"secondStreet"}>Segunda Rua</label>{" "}
          </div>
          <Input
            type={"text"}
            name={"secontStreet"}
            id={"secondStreet"}
            variant={"white"}
            onChange={(event) => setFormState({ ...formState, secondStreet: event.target.value })}
            value={formState.secondStreet}
            required
          />
        </div>

        <div className="hidden">
          <Input type={"hidden"} value={props.polygonContext.length} name={"amountPoints"} />
          {props.polygonContext.map((value, index) => (
            <div key={index}>
              <Input value={value.lat} name={`points[${index}].lat`} type={"hidden"} />
              <Input value={value.lng} name={`points[${index}].lng`} type={"hidden"} />
            </div>
          ))}
        </div>
      </div>

      <SubmitButton form={"basicForm"} state={state} />
    </form>
  );
};

const ExtraForm = (props: { setIsDirty: Dispatch<SetStateAction<boolean>> }) => {
  props.setIsDirty(false);
  return <span>tchau</span>;
};

export { PolygonSubmissionForm };
