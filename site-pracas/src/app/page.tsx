import {
  IconLeaf,
  IconLogin,
  IconPlant2,
  IconSeeding,
  IconTree,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import HomeHeader from "@/components/homeHeader";
import fotoPraca from "/public/bg-praca-jf-1.jpg";
import Footer from "@/components/footer";

const Home = () => {
  return (
    <main className="bg-off-white">
      <HomeHeader />

      <div className="flex h-[97vh] flex-col bg-gradient-to-br from-cambridge-blue to-asparagus">
        <div className="pointer-events-none absolute h-[97vh] w-full overflow-clip">
          <IconLeaf className="absolute h-96 w-96 -translate-x-28 translate-y-24 rotate-[20deg] stroke-1 text-seasick-green sm:h-[700px] sm:w-[700px] sm:-translate-x-40 sm:translate-y-12" />
          <IconPlant2 className=" absolute bottom-0 right-0 h-96 w-96 translate-x-32 translate-y-24 -rotate-[35deg] stroke-1 text-seasick-green sm:h-[700px] sm:w-[700px] sm:translate-x-60 sm:translate-y-40" />
        </div>

        <section className="flex h-full items-center justify-center px-2 text-white sm:px-[20%] lg:px-[25%]">
          <div className="grid gap-4">
            <div className="relative z-10 col-span-2">
              <h1 className=" text-center text-7xl font-bold leading-tight">
                Texto aqui blah blah blah blah blah blah
              </h1>
            </div>
            <div className="relative z-10 col-span-2 flex w-full items-center justify-center sm:col-auto sm:justify-end">
              <Button className="w-48 px-0" size={"lg"}>
                <span className="-mb-1 font-bold">Ver praças</span>
              </Button>
            </div>
            <div className="relative z-10 col-span-2 flex w-full items-center justify-center sm:col-auto sm:justify-start">
              <Button className="w-48 px-0" size={"lg"}>
                <span className="-mb-1 font-bold">Comparar praças</span>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <div className="overflow-x-clip">
        <div className="relative">
          <svg
            width="4000"
            height="44"
            viewBox="0 0 4000 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -translate-y-[43px]"
          >
            <path
              d="M100 20C66.6667 -6.66667 33.3333 -6.66667 0 20V43.4084H4000V20C3966.67 46.6667 3933.33 46.6667 3900 20C3866.67 -6.66667 3833.33 -6.66667 3800 20C3766.67 46.6667 3733.33 46.6667 3700 20C3666.67 -6.66667 3633.33 -6.66667 3600 20C3566.67 46.6667 3533.33 46.6667 3500 20C3466.67 -6.66667 3433.33 -6.66667 3400 20C3366.67 46.6667 3333.33 46.6667 3300 20C3266.67 -6.66667 3233.33 -6.66667 3200 20C3166.67 46.6667 3133.33 46.6667 3100 20C3066.67 -6.66667 3033.33 -6.66667 3000 20C2966.67 46.6667 2933.33 46.6667 2900 20C2866.67 -6.66667 2833.33 -6.66667 2800 20C2766.67 46.6667 2733.33 46.6667 2700 20C2666.67 -6.66667 2633.33 -6.66667 2600 20C2566.67 46.6667 2533.33 46.6667 2500 20C2466.67 -6.66667 2433.33 -6.66667 2400 20C2366.67 46.6667 2333.33 46.6667 2300 20C2266.67 -6.66667 2233.33 -6.66667 2200 20C2166.67 46.6667 2133.33 46.6667 2100 20C2066.67 -6.66667 2033.33 -6.66667 2000 20C1966.67 46.6667 1933.33 46.6667 1900 20C1866.67 -6.66667 1833.33 -6.66667 1800 20C1766.67 46.6667 1733.33 46.6667 1700 20C1666.67 -6.66667 1633.33 -6.66667 1600 20C1566.67 46.6667 1533.33 46.6667 1500 20C1466.67 -6.66667 1433.33 -6.66667 1400 20C1366.67 46.6667 1333.33 46.6667 1300 20C1266.67 -6.66667 1233.33 -6.66667 1200 20C1166.67 46.6667 1133.33 46.6667 1100 20C1066.67 -6.66667 1033.33 -6.66667 1000 20C966.667 46.6667 933.333 46.6667 900 20C866.667 -6.66667 833.333 -6.66667 800 20C766.667 46.6667 733.333 46.6667 700 20C666.667 -6.66667 633.333 -6.66667 600 20C566.667 46.6667 533.333 46.6667 500 20C466.667 -6.66667 433.333 -6.66667 400 20C366.667 46.6667 333.333 46.6667 300 20C266.667 -6.66667 233.333 -6.66667 200 20C166.667 46.6667 133.333 46.6667 100 20Z"
              fill="#D9D9D9"
            />
          </svg>
        </div>

        <article className="flex flex-col items-center gap-20 p-10 pt-20 sm:p-32 xl:flex-row xl:items-start xl:justify-center">
          <Image
            src={fotoPraca}
            alt="foto praça jf"
            className="h-auto w-[100vw] -rotate-12 shadow-lg sm:w-[610px] sm:-translate-x-8"
          />
          <div className="mt-7 flex h-full max-w-md flex-col gap-1">
            <h1 className="text-3xl font-bold">Mais texto sobre o projeto</h1>
            <p>
              Sunt voluptate exercitation do labore duis ipsum. Qui occaecat
              labore labore dolore deserunt irure velit ut. Enim excepteur eu do
              velit incididunt. Sunt adipisicing occaecat exercitation esse eu
              duis sunt fugiat dolore est. Tempor commodo culpa exercitation
              minim ipsum deserunt quis. Qui adipisicing nisi adipisicing mollit
              laborum aliquip. Commodo minim nisi ea cupidatat tempor laborum
              cillum nisi id ipsum. Culpa officia enim ut sit minim nostrud sunt
              proident ex eiusmod.
            </p>
          </div>
        </article>

        <div className="flex justify-center">
          <IconSeeding className="text-gray-400" size={70} />
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Home;
