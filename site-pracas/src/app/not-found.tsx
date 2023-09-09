import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="to-imperial-red flex h-[100vh] items-center justify-center bg-gradient-to-br from-cambridge-blue">
      <Header className="top-0" />

      <section className="m-10 flex h-full w-full flex-col items-center justify-center gap-2 sm:m-0 sm:gap-4">
        <div className="text-center font-bold text-white">
          <h1 className="-mb-1 text-7xl sm:-mb-4 sm:text-8xl">404</h1>
          <h2 className="text-2xl sm:text-7xl">Página não encontrada!</h2>
          <p className="sm:text-3xl">
            Ops, não era para você ter chegado aqui!
          </p>
        </div>
        <Button className="flex items-center justify-center" size={"lg"}>
          <span className="-mb-1 font-bold">Denunciar Erro</span>
        </Button>
      </section>

      <Footer className="fixed bottom-0 w-full text-white" />
    </main>
  );
};

export default NotFound;
