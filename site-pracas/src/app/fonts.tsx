import { Titillium_Web, Josefin_Sans } from "next/font/google";

const titillium_web = Titillium_Web({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

const josefin_sans = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});

export { titillium_web, josefin_sans };
