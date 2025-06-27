import { Josefin_Sans, Karla, Shanti, Titillium_Web } from "next/font/google";

const titillium_web = Titillium_Web({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});

const josefin_sans = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});

const karla = Karla({ subsets: ["latin"] });

const shanti = Shanti({ subsets: ["latin"], weight: ["400"] });

export { titillium_web, josefin_sans, karla, shanti };
