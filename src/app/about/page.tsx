import { titillium_web } from "@/lib/fonts";
import { IconMapPin } from "@tabler/icons-react";
import Image from "next/image";

const AboutPage = () => {
  return (
    <main
      className={`${titillium_web.className} relative min-h-[calc(100dvh-5rem)] overflow-x-hidden bg-gradient-to-br from-cambridge-blue via-olivine to-asparagus p-2 text-white`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/10 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full border border-off-white/30" />

      <section className="relative mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-4xl flex-col items-center justify-center gap-8 py-12 text-center md:px-10">
        <div className="w-full rounded-3xl border border-white/25 bg-black/10 p-8 backdrop-blur-[2px] md:p-10">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm uppercase tracking-[0.16em]">
            <IconMapPin size={16} />
            Sobre o Projeto
          </p>

          <h1 className="text-4xl leading-tight sm:text-5xl">
            Projeto Praças UFJF
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/90 sm:text-xl">
            Projeto desenvolvido pelo Departamento de Ciência da Computação e
            pela Faculdade de Arquitetura e Urbanismo da Universidade Federal de
            Juiz de Fora (UFJF), com apoio da Pró-Reitoria de Extensão da UFJF.
          </p>
        </div>

        <div className="grid w-full">
          <article className="flex justify-center">
            <Image
              src={"/Logo-proex.jpg"}
              alt="Logo da PROEX"
              className="rounded-md"
              width={360}
              height={60}
            />
          </article>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
