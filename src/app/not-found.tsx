import { Footer } from "@/app/_components/footer";
import { Header } from "@/app/_components/header";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="flex h-[100vh] items-center justify-center bg-gradient-to-br from-cambridge-blue to-imperial-red">
      <Header variant="fixed" />

      <section className="m-10 flex h-full w-full flex-col items-center justify-center gap-2 sm:m-0 sm:gap-4">
        <div className="text-center font-bold text-white">
          <h1 className="-mb-1 text-7xl sm:-mb-4 sm:text-8xl">404</h1>
          <h2 className="text-2xl sm:text-7xl">Página não encontrada!</h2>
          <p className="sm:text-3xl">
            Ops, não era para você ter chegado aqui!
          </p>
        </div>
        <Button>
          <span className="-mb-1 font-bold">Denunciar Erro</span>
        </Button>
      </section>

      <Footer variant={"fixed"} />
    </main>
  );
};

export default NotFound;
