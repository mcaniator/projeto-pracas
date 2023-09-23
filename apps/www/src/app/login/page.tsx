import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const Login = () => {
  return (
    <main className="flex h-[100vh] items-center justify-center bg-gradient-to-br from-cambridge-blue to-vista-blue">
      <Header className="top-0" />

      <section className="flex aspect-video h-[38vw] gap-10 rounded-2.5xl bg-off-white p-12 shadow-lg">
        <div className="flex basis-1/2 flex-col gap-5">
          <h1 className="text-4xl font-bold">Entrar</h1>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div>
                <p>email:</p>
                <Input type="email" />
              </div>
              <div>
                <p>senha:</p>
                <Input type="password" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="manterLogin" />
                <label
                  htmlFor="manterLogin"
                  className="-mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Manter login
                </label>
              </div>
              <Button asChild>
                <Link href={"/admin"}>
                  <span className="-mb-1">Entrar</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button>
              <span className="-mb-1">Entrar com a Apple</span>
            </Button>
            <Button>
              <span className="-mb-1">Entrar com a Google</span>
            </Button>
          </div>
        </div>

        <div className="flex basis-1/2 flex-col gap-5">
          <h1 className="text-4xl font-bold">Criar</h1>
          <div className="flex flex-col gap-3">
            <div>
              <p>email:</p>
              <Input type="email" />
            </div>
            <div>
              <p>senha:</p>
              <Input type="password" />
            </div>
            <div>
              <p>confirmar senha:</p>
              <Input type="password" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center space-x-2">
              <Checkbox id="termos" />
              <label
                htmlFor="termos"
                className="-mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Concordo com os termos
              </label>
            </div>
            <Button>
              <span className="-mb-1">Criar</span>
            </Button>
          </div>
        </div>
      </section>

      <Footer className="fixed bottom-0 w-full text-white" />
    </main>
  );
};

export default Login;
