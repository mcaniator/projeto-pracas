import Header from "@/components/old/header";
import Footer from "@/components/old/footer";

const Home = () => {
  return (
    <main>
      <div className="absolute -z-10 h-[85vh] w-full bg-black/10 bg-praca-jf bg-cover bg-blend-darken" />
      <Header />

      <section className="flex h-[85vh] flex-col justify-center gap-14 px-32 text-white">
        <h1 className="text-6xl font-bold">Projeto Praças.</h1>
        <p className="text-xl font-light">Um Projeto........</p>
      </section>

      <article className="z-10 -my-24 mx-20 rounded-md bg-white p-20 drop-shadow-lg">
        <p>Hello</p>
      </article>

      <Footer />
    </main>
  );
};

export default Home;
