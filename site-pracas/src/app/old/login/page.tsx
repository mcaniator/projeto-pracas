"use client";

import Header from "@/components/old/header";
import Footer from "@/components/old/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  InstagramLogoIcon,
  SketchLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";

const Login = () => {
  let forms: any;

  return (
    <main className="flex h-[100vh] flex-col bg-black/30 bg-temporario-bg bg-cover text-white bg-blend-darken">
      <Header isLogin className="bg-transparent drop-shadow-none" />
      <div className="flex h-full items-center justify-center">
        <div className="flex h-[512px] w-96 flex-col items-center justify-center gap-7 rounded-md bg-white px-5 text-black">
          <div className="flex items-center">
            <Image src="/logo.png" width={50} height={50} alt="Foto da logo" />
            <span className="whitespace-pre-wrap"> Projeto Praças</span>
          </div>
          <p className="text-center">
            Faça seu login abaixo para acessar as funcionalidades de avaliação e
            administrativo
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <p>Email</p>
              <Input disabled type="email" placeholder="email" />
            </div>
            <div>
              <p>Senha</p>
              <Input disabled type="password" placeholder="senha" />
            </div>
            <Button asChild>
              <Link href="/admin">Ir para admin</Link>
            </Button>
          </div>

          <hr className="h-[2px] w-full rounded-lg border-0 bg-primary/60 px-6" />

          <div className="flex w-full flex-wrap gap-2 pt-1">
            <div className="grid w-full grid-cols-5 justify-items-center">
              <GitHubLogoIcon className="h-8 w-8" />
              <TwitterLogoIcon className="h-8 w-8" />
              <InstagramLogoIcon className="h-8 w-8" />
              <DiscordLogoIcon className="h-8 w-8" />
              <SketchLogoIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
      <Footer className="mt-auto bg-transparent" isLogin />
    </main>
  );
};

export default Login;
