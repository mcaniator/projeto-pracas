import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconLogin } from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "./ui/button";

const LoginButton = () => {
  return (
    <Popover>
      <PopoverTrigger className="ml-auto">
        <Button
          asChild
          variant={"ghost"}
          className="flex items-center px-3 py-6 pl-2"
        >
          <div>
            <IconLogin size={34} />
            <span className="pointer-events-none text-2xl sm:text-3xl ">
              Login
            </span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="z-[10000000] mr-7 rounded-2xl border-0 bg-white/20 backdrop-blur-lg">
        <Tabs defaultValue="login">
          <TabsList className="bg-transparent">
            <TabsTrigger value="login">
              <span className="-mb-1">Login</span>
            </TabsTrigger>
            <TabsTrigger value="create">
              <span className="-mb-1">Criar conta</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent className="flex w-full rounded-lg" value="login">
            <Button
              variant={"ghost"}
              className="bg-white/20 text-white shadow-lg"
            >
              <Link href="/admin">Ir para admin</Link>
            </Button>
          </TabsContent>
          <TabsContent value="create">
            <div>temp</div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default LoginButton;
