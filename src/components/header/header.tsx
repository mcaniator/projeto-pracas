"use client";

import { Button } from "@/components/button";
import { useNetwork } from "@/components/context/networkContext";
import ButtonLink from "@/components/ui/buttonLink";
import CButton from "@/components/ui/cButton";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import { useLogout } from "@/lib/serverFunctions/apiCalls/auth";
import { Capacitor } from "@capacitor/core";
import {
  Chip,
  ClickAwayListener,
  Divider,
  Paper,
  Popper,
  Slide,
} from "@mui/material";
import {
  IconInfoSquareRounded,
  IconLogin2,
  IconMapSearch,
  IconMenu2,
  IconTree,
  IconWifi,
  IconWifiOff,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import { enqueueSnackbar } from "notistack";
import {
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { GrUserAdmin } from "react-icons/gr";

type HeaderVariant = "public" | "admin";
type HeaderPosition = "static" | "box";
type HeaderColorType = "filled" | "translucid";

interface HeaderProps extends HTMLAttributes<HTMLElement> {
  user?: {
    username: string | null;
    email: string;
    image: string | null;
  } | null;
  variant: HeaderVariant;
  position?: HeaderPosition;
  colorType?: HeaderColorType;
}

const Header = forwardRef<HTMLElement, HeaderProps>(
  (
    {
      user = null,
      variant,
      position = "static",
      colorType = "filled",
      className,
      ...props
    },
    ref,
  ) => {
    const isDebug = process.env.NEXT_PUBLIC_DEBUG === "true";
    const { isConnected, setNetworkStatus, setServerOnline } = useNetwork();
    const [openUserPopper, setOpenUserPopper] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [userPopperAnchorEl, setUserPopperAnchorEl] =
      useState<null | HTMLElement>(null);
    const isPublic = variant === "public";
    const isAdmin = variant === "admin";

    useEffect(() => {
      setIsSidebarVisible(false);
    }, []);

    const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);
    const closeSidebar = () => setIsSidebarVisible(false);

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        closeSidebar();
      }
    };

    const sidebarOptions: {
      icon: ReactNode;
      name: string;
      path: string;
    }[] = [
      {
        icon: <IconMapSearch size={34} />,
        name: "Mapa",
        path: "/map",
      },
      {
        icon: <IconInfoSquareRounded size={34} />,
        name: "Sobre",
        path: "/about",
      },
    ];

    return (
      <>
        {isPublic && (
          <>
            <button
              onClick={toggleSidebar}
              type="button"
              aria-label="Abrir menu"
              className="fixed left-4 top-1 z-[61] items-center"
            >
              {!isSidebarVisible && <IconMenu2 size={34} />}
            </button>

            {isSidebarVisible && (
              <div
                className="fixed inset-0 z-[61] bg-black bg-opacity-50"
                onClick={handleOverlayClick}
              ></div>
            )}

            <nav
              className={cn(
                "fixed left-0 top-0 z-[62] flex h-full w-64 flex-col bg-main p-5 text-xl shadow-lg transition-transform duration-300",
                isSidebarVisible ? "translate-x-0" : "-translate-x-full",
                titillium_web.className,
              )}
            >
              <div className="mb-4 flex justify-between">
                <Link className="flex items-center" href="/">
                  <Button
                    type={"button"}
                    variant={"ghost"}
                    use={"link"}
                    className="px-1 py-5"
                  >
                    <IconTree size={34} />
                    Projeto Praças
                  </Button>
                </Link>
                <Button
                  variant={"ghost"}
                  onPress={closeSidebar}
                  className="cursor-pointer gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
                >
                  <IconX size={34} />
                </Button>
              </div>

              <div className="flex h-full flex-col gap-1">
                {sidebarOptions.map((option) => (
                  <ButtonLink
                    href={option.path}
                    key={option.path}
                    variant={"ghost"}
                    className="w-full justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
                  >
                    {option.icon}
                    <span className="-mb-1">{option.name}</span>
                  </ButtonLink>
                ))}
                <ButtonLink
                  href={"/admin/map"}
                  key={"/admin/map"}
                  variant={"ghost"}
                  className="mt-auto w-full justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
                >
                  <GrUserAdmin size={24} />
                  <span className="-mb-1">{"Pesquisador"}</span>
                </ButtonLink>
              </div>
            </nav>
          </>
        )}

        <header
          className={cn(
            titillium_web.className,
            "flex w-full py-1 pl-14 pr-7 transition-all",
            position === "box" && "relative z-[60] mx-2 mt-2 rounded-2xl",
            colorType === "translucid" ?
              "fixed inset-x-0 top-0 z-[60] bg-main opacity-20 backdrop-blur-[2px]"
            : "static",
            className,
          )}
          ref={ref}
          {...props}
        >
          <div className="z-[50] flex items-center px-3">
            <IconTree size={34} />
            <span className="hidden text-xl sm:block">Projeto Praças</span>
            {!isConnected && (
              <Chip
                icon={<IconWifiOff />}
                label="Offline"
                size="small"
                color="error"
              />
            )}
          </div>
          {Capacitor.isNativePlatform() && isDebug && (
            <CButton
              square
              onClick={() => {
                setNetworkStatus(!isConnected);
                setServerOnline(!isConnected);
              }}
            >
              <IconWifi />
            </CButton>
          )}
          {isAdmin && user && (
            <>
              <div className="z-[50] ml-auto flex items-center px-3 pl-2">
                <Chip
                  label="Painel"
                  color="secondary"
                  icon={<GrUserAdmin size={18} />}
                  className="ml-2"
                  onClick={(e) => {
                    setUserPopperAnchorEl(e.currentTarget);
                    setOpenUserPopper((prev) => !prev);
                  }}
                />
              </div>

              <Popper
                open={openUserPopper}
                anchorEl={userPopperAnchorEl}
                transition
              >
                {({ TransitionProps }) => (
                  <ClickAwayListener
                    onClickAway={() => {
                      setOpenUserPopper(false);
                      setUserPopperAnchorEl(null);
                    }}
                  >
                    <Slide direction="left" {...TransitionProps} timeout={100}>
                      <Paper sx={{ p: 2, mr: 1 }} elevation={3}>
                        <UserInfo user={user} />
                      </Paper>
                    </Slide>
                  </ClickAwayListener>
                )}
              </Popper>
            </>
          )}

          {isAdmin && !user && (
            <div className="z-[50] ml-auto flex flex-wrap gap-1">
              <Link href="/auth/login">
                <Button
                  variant={"ghost"}
                  use={"link"}
                  className="ml-auto flex items-center px-3 py-6 pl-2"
                >
                  <IconLogin2 />
                  Entrar
                </Button>
              </Link>
            </div>
          )}
        </header>
      </>
    );
  },
);

Header.displayName = "Header";

const UserInfo = ({
  user,
}: {
  user: { username: string | null; email: string };
}) => {
  const router = useRouter();
  const [logout, loggingOut] = useLogout({
    callbacks: {
      onSuccess: () => {
        enqueueSnackbar("Logout realizado com sucesso!", {
          variant: "success",
        });
        router.replace("/");
      },
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <span className="-mb-1 text-base font-semibold text-black sm:text-xl">
            {user.username ?? "(usuário)"}
          </span>
          <span className="-mb-1 text-xs text-gray-500 sm:text-sm">
            {user.email}
          </span>
        </div>
      </div>
      <Divider />
      <div className="flex w-full items-center">
        <div className="ml-auto">
          <CButton
            loading={loggingOut}
            onClick={() => {
              void logout();
            }}
          >
            <span className="-mb-1 flex gap-1">
              <IconLogin2 /> Log out
            </span>
          </CButton>
        </div>
      </div>
    </div>
  );
};

export { Header };
export type { HeaderVariant, HeaderPosition, HeaderColorType };
