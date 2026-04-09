import { cn } from "@lib/cn";
import { IconTree } from "@tabler/icons-react";
import Link from "next/link";

const AuthPageShell = ({
  children,
  contentClassName,
  showMobileWave = false,
  showIllustration = true,
  centerContent = false,
}: {
  children: React.ReactNode;
  contentClassName?: string;
  showMobileWave?: boolean;
  showIllustration?: boolean;
  centerContent?: boolean;
}) => {
  return (
    <div className="relative flex min-h-0 flex-1 items-start justify-center overflow-y-auto overflow-x-hidden bg-gradient-to-br from-cambridge-blue to-asparagus lg:items-center">
      {showIllustration && (
        <div
          className={cn(
            "absolute right-60 hidden h-full w-full sm:right-60 sm:top-0 lg:left-0 lg:block",
            showMobileWave && "block lg:block",
          )}
        >
          <img
            src="/loginWave.svg"
            className="h-full w-full object-cover"
            alt=""
          />
        </div>
      )}

      {showIllustration && (
        <div className="z-10 hidden h-full flex-col items-center justify-center gap-12 pt-20 lg:flex lg:w-1/2">
          <img
            className="max-w-[600px]"
            src="/loginPraca.svg"
            alt="Ilustração de uma praça para páginas de autenticação"
          />
          <div className="flex gap-4 text-asparagus">
            <Link
              className="flex items-center transition-transform duration-300 ease-in-out hover:scale-105"
              href="/"
            >
              <IconTree size={56} className="inline" />
              <h1 className="inline text-5xl">Projeto praças</h1>
            </Link>
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative z-10 mt-20 flex w-full flex-col items-center justify-start gap-4 p-8 pb-10 pt-16 text-center lg:justify-center lg:pt-10",
          showIllustration && !centerContent && "lg:w-1/2",
          centerContent && "mx-auto max-w-3xl",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthPageShell;
