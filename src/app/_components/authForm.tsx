"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { titillium_web } from "@/lib/fonts";
import { signin, signup } from "@/serverActions/auth";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { redirect } from "next/navigation";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";

const AuthForm = () => {
  const [loginSelected, setLoginSelected] = useState(true);
  const [parent] = useAutoAnimate();
  const username = useRef("");

  return (
    <div className="flex flex-col gap-2" ref={parent}>
      <div className="flex gap-2">
        <span
          className={
            titillium_web.className +
            " cursor-pointer select-none text-4xl opacity-50 transition-all aria-disabled:pointer-events-none aria-disabled:opacity-100 hover:opacity-80 aria-disabled:hover:cursor-none"
          }
          aria-disabled={loginSelected}
          onClick={() => {
            setLoginSelected(true);
          }}
        >
          Login
        </span>
        <span
          className={
            titillium_web.className +
            " cursor-pointer select-none text-4xl opacity-50 transition-all aria-disabled:pointer-events-none aria-disabled:opacity-100 hover:opacity-80 aria-disabled:hover:cursor-none"
          }
          aria-disabled={!loginSelected}
          onClick={() => {
            setLoginSelected(false);
          }}
        >
          Criar
        </span>
      </div>

      {loginSelected ?
        <Login username={username} />
      : <Signup username={username} />}
    </div>
  );
};

const Login = (props: { username: MutableRefObject<string> }) => {
  const [state, formAction] = useFormState(signin, { statusCode: 0 });
  const errorRef = useRef<HTMLDivElement>(null);

  if (errorRef.current !== null && state.statusCode !== 0) {
    errorRef.current.style.opacity = "1";
    const copy = errorRef.current;
    setTimeout(() => (copy.style.opacity = "0"), 5000);
  }

  return (
    <form action={formAction} className="flex w-80 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col">
          <label htmlFor="username" className="-mb-1">
            Nome de Usuário:
          </label>
          <Input
            name="username"
            defaultValue={props.username.current}
            onChange={(event) => (props.username.current = event.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="-mb-1">
            Senha:
          </label>
          <Input name="password" type="password" />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div ref={errorRef} className="opacity-0 transition-opacity">
          <div className="rounded-2xl border-4 border-redwood px-2 py-1">
            <p className={"-mb-1 self-end font-semibold text-redwood"}>
              Dados incorretos!
            </p>
          </div>
        </div>
        <Button type="submit" className="ml-auto text-white">
          <span className="-mb-1">Entrar</span>
        </Button>
      </div>
    </form>
  );
};

const Signup = (props: { username: MutableRefObject<string> }) => {
  const [state, formAction] = useFormState(signup, { statusCode: -1 });

  useEffect(() => {
    if (state.statusCode === 0) redirect("/admin");
  }, [state]);

  return (
    <form action={formAction} className="flex w-80 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col">
          <label htmlFor="username" className="-mb-1">
            Nome de Usuário:
          </label>
          <Input
            name="username"
            defaultValue={props.username.current}
            onChange={(event) => (props.username.current = event.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="-mb-1">
            Senha:
          </label>
          <Input name="password" type="password" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="passwordConfirmation" className="-mb-1">
            Confirmar Senha:
          </label>
          <Input name="passwordConfirmation" type="password" />
        </div>
      </div>

      <div className="ml-auto flex gap-1">
        <Button type="submit" className="text-white">
          <span className="-mb-1">Criar</span>
        </Button>
      </div>
    </form>
  );
};

export { AuthForm };
